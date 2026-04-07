import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { generateTokens } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { authRateLimiter } from '../middleware/rate-limiter.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).max(100),
  language: z.enum(['en', 'am', 'es']).default('en'),
}).refine(data => data.email || data.phone, {
  message: 'Email or phone is required',
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  otp: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: 'Email or phone is required',
});

// POST /api/v1/auth/register
authRouter.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check if user exists
    if (body.email) {
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.email, body.email),
      });
      if (existing) throw new AppError(409, 'USER_EXISTS', 'Email already registered');
    }

    if (body.phone) {
      const existing = await db.query.users.findFirst({
        where: eq(schema.users.phone, body.phone),
      });
      if (existing) throw new AppError(409, 'USER_EXISTS', 'Phone already registered');
    }

    const passwordHash = body.password ? await bcrypt.hash(body.password, 12) : undefined;

    const [user] = await db.insert(schema.users).values({
      email: body.email,
      phone: body.phone,
      passwordHash,
      language: body.language,
    }).returning();

    if (!user) throw new AppError(500, 'CREATE_FAILED', 'Failed to create user');

    // Create empty profile
    await db.insert(schema.profiles).values({
      userId: user.id,
      firstName: body.firstName,
      displayName: body.firstName,
      dateOfBirth: new Date('2000-01-01'),
      gender: 'other',
    });

    // Create default preferences
    await db.insert(schema.userPreferences).values({
      userId: user.id,
    });

    const tokens = generateTokens({
      userId: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, phone: user.phone },
        tokens,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    let user;
    if (body.email) {
      user = await db.query.users.findFirst({
        where: eq(schema.users.email, body.email),
      });
    } else if (body.phone) {
      user = await db.query.users.findFirst({
        where: eq(schema.users.phone, body.phone),
      });
    }

    if (!user) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');

    if (body.password && user.passwordHash) {
      const valid = await bcrypt.compare(body.password, user.passwordHash);
      if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Update last active
    await db.update(schema.users)
      .set({ lastActiveAt: new Date() })
      .where(eq(schema.users.id, user.id));

    const tokens = generateTokens({
      userId: user.id,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
    });

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError(400, 'MISSING_TOKEN', 'Refresh token required');

    // In production, verify refresh token and issue new pair
    res.json({
      success: true,
      data: { message: 'Token refresh endpoint - implement with refresh token verification' },
    });
  } catch (err) {
    next(err);
  }
});
