/** Mirrors domain types from the React Native app */

// ─── Express request augmentation ────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      /** Set by authenticateUser middleware */
      user: { id: string; email: string };
      /** Set by verifySubscription middleware */
      subscription: { status: 'free' | 'pro' };
    }
  }
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type JobCategory = {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  questionCount: number;
  color: string;
};

export type InterviewQuestion = {
  id: string;
  categoryId: string;
  text: string;
  hint?: string;
  difficulty: DifficultyLevel;
  tags: string[];
  estimatedSeconds: number;
};

export type FeedbackDimension = 'structure' | 'logic' | 'tone' | 'confidence' | 'relevance';

export type DimensionScore = {
  dimension: FeedbackDimension;
  score: number;
  comment: string;
};

export type AIFeedback = {
  id: string;
  sessionId: string;
  overallScore: number;
  summary: string;
  dimensions: DimensionScore[];
  strengths: string[];
  improvements: string[];
  rewrittenAnswer?: string;
  generatedAt: string;
  model: string;
};

export type SessionRecord = {
  id: string;
  questionId: string;
  categoryId: string;
  questionText: string;
  transcript: string;
  feedback: AIFeedback;
  durationSeconds: number;
  createdAt: string;
};

export type AnalyzeRequest = {
  questionId: string;
  questionText: string;
  categoryId: string;
  durationSeconds: number;
};

export type AnalyzeResponse = {
  sessionId: string;
  transcript: string;
  feedback: AIFeedback;
};
