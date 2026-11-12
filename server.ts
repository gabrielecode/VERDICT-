import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { decisions, options, votes, comments, members, users } from './src/db/schema.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { eq, desc, and } from 'drizzle-orm';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Get all decisions
  app.get('/api/decisions', requireAuth, async (req, res) => {
    try {
      const allDecisions = await db.query.decisions.findMany({
        with: {
          creator: true,
          options: true,
          votes: true,
          comments: {
            orderBy: [desc(comments.timestamp)]
          },
        },
        orderBy: [desc(decisions.createdAt)]
      });
      res.json(allDecisions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch decisions' });
    }
  });

  // Create a new decision
  app.post('/api/decisions', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const { title, description, category, type, deadline, audience, options: opts, attachments } = req.body;
    try {
      const [newDecision] = await db.insert(decisions).values({
        title,
        description,
        category,
        type,
        deadline: new Date(deadline),
        audience,
        creatorUid: req.user.uid,
        attachments: attachments || [],
      }).returning();

      if (opts && opts.length > 0) {
        await db.insert(options).values(
          opts.map((o: any) => ({
            decisionId: newDecision.id,
            text: o.text,
          }))
        );
      }

      res.json(newDecision);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create decision' });
    }
  });

  // Vote on a decision
  app.post('/api/decisions/:id/vote', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const decisionId = parseInt(req.params.id as string);
    const { optionIds, ratingValue } = req.body;
    try {
      // Upsert vote (one per user per decision)
      const existingVote = await db.query.votes.findFirst({
        where: and(eq(votes.userId, req.user.uid), eq(votes.decisionId, decisionId))
      });

      if (existingVote) {
        return res.status(400).json({ error: 'Already voted' });
      }

      const [newVote] = await db.insert(votes).values({
        userId: req.user.uid,
        decisionId,
        optionIds: optionIds || [],
        ratingValue: ratingValue || null,
      }).returning();

      res.json(newVote);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to record vote' });
    }
  });

  // Add a comment
  app.post('/api/decisions/:id/comments', requireAuth, async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send();
    const decisionId = parseInt(req.params.id as string);
    const { text, author, avatar, role } = req.body;
    try {
      const [newComment] = await db.insert(comments).values({
        userId: req.user.uid,
        decisionId,
        author: author || req.user.name || 'Anonymous',
        avatar: avatar || req.user.picture || null,
        role: role || null,
        text,
      }).returning();
      res.json(newComment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  // Get members
  app.get('/api/members', requireAuth, async (req, res) => {
    try {
      const allMembers = await db.select().from(members);
      res.json(allMembers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  });

  // Add member
  app.post('/api/members', requireAuth, async (req, res) => {
    try {
      const [newMember] = await db.insert(members).values(req.body).returning();
      res.json(newMember);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  });

  // Delete member
  app.delete('/api/members/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(members).where(eq(members.id, parseInt(req.params.id as string)));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete member' });
    }
  });

  // Update member status
  app.patch('/api/members/:id', requireAuth, async (req, res) => {
    try {
      const [updated] = await db.update(members)
        .set({ status: req.body.status })
        .where(eq(members.id, parseInt(req.params.id as string)))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update member' });
    }
  });

  // Delete decision
  app.delete('/api/decisions/:id', requireAuth, async (req, res) => {
    try {
      await db.delete(decisions).where(eq(decisions.id, parseInt(req.params.id as string)));
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete decision' });
    }
  });

  // Extend deadline
  app.patch('/api/decisions/:id/extend', requireAuth, async (req, res) => {
    try {
      const { deadline } = req.body;
      const [updated] = await db.update(decisions)
        .set({ deadline: new Date(deadline) })
        .where(eq(decisions.id, parseInt(req.params.id as string)))
        .returning();
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to extend deadline' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
