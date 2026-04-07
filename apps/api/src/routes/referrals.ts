import { Router } from 'express';
import { and, eq, or } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const referralRouter = Router();

referralRouter.use(authenticate);

// GET /api/v1/referrals
referralRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const type = req.query.type as string; // 'made' | 'received' | 'for_me'

    let condition;
    if (type === 'made') {
      condition = eq(schema.referrals.referrerId, userId);
    } else if (type === 'for_me') {
      condition = eq(schema.referrals.referredForId, userId);
    } else {
      condition = or(
        eq(schema.referrals.referrerId, userId),
        eq(schema.referrals.referredForId, userId),
        eq(schema.referrals.candidateId, userId),
      );
    }

    const referralList = await db.select()
      .from(schema.referrals)
      .where(condition!)
      .orderBy(schema.referrals.createdAt);

    res.json({ success: true, data: referralList });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/referrals
referralRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { referredForId, candidateId, message } = req.body;

    if (referredForId === candidateId) {
      throw new AppError(400, 'INVALID_REFERRAL', 'Cannot refer someone to themselves');
    }

    const [referral] = await db.insert(schema.referrals).values({
      referrerId: userId,
      referredForId,
      candidateId,
      message,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }).returning();

    res.status(201).json({ success: true, data: referral });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/referrals/:id/respond
referralRouter.patch('/:id/respond', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const referralId = req.params.id;
    const { action } = req.body; // 'accept' | 'decline'

    const referral = await db.query.referrals.findFirst({
      where: and(
        eq(schema.referrals.id, referralId),
        eq(schema.referrals.referredForId, userId),
      ),
    });

    if (!referral) throw new AppError(404, 'REFERRAL_NOT_FOUND', 'Referral not found');

    const [updated] = await db.update(schema.referrals)
      .set({
        status: action === 'accept' ? 'accepted' : 'declined',
        respondedAt: new Date(),
      })
      .where(eq(schema.referrals.id, referralId))
      .returning();

    // If accepted, create a referral-mode match
    if (action === 'accept') {
      const [user1Id, user2Id] = [userId, referral.candidateId].sort();
      await db.insert(schema.matches).values({
        user1Id,
        user2Id,
        mode: 'referral',
        referralId: referral.id,
        compatibilityScore: referral.compatibilityScore,
      }).onConflictDoNothing();
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});
