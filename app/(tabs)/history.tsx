import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { useTheme } from '@/hooks/useTheme';
import { useSessionHistory, type ApiSession } from '@/queries/useInterviewQueries';
import { useInterviewStore } from '@/store/interviewStore';
import { Radius, Spacing } from '@/theme/spacing';
import type { InterviewSession } from '@/domain/interview/types';

function getScoreColor(score: number | undefined, colors: ReturnType<typeof useTheme>['colors']) {
  if (score === undefined) return colors.textSecondary;
  return score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { data: apiSessions, isLoading, isError } = useSessionHistory();
  const recentSessions = useInterviewStore((s) => s.recentSessions);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  const localSessions = recentSessions.filter((s) => s.status === 'complete' && s.feedback);

  const hasLocal = localSessions.length > 0;
  const hasApi = (apiSessions?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <Screen horizontalPadding>
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Screen>
    );
  }

  if (!hasLocal && (isError || !hasApi)) {
    return (
      <Screen horizontalPadding>
        <View style={styles.centerContainer}>
          {isError ? (
            <>
              <ThemedText variant="h3" style={styles.emptyTitle}>
                기록을 불러올 수 없습니다
              </ThemedText>
              <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.emptyDesc}>
                인터넷 연결을 확인해 주세요.
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={styles.emptyEmoji}>📋</ThemedText>
              <ThemedText variant="h3" style={styles.emptyTitle}>
                아직 연습 기록이 없어요
              </ThemedText>
              <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.emptyDesc}>
                홈에서 직군을 선택하고 첫 번째 면접 연습을 시작해 보세요!
              </ThemedText>
            </>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <>
      <Screen scrollable horizontalPadding>
        <ThemedText variant="h2" style={styles.title}>
          연습 기록
        </ThemedText>

        {/* Local sessions (this app run) */}
        {localSessions.map((session) => {
          const score = session.feedback?.overallScore;
          const color = getScoreColor(score, colors);
          return (
            <Card
              key={session.id}
              style={styles.card}
              elevated
              onPress={() => setSelectedSession(session)}
            >
              <View style={styles.cardHeader}>
                <ThemedText variant="labelMedium" color={colors.textSecondary}>
                  {session.question.categoryId}
                </ThemedText>
                {score !== undefined && (
                  <View style={[styles.scoreBadge, { backgroundColor: color + '20' }]}>
                    <ThemedText variant="labelMedium" color={color}>
                      {score}점
                    </ThemedText>
                  </View>
                )}
              </View>

              <ThemedText variant="bodyMedium" numberOfLines={3} style={styles.questionText}>
                {session.question.text}
              </ThemedText>

              {session.feedback?.summary && (
                <ThemedText variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
                  {session.feedback.summary}
                </ThemedText>
              )}

              <ThemedText variant="caption" color={colors.textTertiary} style={styles.date}>
                {new Date(session.startedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
            </Card>
          );
        })}

        {/* API sessions (from backend) */}
        {apiSessions?.map((session: ApiSession) => {
          const score = session.feedback?.overallScore;
          const color = getScoreColor(score, colors);
          return (
            <Card key={session.id} style={styles.card} elevated>
              <View style={styles.cardHeader}>
                <ThemedText variant="labelMedium" color={colors.textSecondary}>
                  {session.category_id}
                </ThemedText>
                {score !== undefined && (
                  <View style={[styles.scoreBadge, { backgroundColor: color + '20' }]}>
                    <ThemedText variant="labelMedium" color={color}>
                      {score}점
                    </ThemedText>
                  </View>
                )}
              </View>

              <ThemedText variant="bodyMedium" numberOfLines={3} style={styles.questionText}>
                {session.question_text}
              </ThemedText>

              {session.feedback?.summary && (
                <ThemedText variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
                  {session.feedback.summary}
                </ThemedText>
              )}

              <ThemedText variant="caption" color={colors.textTertiary} style={styles.date}>
                {new Date(session.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </ThemedText>
            </Card>
          );
        })}
      </Screen>

      {/* Feedback detail modal */}
      <Modal
        visible={!!selectedSession}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSession(null)}
      >
        {selectedSession && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText variant="h4" style={styles.modalTitle}>
                {selectedSession.question.text}
              </ThemedText>
              <Pressable onPress={() => setSelectedSession(null)} hitSlop={12}>
                <ThemedText variant="labelMedium" color={colors.primary}>
                  닫기
                </ThemedText>
              </Pressable>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <FeedbackCard feedback={selectedSession.feedback!} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.base,
  },
  card: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  questionText: {
    lineHeight: 22,
  },
  date: {
    marginTop: Spacing.xs,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    lineHeight: 68,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  modalTitle: {
    flex: 1,
    lineHeight: 22,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
});
