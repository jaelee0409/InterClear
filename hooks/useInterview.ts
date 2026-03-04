/**
 * Orchestration hook for a single interview session.
 * Coordinates: audio recorder → AI submission → store updates.
 * Screens should use this hook instead of calling services directly.
 */
import { useCallback } from 'react';
import { useInterviewStore } from '@/store/interviewStore';
import { useAudioRecorder } from './useAudioRecorder';
import { useSubmitForFeedback } from '@/queries/useInterviewQueries';
import type { InterviewQuestion } from '@/domain/interview/types';
import { MOCK_FEEDBACK } from '@/domain/feedback/types';

// Baked in at build time — only true when EXPO_PUBLIC_DEV_UNLIMITED_SESSIONS=true in .env.local
const DEV_UNLIMITED = process.env.EXPO_PUBLIC_DEV_UNLIMITED_SESSIONS === 'true';

export function useInterview(question: InterviewQuestion, categoryId: string = '') {
  const store = useInterviewStore();
  const recorder = useAudioRecorder();
  const submitMutation = useSubmitForFeedback();

  const begin = useCallback(async () => {
    const session = {
      id: `session-${Date.now()}`,
      questionId: question.id,
      question,
      startedAt: new Date().toISOString(),
      status: 'idle' as const,
    };
    store.startSession(session);
    store.updateStatus('recording');
    await recorder.startRecording();
  }, [question, store, recorder]);

  const finish = useCallback(async () => {
    const uri = await recorder.stopRecording();
    if (!uri) return;

    store.completeRecording(uri, recorder.elapsedSeconds);

    if (DEV_UNLIMITED) {
      await new Promise<void>((r) => setTimeout(r, 1500));
      store.applyFeedback({
        ...MOCK_FEEDBACK,
        id: `feedback-${Date.now()}`,
        sessionId: question.id,
        generatedAt: new Date().toISOString(),
      });
      return;
    }

    await submitMutation.mutateAsync({
      questionId: question.id,
      questionText: question.text,
      categoryId,
      audioUri: uri,
      durationSeconds: recorder.elapsedSeconds,
    });
  }, [recorder, store, submitMutation, question, categoryId]);

  // Finalizes a completed session into recentSessions, or discards an incomplete one.
  const restart = useCallback(() => {
    recorder.resetRecording();
    if (store.currentSession?.status === 'complete') {
      store.finalizeSession();
    } else {
      store.resetSession();
    }
    submitMutation.reset();
  }, [recorder, store, submitMutation]);

  return {
    // Recorder passthrough
    recordingState: recorder.recordingState,
    elapsedSeconds: recorder.elapsedSeconds,
    audioUri: recorder.audioUri,
    recordingError: recorder.error,

    // Session state
    session: store.currentSession,
    isSubmitting: submitMutation.isPending || (DEV_UNLIMITED && store.currentSession?.status === 'processing'),
    submitError: submitMutation.error,

    // Actions
    begin,
    finish,
    restart,
  };
}
