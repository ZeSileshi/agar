import { Router } from 'express';
import { and, eq, ne } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const referralProfileRouter = Router();

referralProfileRouter.use(authenticate);

/** Verify the current user is a referrer */
async function requireReferrer(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  if (user.userType !== 'referrer') {
    throw new AppError(403, 'NOT_REFERRER', 'Only referrer users can manage referral profiles');
  }

  return user;
}

// POST /api/v1/referral-profiles — Create a referral profile
referralProfileRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await requireReferrer(userId);

    const { firstName, age, gender, bio, personalityDescription, interests, locationCity } = req.body;

    if (!firstName || !age || !gender) {
      throw new AppError(400, 'MISSING_FIELDS', 'firstName, age, and gender are required');
    }

    if (typeof age !== 'number' || age < 18 || age > 120) {
      throw new AppError(400, 'INVALID_AGE', 'Age must be a number between 18 and 120');
    }

    const validGenders = ['male', 'female', 'non_binary', 'other'];
    if (!validGenders.includes(gender)) {
      throw new AppError(400, 'INVALID_GENDER', `Gender must be one of: ${validGenders.join(', ')}`);
    }

    const [profile] = await db.insert(schema.referralProfiles).values({
      createdByUserId: userId,
      firstName,
      age,
      gender,
      bio: bio || null,
      personalityDescription: personalityDescription || null,
      interests: interests || [],
      locationCity: locationCity || null,
    }).returning();

    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/referral-profiles — List referral profiles (for discovery by other referrers)
referralProfileRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await requireReferrer(userId);

    const onlyMine = req.query.mine === 'true';

    const condition = onlyMine
      ? eq(schema.referralProfiles.createdByUserId, userId)
      : and(
          eq(schema.referralProfiles.isActive, true),
          ne(schema.referralProfiles.createdByUserId, userId),
        );

    const profiles = await db.select()
      .from(schema.referralProfiles)
      .where(condition!)
      .orderBy(schema.referralProfiles.createdAt);

    res.json({ success: true, data: profiles });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/referral-profiles/:id — Get single referral profile
referralProfileRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await requireReferrer(userId);

    const profile = await db.query.referralProfiles.findFirst({
      where: eq(schema.referralProfiles.id, req.params.id),
    });

    if (!profile) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Referral profile not found');
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/referral-profiles/:id — Update referral profile
referralProfileRouter.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await requireReferrer(userId);

    // Verify ownership
    const existing = await db.query.referralProfiles.findFirst({
      where: and(
        eq(schema.referralProfiles.id, req.params.id),
        eq(schema.referralProfiles.createdByUserId, userId),
      ),
    });

    if (!existing) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Referral profile not found or you do not own it');
    }

    const { firstName, age, gender, bio, personalityDescription, interests, locationCity, isActive } = req.body;

    if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
      throw new AppError(400, 'INVALID_AGE', 'Age must be a number between 18 and 120');
    }

    if (gender !== undefined) {
      const validGenders = ['male', 'female', 'non_binary', 'other'];
      if (!validGenders.includes(gender)) {
        throw new AppError(400, 'INVALID_GENDER', `Gender must be one of: ${validGenders.join(', ')}`);
      }
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (firstName !== undefined) updateData.firstName = firstName;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (personalityDescription !== undefined) updateData.personalityDescription = personalityDescription;
    if (interests !== undefined) updateData.interests = interests;
    if (locationCity !== undefined) updateData.locationCity = locationCity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await db.update(schema.referralProfiles)
      .set(updateData)
      .where(eq(schema.referralProfiles.id, req.params.id))
      .returning();

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/referral-profiles/:id — Delete referral profile
referralProfileRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    await requireReferrer(userId);

    // Verify ownership
    const existing = await db.query.referralProfiles.findFirst({
      where: and(
        eq(schema.referralProfiles.id, req.params.id),
        eq(schema.referralProfiles.createdByUserId, userId),
      ),
    });

    if (!existing) {
      throw new AppError(404, 'PROFILE_NOT_FOUND', 'Referral profile not found or you do not own it');
    }

    await db.delete(schema.referralProfiles)
      .where(eq(schema.referralProfiles.id, req.params.id));

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
});
