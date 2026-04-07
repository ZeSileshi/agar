import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const userRouter = Router();

userRouter.use(authenticate);

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'other']).optional(),
  genderPreference: z.enum(['male', 'female', 'everyone']).optional(),
  interests: z.array(z.string()).optional(),
  relationshipGoal: z.string().optional(),
  height: z.number().min(100).max(250).optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  maxDistance: z.number().min(1).max(500).optional(),
  ageRangeMin: z.number().min(18).max(100).optional(),
  ageRangeMax: z.number().min(18).max(100).optional(),
}).partial();

// GET /api/v1/users/me
userRouter.get('/me', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    const profile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId),
    });

    if (!profile) throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');

    const photos = await db.query.photos.findMany({
      where: eq(schema.photos.userId, userId),
      orderBy: (photos, { asc }) => [asc(photos.order)],
    });

    const birth = await db.query.birthData.findFirst({
      where: eq(schema.birthData.userId, userId),
    });

    res.json({
      success: true,
      data: { profile, photos, birthData: birth },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/me/profile
userRouter.patch('/me/profile', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const body = updateProfileSchema.parse(req.body);

    const [updated] = await db.update(schema.profiles)
      .set({
        ...body,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        displayName: body.firstName ? body.firstName + (body.lastName ? ` ${body.lastName}` : '') : undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.userId, userId))
      .returning();

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/users/me/birth-data
userRouter.put('/me/birth-data', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const body = req.body;

    // Upsert birth data
    const existing = await db.query.birthData.findFirst({
      where: eq(schema.birthData.userId, userId),
    });

    if (existing) {
      const [updated] = await db.update(schema.birthData)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(schema.birthData.userId, userId))
        .returning();
      res.json({ success: true, data: updated });
    } else {
      const [created] = await db.insert(schema.birthData)
        .values({ ...body, userId })
        .returning();
      res.status(201).json({ success: true, data: created });
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/me/location
userRouter.patch('/me/location', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { latitude, longitude, city, country } = req.body;

    await db.update(schema.profiles)
      .set({
        locationLat: latitude,
        locationLng: longitude,
        locationCity: city,
        locationCountry: country,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.userId, userId));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
