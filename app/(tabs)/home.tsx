import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { CategoryCard } from '@/components/interview/CategoryCard';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import { useTheme } from '@/hooks/useTheme';
import { useCategories } from '@/queries/useInterviewQueries';
import { useInterviewStore } from '@/store/interviewStore';
import { interviewService } from '@/services/api/interview';
import { Radius, Spacing } from '@/theme/spacing';
import type { InterviewSession, JobCategory } from '@/domain/interview/types';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: categories = [], isLoading } = useCategories();
  const recentSessions = useInterviewStore((s) => s.recentSessions);

  const totalSessions = recentSessions.length;
  const averageScore =
    recentSessions.length > 0
      ? Math.round(
          recentSessions
            .filter((s) => s.feedback)
            .reduce((sum, s) => sum + (s.feedback?.overallScore ?? 0), 0) /
            Math.max(1, recentSessions.filter((s) => s.feedback).length),
        )
      : 0;

  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);

  async function handleCategoryPress(category: JobCategory) {
    if (loadingCategoryId) return;
    setLoadingCategoryId(category.id);
    try {
      const questions = await interviewService.getQuestions(category.id);
      if (questions.length === 0) return;
      const random = questions[Math.floor(Math.random() * questions.length)];
      router.push({
        pathname: '/interview/session/[questionId]',
        params: { questionId: random.id, categoryId: category.id },
      });
    } finally {
      setLoadingCategoryId(null);
    }
  }

  // Render categories in 2-column grid
  const rows = [];
  for (let i = 0; i < categories.length; i += 2) {
    rows.push(categories.slice(i, i + 2));
  }

  return (
    <>
    <Screen scrollable horizontalPadding>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="displayMedium">안녕하세요! 👋</ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.subtitle}>
          오늘도 면접 연습 시작해볼까요?
        </ThemedText>
      </View>

      {/* Quick Stats */}
      {totalSessions > 0 && (
        <View style={styles.statsRow}>
          <StatChip label="연습 횟수" value={`${totalSessions}회`} colors={colors} />
          <StatChip label="평균 점수" value={`${averageScore}점`} colors={colors} />
          <StatChip label="연속 학습" value="1일" colors={colors} />
        </View>
      )}

      {/* Empty state */}
      {recentSessions.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <ThemedText style={styles.emptyEmoji}>🎯</ThemedText>
          <ThemedText variant="h4" style={styles.emptyTitle}>
            첫 면접 연습을 시작해보세요!
          </ThemedText>
          <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.emptyDesc}>
            AI가 답변을 분석하고 실시간 피드백을 드립니다.
          </ThemedText>
        </Card>
      )}

      {/* Category Grid */}
      <ThemedText variant="h3" style={styles.sectionTitle}>
        직군별 연습
      </ThemedText>

      {isLoading ? (
        <ThemedText color={colors.textSecondary} style={styles.loadingText}>
          불러오는 중...
        </ThemedText>
      ) : (
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((cat) => (
                <View key={cat.id} style={styles.gridItem}>
                  <CategoryCard category={cat} onPress={handleCategoryPress} />
                </View>
              ))}
              {/* Fill empty slot if odd number */}
              {row.length === 1 && <View style={styles.gridItem} />}
            </View>
          ))}
        </View>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <>
          <ThemedText variant="h3" style={styles.sectionTitle}>
            최근 연습
          </ThemedText>
          {recentSessions.slice(0, 3).map((session) => (
            <Card
              key={session.id}
              style={styles.sessionCard}
              onPress={session.feedback ? () => setSelectedSession(session) : undefined}
            >
              <ThemedText variant="labelMedium" numberOfLines={2}>
                {session.question.text}
              </ThemedText>
              <View style={styles.sessionMeta}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {session.question.categoryId}
                </ThemedText>
                {session.feedback && (
                  <ThemedText variant="labelMedium" color={colors.primary}>
                    {session.feedback.overallScore}점 →
                  </ThemedText>
                )}
              </View>
            </Card>
          ))}
        </>
      )}
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
              <View style={styles.modalHandle} />
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

function StatChip({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <ThemedText variant="h3" color={colors.primary}>
        {value}
      </ThemedText>
      <ThemedText variant="caption" color={colors.textSecondary}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  grid: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  gridItem: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    marginTop: Spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    lineHeight: 60,
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
