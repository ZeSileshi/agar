import { Router } from 'express';
import { and, eq, ne, notInArray, sql, gte, lte } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

export const discoveryRouter = Router();

discoveryRouter.use(authenticate);

// GET /api/v1/discovery/feed
discoveryRouter.get('/feed', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const minCompatibility = Number(req.query.minCompatibility) || 0;

    // Get current user's profile
    const myProfile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId),
    });

    if (!myProfile) {
      res.json({ success: true, data: { profiles: [], hasMore: false } });
      return;
    }

    // Get users already swiped on
    const swipedIds = await db.select({ targetId: schema.swipes.targetId })
      .from(schema.swipes)
      .where(eq(schema.swipes.swiperId, userId));

    const excludeIds = [userId, ...swipedIds.map(s => s.targetId)];

    // Find candidates matching preferences
    const candidates = await db.select({
      profile: schema.profiles,
      user: schema.users,
      compatScore: schema.compatibilityScores.overallScore,
    })
      .from(schema.profiles)
      .innerJoin(schema.users, eq(schema.profiles.userId, schema.users.id))
      .leftJoin(
        schema.compatibilityScores,
        and(
          eq(schema.compatibilityScores.user1Id, userId),
          eq(schema.compatibilityScores.user2Id, schema.profiles.userId),
        ),
      )
      .where(
        and(
          notInArray(schema.profiles.userId, excludeIds),
          eq(schema.users.isActive, true),
          eq(schema.users.isOnboarded, true),
          // Gender preference matching
          myProfile.genderPreference !== 'everyone'
            ? eq(schema.profiles.gender, myProfile.genderPreference)
            : undefined,
          // Age range
          gte(schema.profiles.dateOfBirth,
            new Date(new Date().setFullYear(new Date().getFullYear() - myProfile.ageRangeMax))),
          lte(schema.profiles.dateOfBirth,
            new Date(new Date().setFullYear(new Date().getFullYear() - myProfile.ageRangeMin))),
        ),
      )
      .orderBy(sql`COALESCE(${schema.compatibilityScores.overallScore}, 50) DESC`)
      .limit(limit);

    // Format response
    const profiles = candidates.map(c => ({
      userId: c.profile.userId,
      displayName: c.profile.displayName,
      age: Math.floor((Date.now() - c.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      bio: c.profile.bio,
      interests: c.profile.interests,
      compatibilityScore: c.compatScore ?? 50,
      locationCity: c.profile.locationCity,
      isOnline: c.user.lastActiveAt > new Date(Date.now() - 15 * 60 * 1000),
    }));

    res.json({
      success: true,
      data: {
        profiles,
        hasMore: candidates.length === limit,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/discovery/swipe
discoveryRouter.post('/swipe', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { targetId, action } = req.body;

    // Record swipe
    await db.insert(schema.swipes).values({
      swiperId: userId,
      targetId,
      action,
    }).onConflictDoUpdate({
      target: [schema.swipes.swiperId, schema.swipes.targetId],
      set: { action, createdAt: new Date() },
    });

    // Check for mutual like
    let matched = false;
    if (action === 'like' || action === 'super_like') {
      const reciprocal = await db.query.swipes.findFirst({
        where: and(
          eq(schema.swipes.swiperId, targetId),
          eq(schema.swipes.targetId, userId),
        ),
      });

      if (reciprocal && (reciprocal.action === 'like' || reciprocal.action === 'super_like')) {
        // Create match!
        const [user1Id, user2Id] = [userId, targetId].sort();
        await db.insert(schema.matches).values({
          user1Id,
          user2Id,
          mode: 'self',
          status: 'matched',
        }).onConflictDoNothing();
        matched = true;
      }
    }

    res.json({
      success: true,
      data: { matched },
    });
  } catch (err) {
    next(err);
  }
});
