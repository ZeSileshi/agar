import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const compatibilityRouter = Router();

compatibilityRouter.use(authenticate);

// GET /api/v1/compatibility/:targetUserId
compatibilityRouter.get('/:targetUserId', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const targetId = req.params.targetUserId;

    // Check cache first
    const [id1, id2] = [userId, targetId].sort();
    let cached = await db.query.compatibilityScores.findFirst({
      where: and(
        eq(schema.compatibilityScores.user1Id, id1),
        eq(schema.compatibilityScores.user2Id, id2),
      ),
    });

    if (cached) {
      res.json({
        success: true,
        data: {
          overallScore: cached.overallScore,
          breakdown: {
            behavioral: cached.behavioralScore,
            western: cached.westernScore,
            vedic: cached.vedicScore,
            chinese: cached.chineseScore,
            palmistry: cached.palmistryScore,
            profile: cached.profileScore,
          },
          confidence: cached.confidence,
          insights: cached.insights,
          calculatedAt: cached.calculatedAt,
        },
      });
      return;
    }

    // Calculate compatibility (in production, this would call the matching engine)
    // For now, return a placeholder
    res.json({
      success: true,
      data: {
        overallScore: 0,
        breakdown: {},
        confidence: 0,
        insights: [],
        message: 'Compatibility calculation pending - matching engine will compute this',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/compatibility/calculate
compatibilityRouter.post('/calculate', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      throw new AppError(400, 'MISSING_TARGET', 'Target user ID is required');
    }

    // Get birth data for both users
    const [myBirth, theirBirth] = await Promise.all([
      db.query.birthData.findFirst({ where: eq(schema.birthData.userId, userId) }),
      db.query.birthData.findFirst({ where: eq(schema.birthData.userId, targetUserId) }),
    ]);

    const [myProfile, theirProfile] = await Promise.all([
      db.query.profiles.findFirst({ where: eq(schema.profiles.userId, userId) }),
      db.query.profiles.findFirst({ where: eq(schema.profiles.userId, targetUserId) }),
    ]);

    if (!myProfile || !theirProfile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'One or both profiles not found');
    }

    // TODO: Call matching engine to compute full compatibility
    // For now, compute a basic profile-based score
    const sharedInterests = (myProfile.interests as string[]).filter(
      i => (theirProfile.interests as string[]).includes(i),
    );

    const interestScore = sharedInterests.length > 0
      ? Math.min(100, (sharedInterests.length / Math.max((myProfile.interests as string[]).length, 1)) * 100)
      : 30;

    const overallScore = Math.round(interestScore * 0.4 + 50 * 0.6); // Basic placeholder

    // Cache result
    const [id1, id2] = [userId, targetUserId].sort();
    await db.insert(schema.compatibilityScores).values({
      user1Id: id1,
      user2Id: id2,
      overallScore,
      profileScore: interestScore,
      confidence: myBirth && theirBirth ? 0.8 : 0.3,
      insights: sharedInterests.length > 0
        ? [`You share ${sharedInterests.length} interests`]
        : ['Add more interests to improve matching'],
    }).onConflictDoUpdate({
      target: [schema.compatibilityScores.user1Id, schema.compatibilityScores.user2Id],
      set: { overallScore, calculatedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        overallScore,
        sharedInterests,
        confidence: myBirth && theirBirth ? 0.8 : 0.3,
      },
    });
  } catch (err) {
    next(err);
  }
});
