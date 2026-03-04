import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

/**
 * Service-role client — bypasses Row Level Security.
 * Never expose this key to the frontend.
 * Use only in backend middleware and controllers.
 */
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  { auth: { persistSession: false } },
);
