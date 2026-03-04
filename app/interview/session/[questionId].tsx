import React, { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { useTheme } from '@/hooks/useTheme';
import { useInterview } from '@/hooks/useInterview';
import { useSpeech } from '@/hooks/useSpeech';
import type { InterviewQuestion } from '@/domain/interview/types';
import { APIError } from '@/services/api/client';
import { useQuestion, useQuestions } from '@/queries/useInterviewQueries';
import { useSettingsStore } from '@/store/settingsStore';
import { Spacing, Radius } from '@/theme/spacing';

function isDailyLimitError(error: unknown): boolean {
  if (!(error instanceof APIError) || error.status !== 429) return false;
  try {
    return JSON.parse(error.body).code === 'DAILY_LIMIT_EXCEEDED';
  } catch {
    return false;
  }
}

/** Local state — only tracks UI phases this component controls directly */
type LocalPhase = 'tts' | 'ready' | 'recording';
/** Full derived phase including async pipeline outcomes */
type UIPhase = LocalPhase | 'processing' | 'complete' | 'error';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SessionScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: question, isLoading } = useQuestion(questionId);

  if (isLoading) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (!question) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.centered}>
          <ThemedText variant="h4" style={styles.loadingText}>
            질문을 찾을 수 없습니다
          </ThemedText>
          <ThemedText color={colors.textSecondary} style={styles.loadingText}>
            카테고리 화면으로 돌아가 다시 시도해 주세요.
          </ThemedText>
          <Button
            label="홈으로 돌아가기"
            variant="secondary"
            size="md"
            onPress={() => router.navigate('/(tabs)/home')}
            style={{ marginTop: 16 }}
          />
        </View>
      </Screen>
    );
  }

  return <SessionContent question={question} />;
}

// ─── Main session logic ───────────────────────────────────────────────────────

function SessionContent({ question }: { question: InterviewQuestion }) {
  const { colors } = useTheme();
  const router = useRouter();
  const interview = useInterview(question, question.categoryId);
  const categoryId = question.categoryId;
  const speech = useSpeech();
  const { data: categoryQuestions = [] } = useQuestions(categoryId);

  const showHints = useSettingsStore((s) => s.showHints);
  const [hintVisible, setHintVisible] = useState(false);
  const [localPhase, setPhase] = useState<LocalPhase>('tts');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  // Derive the rendered phase from local state + async pipeline outcomes.
  // No useEffect sync needed — this is always consistent with the store.
  const phase: UIPhase =
    interview.session?.status === 'complete' ? 'complete' :
    !!interview.submitError ? 'error' :
    (interview.isSubmitting || interview.session?.status === 'processing') ? 'processing' :
    localPhase;

  // Track whether this effect instance is still active (handles React dev double-invoke)
  const ttsActiveRef = useRef(false);

  // Clean up when navigating away mid-session
  useEffect(() => {
    return () => {
      Speech.stop();
      interview.restart();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-play TTS when screen mounts (only if Korean voice is available)
  useEffect(() => {
    ttsActiveRef.current = true;

    const advance = () => {
      if (ttsActiveRef.current) setPhase('ready');
    };

    if (speech.isKoreanAvailable) {
      speech.speak(question.text, advance);
      // Safety net in case TTS callback never fires
      const safetyMs = (question.estimatedSeconds + 2) * 1000;
      const timeout = setTimeout(advance, safetyMs);
      return () => {
        ttsActiveRef.current = false;
        clearTimeout(timeout);
        speech.stop();
      };
    }

    return () => {
      ttsActiveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, speech.isKoreanAvailable]);

  // Skip TTS phase once voice check completes and Korean is unavailable
  useEffect(() => {
    if (speech.isVoiceCheckComplete && !speech.isKoreanAvailable && phase === 'tts') {
      setPhase('ready');
    }
  }, [speech.isVoiceCheckComplete, speech.isKoreanAvailable, phase]);

  async function handleStartAnswer() {
    setPhase('recording');
    await interview.begin();
  }

  async function handleStopAnswer() {
    await interview.finish();
    // phase will update to 'processing' → 'complete' via the useEffect above
  }

  function handleReplay() {
    speech.replay(question.text, () => setPhase('ready'));
    setPhase('tts');
  }

  function handleRestart() {
    interview.restart();
    speech.speak(question.text, () => setPhase('ready'));
    setPhase('tts');
  }

  function handleNextQuestion() {
    // Stop any playing TTS (including FeedbackCard's instance) before leaving
    speech.stop();
    const currentIndex = categoryQuestions.findIndex((q) => q.id === question.id);
    const nextQuestion = categoryQuestions[(currentIndex + 1) % categoryQuestions.length];
    if (!nextQuestion) return;
    // Don't call interview.restart() here — the cleanup useEffect handles it on unmount
    router.replace({
      pathname: '/interview/session/[questionId]',
      params: { questionId: nextQuestion.id, categoryId },
    } as any);
  }

  return (
    <Screen scrollable horizontalPadding edges={['left', 'right']}>

      {/* Question Card — always visible */}
      <Card elevated style={styles.questionCard}>
        <ThemedText variant="labelSmall" color={colors.textSecondary} style={styles.categoryLabel}>
          {categoryId.toUpperCase()} · AI 랜덤 질문
        </ThemedText>
        <ThemedText variant="h3" style={styles.questionText}>
          {question.text}
        </ThemedText>
        {showHints && question.hint && phase !== 'recording' && (
          <>
            <TouchableOpacity
              onPress={() => setHintVisible((v) => !v)}
              style={[styles.hintToggle, { borderColor: colors.primary + '50' }]}
              activeOpacity={0.7}
            >
              <ThemedText variant="labelSmall" color={colors.primary}>
                {hintVisible ? '💡 힌트 숨기기' : '💡 힌트 보기'}
              </ThemedText>
            </TouchableOpacity>
            {hintVisible && (
              <View style={[styles.hintBox, { backgroundColor: colors.primaryLight }]}>
                <ThemedText variant="caption" color={colors.primary}>
                  {question.hint}
                </ThemedText>
              </View>
            )}
          </>
        )}
      </Card>

      {/* ── Phase: TTS playing ─────────────────────────────────────────── */}
      {phase === 'tts' && (
        <View style={styles.phaseContainer}>
          <View style={[styles.speakerCircle, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}>
            <ThemedText style={styles.speakerEmoji}>🔊</ThemedText>
          </View>
          <ThemedText variant="h4" color={colors.primary} style={styles.phaseLabel}>
            질문을 읽어드리고 있습니다
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.textSecondary}>
            잠시 후 답변을 시작할 수 있습니다
          </ThemedText>
          <Button
            label="건너뛰기"
            variant="ghost"
            size="sm"
            onPress={() => {
              speech.stop();
              setPhase('ready');
            }}
          />
          <Button
            label="🔇 소리가 안 들려요"
            variant="ghost"
            size="sm"
            onPress={() => setShowVoiceHelp((v) => !v)}
          />
          {showVoiceHelp && <VoiceHelpCard colors={colors} />}
        </View>
      )}

      {/* ── Phase: Ready to answer ─────────────────────────────────────── */}
      {phase === 'ready' && (
        <View style={styles.phaseContainer}>
          <View style={[styles.readyCircle, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <ThemedText style={styles.speakerEmoji}>🎙️</ThemedText>
          </View>
          <ThemedText variant="h4" style={styles.phaseLabel}>
            답변할 준비가 됐나요?
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.textSecondary} style={styles.phaseSubLabel}>
            목표 시간: {formatTime(question.estimatedSeconds)}
          </ThemedText>
          <View style={styles.buttonGroup}>
            <Button label="다시 듣기" variant="secondary" size="md" onPress={handleReplay} />
            <Button label="답변 시작" size="md" onPress={handleStartAnswer} />
          </View>
          <Button
            label="🔇 소리가 안 들려요"
            variant="ghost"
            size="sm"
            onPress={() => setShowVoiceHelp((v) => !v)}
          />
          {showVoiceHelp && <VoiceHelpCard colors={colors} />}
        </View>
      )}

      {/* ── Phase: Recording ──────────────────────────────────────────── */}
      {phase === 'recording' && (
        <View style={styles.phaseContainer}>
          <View style={[styles.timerCircle, { borderColor: colors.recordingActive, backgroundColor: colors.recordingBackground }]}>
            <ThemedText variant="displayLarge" color={colors.recordingActive}>
              {formatTime(interview.elapsedSeconds)}
            </ThemedText>
            <ThemedText variant="labelSmall" color={colors.recordingActive}>
              ● 녹음 중
            </ThemedText>
          </View>

          {interview.recordingError && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBackground }]}>
              <ThemedText variant="bodySmall" color={colors.error}>
                {interview.recordingError.message}
              </ThemedText>
            </View>
          )}

          <Button
            label="답변 완료"
            variant="danger"
            size="lg"
            fullWidth
            onPress={handleStopAnswer}
          />
        </View>
      )}

      {/* ── Phase: Processing ─────────────────────────────────────────── */}
      {phase === 'processing' && (
        <View style={styles.phaseContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <ThemedText variant="h4" color={colors.primary} style={styles.phaseLabel}>
            AI가 답변을 분석 중입니다
          </ThemedText>
          <ThemedText variant="bodySmall" color={colors.textSecondary}>
            잠시만 기다려 주세요...
          </ThemedText>
        </View>
      )}

      {/* ── Phase: Error ──────────────────────────────────────────────── */}
      {phase === 'error' && (
        <View style={styles.phaseContainer}>
          {isDailyLimitError(interview.submitError) ? (
            <>
              <ThemedText style={styles.limitEmoji}>☕</ThemedText>
              <ThemedText variant="h4" style={styles.phaseLabel}>
                오늘의 연습을 완료했어요
              </ThemedText>
              <ThemedText variant="bodySmall" color={colors.textSecondary} style={styles.phaseSubLabel}>
                무료 플랜은 하루 1회 연습이 가능합니다.{'\n'}내일 다시 만나요!
              </ThemedText>
              <View style={[styles.upgradeCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '30' }]}>
                <ThemedText variant="labelLarge" color={colors.primary} style={styles.upgradeBadge}>
                  ✨ 프리미엄 플랜
                </ThemedText>
                <ThemedText variant="bodySmall" color={colors.textSecondary} style={styles.upgradeFeatures}>
                  • 하루 무제한 연습{'\n'}
                  • 더 상세한 AI 피드백{'\n'}
                  • 모든 직군 카테고리 접근
                </ThemedText>
                <Button
                  label="업그레이드 →"
                  size="md"
                  fullWidth
                  onPress={() => Linking.openURL('https://interclear.app/pricing')}
                />
              </View>
              <Button
                label="홈으로 돌아가기"
                variant="ghost"
                size="sm"
                onPress={() => router.navigate('/(tabs)/home')}
              />
            </>
          ) : (
            <>
              <ThemedText variant="h4" color={colors.error} style={styles.phaseLabel}>
                분석 중 오류가 발생했습니다
              </ThemedText>
              <ThemedText variant="bodySmall" color={colors.textSecondary} style={styles.phaseSubLabel}>
                {interview.submitError instanceof Error
                  ? interview.submitError.message
                  : '잠시 후 다시 시도해 주세요.'}
              </ThemedText>
              <Button label="다시 녹음하기" size="md" onPress={handleRestart} />
            </>
          )}
        </View>
      )}

      {/* ── Phase: Complete — show feedback ───────────────────────────── */}
      {phase === 'complete' && interview.session?.feedback && (
        <View style={styles.feedbackContainer}>
          <ThemedText variant="h3" style={styles.feedbackTitle}>
            AI 피드백
          </ThemedText>
          <FeedbackCard feedback={interview.session.feedback} />
          <View style={styles.feedbackButtons}>
            <Button
              label="다시 연습하기"
              variant="secondary"
              size="md"
              onPress={handleRestart}
              style={styles.feedbackButtonHalf}
            />
            <Button
              label="다음 질문 →"
              size="md"
              onPress={handleNextQuestion}
              style={styles.feedbackButtonHalf}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

// ─── Voice setup help card ────────────────────────────────────────────────────

function VoiceHelpCard({ colors }: { colors: ReturnType<typeof import('@/hooks/useTheme').useTheme>['colors'] }) {
  return (
    <View style={[helpStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText variant="labelSmall" color={colors.textSecondary} style={helpStyles.title}>
        한국어 음성 설치 방법
      </ThemedText>

      <View style={helpStyles.section}>
        <ThemedText variant="bodySmall" style={helpStyles.osLabel}>
          🤖 Android
        </ThemedText>
        <ThemedText variant="bodySmall" color={colors.textSecondary} style={helpStyles.steps}>
          설정 → 일반 관리 → 언어 → 텍스트 음성 변환 → 한국어 설치
        </ThemedText>
      </View>

      <View style={[helpStyles.divider, { backgroundColor: colors.border }]} />

      <View style={helpStyles.section}>
        <ThemedText variant="bodySmall" style={helpStyles.osLabel}>
          🍎 iPhone
        </ThemedText>
        <ThemedText variant="bodySmall" color={colors.textSecondary} style={helpStyles.steps}>
          설정 → 손쉬운 사용 → 음성 콘텐츠 → 목소리 → 한국어 선택
        </ThemedText>
      </View>

      <ThemedText variant="caption" color={colors.textSecondary} style={helpStyles.note}>
        설치 후 앱을 재시작하면 한국어로 질문을 읽어드립니다.
      </ThemedText>
    </View>
  );
}

const helpStyles = StyleSheet.create({
  card: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  title: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  section: {
    gap: Spacing.xs,
  },
  osLabel: {
    fontWeight: '600',
  },
  steps: {
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  note: {
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  questionCard: {
    marginTop: Spacing.base,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  questionText: {
    lineHeight: 28,
  },
  hintToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  hintBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },

  // Shared phase layout
  phaseContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.lg,
  },
  phaseLabel: {
    textAlign: 'center',
  },
  phaseSubLabel: {
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },

  // TTS speaking indicator
  speakerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerEmoji: {
    fontSize: 48,
  },
  limitEmoji: {
    fontSize: 48,
    lineHeight: 60,
  },
  upgradeCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  upgradeBadge: {
    textAlign: 'center',
  },
  upgradeFeatures: {
    lineHeight: 22,
  },

  // Ready state
  readyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recording timer
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },

  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    width: '100%',
  },

  // Feedback
  feedbackContainer: {
    gap: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  feedbackTitle: {
    marginTop: Spacing.sm,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  feedbackButtonHalf: {
    flex: 1,
  },
});
