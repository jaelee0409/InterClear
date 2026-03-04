import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';

/**
 * Reads subscription_status from the users table and attaches req.subscription.
 * Uses maybeSingle() so a missing user row defaults to 'free' (safe fallback).
 * When billing is added later, this middleware does not change —
 * the payment provider webhook just updates users.subscription_status in Supabase.
 */
export async function verifySubscription(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('subscription_status, subscription_expires_at')
    .eq('id', req.user.id)
    .maybeSingle();

  if (!data) {
    // Row not yet created (trigger may not have fired yet in dev) — default to free
    req.subscription = { status: 'free' };
    next();
    return;
  }

  const isExpired =
    data.subscription_expires_at !== null &&
    new Date(data.subscription_expires_at) < new Date();

  req.subscription = {
    status: isExpired ? 'free' : (data.subscription_status as 'free' | 'pro'),
  };

  next();
}
