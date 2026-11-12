import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Sync user to database
    await db.insert(users)
      .values({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: decodedToken.email || '',
          displayName: decodedToken.name || null,
          photoURL: decodedToken.picture || null,
        },
      });

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
