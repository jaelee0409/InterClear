import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../services/supabase';

const FREE_SESSIONS_PER_DAY = 1;

/**
 * Blocks free-tier users who have already used their daily session.
 * Pro users skip this check entirely.
 * Call after verifySubscription so req.subscription is available.
 */
export async function enforceDailyLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.subscription.status === 'pro') {
    next();
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data } = await supabaseAdmin
    .from('usage_tracking')
    .select('mock_sessions_used')
    .eq('user_id', req.user.id)
    .eq('date', today)
    .maybeSingle();

  const used = data?.mock_sessions_used ?? 0;

  if (used >= FREE_SESSIONS_PER_DAY) {
    res.status(429).json({
      error: '오늘의 무료 연습 횟수를 모두 사용했습니다.',
      code: 'DAILY_LIMIT_EXCEEDED',
      limit: FREE_SESSIONS_PER_DAY,
      used,
    });
    return;
  }

  next();
}
