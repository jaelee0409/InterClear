/** Types shared between the app's service layer and the backend API contract */
import type { AIFeedback } from '@/domain/feedback/types';

export type AnalyzeResponse = {
  sessionId: string;
  transcript: string;
  feedback: AIFeedback;
};

/** Raw session row returned by GET /api/sessions (Supabase snake_case columns) */
export type ApiSession = {
  id: string;
  user_id: string;
  question_id: string;
  category_id: string;
  question_text: string;
  transcript: string;
  feedback: AIFeedback;
  feedback_type: 'basic' | 'advanced';
  duration_seconds: number;
  created_at: string;
};
