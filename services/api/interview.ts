/**
 * Interview service — wraps API calls.
 * EXPO_PUBLIC_MOCK_DATA=true  → use local hardcoded constants (no Supabase)
 * EXPO_PUBLIC_MOCK_DATA=false → fetch categories/questions from Supabase;
 *                               session history comes from the Express backend.
 */
import type { JobCategory, InterviewQuestion, DifficultyLevel } from '@/domain/interview/types';
import { JOB_CATEGORIES, MOCK_QUESTIONS } from '@/domain/interview/constants';
import { supabase } from '@/services/supabase';
import { apiClient } from './client';
import type { ApiSession } from './types';

// Default to local data in dev unless EXPO_PUBLIC_MOCK_DATA=false is set explicitly
const IS_MOCK =
  process.env.EXPO_PUBLIC_MOCK_DATA !== 'false' &&
  (__DEV__ || process.env.EXPO_PUBLIC_MOCK_DATA === 'true');

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQuestion(row: Record<string, any>): InterviewQuestion {
  return {
    id: row.id,
    categoryId: row.category_id,
    text: row.text,
    hint: row.hint ?? undefined,
    difficulty: row.difficulty as DifficultyLevel,
    tags: row.tags ?? [],
    estimatedSeconds: row.estimated_seconds,
  };
}

async function getCategories(): Promise<JobCategory[]> {
  if (IS_MOCK) {
    await delay(300);
    return JOB_CATEGORIES;
  }
  const { data, error } = await supabase
    .from('categories')
    .select('*, questions(count)')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    labelEn: row.label_en,
    icon: row.icon,
    description: row.description,
    questionCount: Number((row.questions as Array<{ count: unknown }>)[0]?.count ?? 0),
    color: row.color,
  }));
}

async function getQuestions(categoryId: string): Promise<InterviewQuestion[]> {
  if (IS_MOCK) {
    await delay(300);
    return MOCK_QUESTIONS[categoryId] ?? [];
  }
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('category_id', categoryId)
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapQuestion);
}

async function getQuestion(id: string): Promise<InterviewQuestion | null> {
  if (IS_MOCK) {
    for (const questions of Object.values(MOCK_QUESTIONS)) {
      const q = questions.find((q) => q.id === id);
      if (q) return q;
    }
    return null;
  }
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapQuestion(data);
}

async function getSessionHistory(): Promise<ApiSession[]> {
  try {
    return await apiClient.get<ApiSession[]>('/sessions');
  } catch {
    return [];
  }
}

export const interviewService = {
  getCategories,
  getQuestions,
  getQuestion,
  getSessionHistory,
};
