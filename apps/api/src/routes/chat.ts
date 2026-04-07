import { Router } from 'express';
import { and, eq, or, desc } from 'drizzle-orm';
import { db, schema } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';

export const chatRouter = Router();

chatRouter.use(authenticate);

// GET /api/v1/chat/:matchId/messages
chatRouter.get('/:matchId/messages', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const matchId = req.params.matchId;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const before = req.query.before as string | undefined;

    // Verify user is part of this match
    const match = await db.query.matches.findFirst({
      where: and(
        eq(schema.matches.id, matchId),
        or(
          eq(schema.matches.user1Id, userId),
          eq(schema.matches.user2Id, userId),
        ),
      ),
    });

    if (!match) throw new AppError(404, 'MATCH_NOT_FOUND', 'Match not found');

    const msgs = await db.select()
      .from(schema.messages)
      .where(eq(schema.messages.matchId, matchId))
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit);

    res.json({
      success: true,
      data: msgs.reverse(),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/chat/:matchId/messages
chatRouter.post('/:matchId/messages', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const matchId = req.params.matchId;
    const { content, type = 'text' } = req.body;

    // Verify match
    const match = await db.query.matches.findFirst({
      where: and(
        eq(schema.matches.id, matchId),
        eq(schema.matches.status, 'matched'),
        or(
          eq(schema.matches.user1Id, userId),
          eq(schema.matches.user2Id, userId),
        ),
      ),
    });

    if (!match) throw new AppError(404, 'MATCH_NOT_FOUND', 'Match not found or unmatched');

    const [message] = await db.insert(schema.messages).values({
      matchId,
      senderId: userId,
      content,
      type,
    }).returning();

    // Update match last message time
    await db.update(schema.matches)
      .set({ lastMessageAt: new Date() })
      .where(eq(schema.matches.id, matchId));

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
});
