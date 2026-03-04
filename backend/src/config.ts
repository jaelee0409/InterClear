import 'dotenv/config';

function require_env(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  openaiApiKey: require_env('OPENAI_API_KEY'),
  supabaseUrl: require_env('SUPABASE_URL'),
  supabaseServiceRoleKey: require_env('SUPABASE_SERVICE_ROLE_KEY'),
  // Billing keys added here when payment provider is integrated
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'],
} as const;
