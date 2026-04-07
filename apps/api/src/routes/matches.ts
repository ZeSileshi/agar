import { Router } from 'express';
import { and, eq, or } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

export const matchRouter = Router();

matchRouter.use(authenticate);

// GET /api/v1/matches
matchRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const userMatches = await db.select()
      .from(schema.matches)
      .where(
        and(
          or(
            eq(schema.matches.user1Id, userId),
            eq(schema.matches.user2Id, userId),
          ),
          eq(schema.matches.status, 'matched'),
        ),
      )
      .orderBy(schema.matches.lastMessageAt);

    // Get partner profiles
    const matchesWithProfiles = await Promise.all(
      userMatches.map(async (match) => {
        const partnerId = match.user1Id === userId ? match.user2Id : match.user1Id;
        const profile = await db.query.profiles.findFirst({
          where: eq(schema.profiles.userId, partnerId),
        });
        const photos = await db.query.photos.findMany({
          where: eq(schema.photos.userId, partnerId),
          orderBy: (photos, { asc }) => [asc(photos.order)],
          limit: 1,
        });
        return {
          ...match,
          partner: profile ? {
            userId: profile.userId,
            displayName: profile.displayName,
            primaryPhoto: photos[0]?.url,
          } : null,
        };
      }),
    );

    res.json({ success: true, data: matchesWithProfiles });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/matches/:id
matchRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const matchId = req.params.id;

    await db.update(schema.matches)
      .set({ status: 'unmatched' })
      .where(
        and(
          eq(schema.matches.id, matchId),
          or(
            eq(schema.matches.user1Id, userId),
            eq(schema.matches.user2Id, userId),
          ),
        ),
      );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
