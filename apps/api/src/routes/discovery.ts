import { Router } from 'express';
import { and, eq, ne, notInArray, sql, gte, lte } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const discoveryRouter = Router();

discoveryRouter.use(authenticate);

const DAILY_VIEW_LIMIT = 10;

// GET /api/v1/discovery/feed
discoveryRouter.get('/feed', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    // Get current user record to determine user_type
    const currentUser = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });

    if (!currentUser) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Enforce daily view limit via daily_views table
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const [dailyView] = await db.insert(schema.dailyViews).values({
      userId,
      viewedDate: today,
      viewCount: 0,
    }).onConflictDoUpdate({
      target: [schema.dailyViews.userId, schema.dailyViews.viewedDate],
      set: {}, // no-op update to return the existing row
    }).returning();

    if (!dailyView) {
      throw new AppError(500, 'DAILY_VIEW_ERROR', 'Failed to track daily views');
    }

    const remainingToday = Math.max(0, DAILY_VIEW_LIMIT - dailyView.viewCount);

    if (remainingToday <= 0) {
      res.json({
        success: true,
        data: {
          profiles: [],
          remainingToday: 0,
          hasMore: false,
        },
      });
      return;
    }

    // Referrer users see only referral_profiles
    if (currentUser.userType === 'referrer') {
      const referralResults = await db.select()
        .from(schema.referralProfiles)
        .where(
          and(
            eq(schema.referralProfiles.isActive, true),
            ne(schema.referralProfiles.createdByUserId, userId),
          ),
        )
        .orderBy(sql`${schema.referralProfiles.createdAt} DESC`)
        .limit(remainingToday);

      // Increment view count
      if (referralResults.length > 0) {
        await db.update(schema.dailyViews)
          .set({ viewCount: dailyView.viewCount + referralResults.length })
          .where(
            and(
              eq(schema.dailyViews.userId, userId),
              eq(schema.dailyViews.viewedDate, today),
            ),
          );
      }

      const profiles = referralResults.map(rp => ({
        referralProfileId: rp.id,
        createdByUserId: rp.createdByUserId,
        firstName: rp.firstName,
        age: rp.age,
        gender: rp.gender,
        bio: rp.bio,
        personalityDescription: rp.personalityDescription,
        interests: rp.interests,
        locationCity: rp.locationCity,
      }));

      res.json({
        success: true,
        data: {
          profiles,
          remainingToday: Math.max(0, remainingToday - referralResults.length),
          hasMore: referralResults.length === remainingToday,
        },
      });
      return;
    }

    // Direct users: show opposite sex direct users only
    const myProfile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId),
    });

    if (!myProfile) {
      res.json({ success: true, data: { profiles: [], remainingToday, hasMore: false } });
      return;
    }

    // Determine opposite gender filter for direct users
    const oppositeGender = myProfile.gender === 'male' ? 'female' : 'male';

    // Get users already swiped on
    const swipedIds = await db.select({ targetId: schema.swipes.targetId })
      .from(schema.swipes)
      .where(eq(schema.swipes.swiperId, userId));

    const excludeIds = [userId, ...swipedIds.map(s => s.targetId)];

    // Find candidates: opposite sex, direct users only, with photos and compat score
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
          eq(schema.users.userType, 'direct'),
          eq(schema.profiles.gender, oppositeGender),
          // Age range
          gte(schema.profiles.dateOfBirth,
            new Date(new Date().setFullYear(new Date().getFullYear() - myProfile.ageRangeMax))),
          lte(schema.profiles.dateOfBirth,
            new Date(new Date().setFullYear(new Date().getFullYear() - myProfile.ageRangeMin))),
        ),
      )
      .orderBy(sql`COALESCE(${schema.compatibilityScores.overallScore}, 50) DESC`)
      .limit(remainingToday);

    // Fetch photos for all candidate user IDs
    const candidateUserIds = candidates.map(c => c.profile.userId);
    const photosByUser: Record<string, Array<{ url: string; thumbnailUrl: string; isPrimary: boolean; order: number }>> = {};

    if (candidateUserIds.length > 0) {
      const allPhotos = await db.select()
        .from(schema.photos)
        .where(sql`${schema.photos.userId} IN (${sql.join(candidateUserIds.map(id => sql`${id}`), sql`, `)})`);

      for (const photo of allPhotos) {
        if (!photosByUser[photo.userId]) photosByUser[photo.userId] = [];
        photosByUser[photo.userId]!.push({
          url: photo.url,
          thumbnailUrl: photo.thumbnailUrl,
          isPrimary: photo.isPrimary,
          order: photo.order,
        });
      }
    }

    // Increment view count
    if (candidates.length > 0) {
      await db.update(schema.dailyViews)
        .set({ viewCount: dailyView.viewCount + candidates.length })
        .where(
          and(
            eq(schema.dailyViews.userId, userId),
            eq(schema.dailyViews.viewedDate, today),
          ),
        );
    }

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
      photos: (photosByUser[c.profile.userId] || []).sort((a, b) => a.order - b.order),
    }));

    res.json({
      success: true,
      data: {
        profiles,
        remainingToday: Math.max(0, remainingToday - candidates.length),
        hasMore: candidates.length === remainingToday,
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
    const { targetId, action, giftType, giftMessage } = req.body;

    if (!targetId || !action) {
      throw new AppError(400, 'MISSING_FIELDS', 'targetId and action are required');
    }

    const validActions = ['like', 'love', 'gift', 'skip'];
    if (!validActions.includes(action)) {
      throw new AppError(400, 'INVALID_ACTION', `Action must be one of: ${validActions.join(', ')}`);
    }

    // For gift action, also require giftType
    if (action === 'gift' && !giftType) {
      throw new AppError(400, 'MISSING_GIFT_TYPE', 'giftType is required for gift action');
    }

    // Record swipe
    await db.insert(schema.swipes).values({
      swiperId: userId,
      targetId,
      action,
    }).onConflictDoUpdate({
      target: [schema.swipes.swiperId, schema.swipes.targetId],
      set: { action, createdAt: new Date() },
    });

    // For gift action, create a gift record
    if (action === 'gift') {
      await db.insert(schema.gifts).values({
        senderId: userId,
        receiverId: targetId,
        giftType,
        message: giftMessage || null,
      });
    }

    // Check for mutual like/love (both like and love count as positive interest)
    let matched = false;
    if (action === 'like' || action === 'love' || action === 'gift') {
      const reciprocal = await db.query.swipes.findFirst({
        where: and(
          eq(schema.swipes.swiperId, targetId),
          eq(schema.swipes.targetId, userId),
        ),
      });

      if (reciprocal && (reciprocal.action === 'like' || reciprocal.action === 'love' || reciprocal.action === 'gift')) {
        // Create match
        const [user1Id, user2Id] = [userId, targetId].sort();

        // Fetch compatibility score if available
        const compatRecord = await db.query.compatibilityScores.findFirst({
          where: and(
            eq(schema.compatibilityScores.user1Id, user1Id),
            eq(schema.compatibilityScores.user2Id, user2Id),
          ),
        });

        await db.insert(schema.matches).values({
          user1Id,
          user2Id,
          mode: 'self',
          status: 'matched',
          compatibilityScore: compatRecord?.overallScore ?? null,
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
