import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';

/**
 * Validates the Supabase JWT from the Authorization header.
 * On success, attaches req.user = { id, email }.
 * Rejects with 401 if the token is missing, invalid, or expired.
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = { id: user.id, email: user.email! };
  next();
}
