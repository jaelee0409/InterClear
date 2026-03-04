export type User = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** e.g. '시니어 프론트엔드 개발자' */
  targetRole?: string;
  targetCompany?: string;
  createdAt: string;
};

export type UserStats = {
  totalSessions: number;
  averageScore: number;
  /** Consecutive days with at least one practice session */
  practiceStreakDays: number;
  strongestCategory?: string;
  weakestCategory?: string;
};
