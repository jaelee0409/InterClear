import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '@/services/api/interview';
import { aiService, type SubmitAnswerPayload } from '@/services/api/ai';
import { useInterviewStore } from '@/store/interviewStore';
export type { ApiSession } from '@/services/api/types';

// ─── Query keys — typed, hierarchical ────────────────────────────────────────
export const interviewKeys = {
  all: ['interview'] as const,
  categories: () => [...interviewKeys.all, 'categories'] as const,
  questions: (categoryId: string) =>
    [...interviewKeys.all, 'questions', categoryId] as const,
  history: () => [...interviewKeys.all, 'history'] as const,
  session: (sessionId: string) =>
    [...interviewKeys.all, 'session', sessionId] as const,
} as const;

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: interviewKeys.categories(),
    queryFn: interviewService.getCategories,
  });
}

export function useQuestions(categoryId: string) {
  return useQuery({
    queryKey: interviewKeys.questions(categoryId),
    queryFn: () => interviewService.getQuestions(categoryId),
    enabled: categoryId.length > 0,
  });
}

export function useQuestion(questionId: string | undefined) {
  return useQuery({
    queryKey: [...interviewKeys.all, 'question', questionId] as const,
    queryFn: () => interviewService.getQuestion(questionId!),
    enabled: !!questionId,
  });
}

export function useSessionHistory() {
  return useQuery({
    queryKey: interviewKeys.history(),
    queryFn: interviewService.getSessionHistory,
    staleTime: 1000 * 60 * 2, // 2 min — history changes more often
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useSubmitForFeedback() {
  const qc = useQueryClient();
  const applyFeedback = useInterviewStore((s) => s.applyFeedback);

  return useMutation({
    mutationFn: (payload: SubmitAnswerPayload) => aiService.submitForFeedback(payload),
    onSuccess: (feedback) => {
      applyFeedback(feedback);
      // Invalidate history so it re-fetches on next mount
      qc.invalidateQueries({ queryKey: interviewKeys.history() });
    },
  });
}

export function useTranscribeAudio() {
  const setTranscript = useInterviewStore((s) => s.setTranscript);

  return useMutation({
    mutationFn: (audioUri: string) => aiService.transcribeAudio(audioUri),
    onSuccess: (transcript) => {
      setTranscript(transcript);
    },
  });
}
