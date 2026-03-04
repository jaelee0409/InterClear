/**
 * Interview session state.
 * currentSession  — transient, cleared after each session.
 * recentSessions  — persisted to AsyncStorage (survives restarts).
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InterviewSession, SessionStatus } from '@/domain/interview/types';
import type { AIFeedback } from '@/domain/feedback/types';
import { MOCK_FEEDBACK } from '@/domain/feedback/types';
import { MOCK_QUESTIONS } from '@/domain/interview/constants';

type InterviewState = {
  currentSession: InterviewSession | null;
  recentSessions: InterviewSession[];
};

type InterviewActions = {
  startSession: (session: InterviewSession) => void;
  updateStatus: (status: SessionStatus) => void;
  setTranscript: (transcript: string) => void;
  completeRecording: (audioUri: string, durationSeconds: number) => void;
  applyFeedback: (feedback: AIFeedback) => void;
  finalizeSession: () => void;
  resetSession: () => void;
  seedMockHistory: () => void;
  clearHistory: () => void;
};

export const useInterviewStore = create<InterviewState & InterviewActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ─── State ───────────────────────────────────────────────────────────
        currentSession: null,
        recentSessions: [],

        // ─── Actions ─────────────────────────────────────────────────────────
        startSession: (session) =>
          set({ currentSession: { ...session, status: 'idle' } }),

        updateStatus: (status) =>
          set((s) => ({
            currentSession: s.currentSession ? { ...s.currentSession, status } : null,
          })),

        setTranscript: (transcript) =>
          set((s) => ({
            currentSession: s.currentSession ? { ...s.currentSession, transcript } : null,
          })),

        completeRecording: (audioUri, durationSeconds) =>
          set((s) => ({
            currentSession: s.currentSession
              ? {
                  ...s.currentSession,
                  audioUri,
                  durationSeconds,
                  endedAt: new Date().toISOString(),
                  status: 'processing',
                }
              : null,
          })),

        applyFeedback: (feedback) =>
          set((s) => ({
            currentSession: s.currentSession
              ? { ...s.currentSession, feedback, status: 'complete' }
              : null,
          })),

        finalizeSession: () => {
          const { currentSession, recentSessions } = get();
          if (!currentSession) return;
          // Strip audioUri — local file path is stale after restart
          const { audioUri: _, ...sessionToSave } = currentSession;
          set({
            recentSessions: [sessionToSave, ...recentSessions].slice(0, 50),
            currentSession: null,
          });
        },

        resetSession: () => set({ currentSession: null }),

        seedMockHistory: () => {
          const allQuestions = Object.values(MOCK_QUESTIONS).flat();
          const picks = allQuestions.slice(0, 5);
          const now = Date.now();
          const sessions: InterviewSession[] = picks.map((q, i) => ({
            id: `dev-session-${now}-${i}`,
            questionId: q.id,
            question: q,
            startedAt: new Date(now - (i + 1) * 3_600_000).toISOString(),
            endedAt: new Date(now - (i + 1) * 3_600_000 + 120_000).toISOString(),
            durationSeconds: 90 + i * 15,
            status: 'complete' as const,
            feedback: {
              ...MOCK_FEEDBACK,
              id: `dev-feedback-${now}-${i}`,
              sessionId: `dev-session-${now}-${i}`,
              overallScore: [78, 85, 62, 91, 70][i] ?? 75,
              generatedAt: new Date(now - (i + 1) * 3_600_000 + 130_000).toISOString(),
            },
          }));
          set((s) => ({
            recentSessions: [...sessions, ...s.recentSessions].slice(0, 50),
          }));
        },

        clearHistory: () => set({ recentSessions: [] }),
      }),
      {
        name: '@interviewlab:sessions',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist recentSessions — currentSession is always transient
        partialize: (state) => ({ recentSessions: state.recentSessions }),
      },
    ),
  ),
);
