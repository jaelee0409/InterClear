/**
 * AI Service — abstracted behind an interface.
 *
 * BackendAIService (default): proxies through your Express backend
 *   → Whisper STT → GPT-4o feedback
 *
 * MockAIService: instant fake feedback, used when EXPO_PUBLIC_USE_MOCK=true
 *   or when the backend is unreachable in dev.
 *
 * Switch: change the export at the bottom.
 */
import type { AIFeedback } from '@/domain/feedback/types';
import { MOCK_FEEDBACK } from '@/domain/feedback/types';
import { apiClient } from './client';
import type { AnalyzeResponse } from './types';

// ─── Contract ─────────────────────────────────────────────────────────────────

export type SubmitAnswerPayload = {
  questionId: string;
  questionText: string;
  categoryId: string;
  audioUri: string;
  durationSeconds: number;
};

export interface AIServiceProvider {
  /** Upload audio → Whisper STT → GPT-4o feedback (via backend) */
  submitForFeedback(payload: SubmitAnswerPayload): Promise<AIFeedback>;
  /** Transcribe only (not used in current flow but kept for flexibility) */
  transcribeAudio(audioUri: string): Promise<string>;
}

// ─── Backend service (production) ─────────────────────────────────────────────

class BackendAIService implements AIServiceProvider {
  async submitForFeedback(payload: SubmitAnswerPayload): Promise<AIFeedback> {
    const formData = new FormData();

    // React Native FormData accepts { uri, type, name } for files
    formData.append('audio', {
      uri: payload.audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);

    formData.append('questionId', payload.questionId);
    formData.append('questionText', payload.questionText);
    formData.append('categoryId', payload.categoryId);
    formData.append('durationSeconds', String(payload.durationSeconds));

    const response = await apiClient.upload<AnalyzeResponse>(
      '/sessions/analyze',
      formData,
    );

    return response.feedback;
  }

  async transcribeAudio(_audioUri: string): Promise<string> {
    // Transcription happens server-side as part of submitForFeedback.
    // Exposed here in case you want a standalone STT endpoint later.
    return '';
  }
}

// ─── Mock service (development / offline) ─────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

class MockAIService implements AIServiceProvider {
  async submitForFeedback(payload: SubmitAnswerPayload): Promise<AIFeedback> {
    await delay(2200);
    return {
      ...MOCK_FEEDBACK,
      id: `feedback-${Date.now()}`,
      sessionId: payload.questionId,
      generatedAt: new Date().toISOString(),
    };
  }

  async transcribeAudio(_audioUri: string): Promise<string> {
    await delay(1200);
    return '안녕하세요. 저는 5년 경력의 풀스택 개발자입니다...';
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
// EXPO_PUBLIC_MOCK_AI=true  → instant fake feedback, no tokens spent
// EXPO_PUBLIC_MOCK_AI=false → real backend: Whisper STT → GPT feedback

const useMockAI = process.env.EXPO_PUBLIC_MOCK_AI === 'true';

export const aiService: AIServiceProvider = useMockAI
  ? new MockAIService()
  : new BackendAIService();
