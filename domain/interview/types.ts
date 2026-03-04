export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SessionStatus =
  | 'idle'
  | 'recording'
  | 'stopped'
  | 'processing'
  | 'complete'
  | 'error';

export type JobCategory = {
  id: string;
  /** Korean display label */
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
  /** Question text in Korean */
  text: string;
  /** Optional tip shown to user before answering */
  hint?: string;
  difficulty: DifficultyLevel;
  tags: string[];
  /** Target answer duration in seconds */
  estimatedSeconds: number;
};

export type InterviewSession = {
  id: string;
  questionId: string;
  question: InterviewQuestion;
  startedAt: string;
  endedAt?: string;
  /** Local filesystem URI from expo-av */
  audioUri?: string;
  /** STT result */
  transcript?: string;
  feedback?: import('@/domain/feedback/types').AIFeedback;
  status: SessionStatus;
  durationSeconds?: number;
};
