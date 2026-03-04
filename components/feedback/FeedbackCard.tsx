import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radius } from '@/theme/spacing';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { DIMENSION_LABELS } from '@/domain/feedback/types';
import type { AIFeedback, DimensionScore } from '@/domain/feedback/types';
import { useSpeech } from '@/hooks/useSpeech';

// ─── Score Ring ────────────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const { colors } = useTheme();
  const color =
    score >= 80 ? colors.success : score >= 60 ? colors.warning : colors.error;

  return (
    <View style={[styles.scoreCircle, { borderColor: color }]}>
      <ThemedText variant="displayMedium" color={color}>
        {score}
      </ThemedText>
      <ThemedText variant="caption" color={colors.textSecondary}>
        / 100
      </ThemedText>
    </View>
  );
}

// ─── Dimension Bar ─────────────────────────────────────────────────────────

function DimensionBar({ dimension }: { dimension: DimensionScore }) {
  const { colors } = useTheme();
  const color =
    dimension.score >= 80
      ? colors.success
      : dimension.score >= 60
        ? colors.warning
        : colors.error;

  return (
    <View style={styles.dimensionRow}>
      <ThemedText variant="labelMedium" style={styles.dimensionLabel}>
        {DIMENSION_LABELS[dimension.dimension]}
      </ThemedText>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View
          style={[styles.barFill, { width: `${dimension.score}%` as any, backgroundColor: color }]}
        />
      </View>
      <ThemedText variant="labelMedium" color={color} style={styles.dimensionScore}>
        {dimension.score}
      </ThemedText>
    </View>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

type FeedbackCardProps = {
  feedback: AIFeedback;
};

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const { colors } = useTheme();
  const speech = useSpeech();

  return (
    <View style={styles.container}>
      {/* Overall Score */}
      <Card elevated style={styles.section}>
        <ThemedText variant="labelSmall" color={colors.textSecondary} style={styles.sectionLabel}>
          AI 종합 평가
        </ThemedText>
        <View style={styles.scoreRow}>
          <ScoreCircle score={feedback.overallScore} />
          <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.summary}>
            {feedback.summary}
          </ThemedText>
        </View>
      </Card>

      {/* Dimension Scores */}
      <Card style={styles.section}>
        <ThemedText variant="labelSmall" color={colors.textSecondary} style={styles.sectionLabel}>
          세부 평가
        </ThemedText>
        {feedback.dimensions.map((d) => (
          <DimensionBar key={d.dimension} dimension={d} />
        ))}
      </Card>

      {/* Strengths */}
      <Card style={styles.section}>
        <ThemedText
          variant="labelSmall"
          color={colors.success}
          style={styles.sectionLabel}
        >
          잘한 점
        </ThemedText>
        {feedback.strengths.map((s, i) => (
          <View key={i} style={styles.bulletRow}>
            <ThemedText color={colors.success} style={styles.bullet}>
              ✓
            </ThemedText>
            <ThemedText variant="bodySmall" style={styles.bulletText}>
              {s}
            </ThemedText>
          </View>
        ))}
      </Card>

      {/* Improvements */}
      <Card style={styles.section}>
        <ThemedText
          variant="labelSmall"
          color={colors.warning}
          style={styles.sectionLabel}
        >
          개선할 점
        </ThemedText>
        {feedback.improvements.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <ThemedText color={colors.warning} style={styles.bullet}>
              →
            </ThemedText>
            <ThemedText variant="bodySmall" style={styles.bulletText}>
              {item}
            </ThemedText>
          </View>
        ))}
      </Card>

      {/* AI Rewritten Answer */}
      {feedback.rewrittenAnswer && (
        <Card style={styles.section}>
          <View style={styles.rewriteHeader}>
            <ThemedText variant="labelSmall" color={colors.primary} style={styles.sectionLabel}>
              AI 모범 답안
            </ThemedText>
            {speech.isKoreanAvailable && (
              <Pressable
                onPress={() => {
                  if (speech.isSpeaking) {
                    speech.stop();
                  } else if (feedback.rewrittenAnswer) {
                    speech.speak(feedback.rewrittenAnswer);
                  }
                }}
                style={[styles.ttsButton, { backgroundColor: colors.primaryLight }]}
                hitSlop={8}
              >
                <ThemedText variant="labelSmall" color={colors.primary}>
                  {speech.isSpeaking ? '⏹ 정지' : '▶ 듣기'}
                </ThemedText>
              </Pressable>
            )}
          </View>
          <View style={[styles.rewriteBox, { backgroundColor: colors.primaryLight }]}>
            <ThemedText variant="bodySmall" color={colors.text}>
              {feedback.rewrittenAnswer}
            </ThemedText>
          </View>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  section: {
    marginBottom: 0,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.base,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summary: {
    flex: 1,
    lineHeight: 22,
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  dimensionLabel: {
    width: 48,
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  dimensionScore: {
    width: 28,
    textAlign: 'right',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  rewriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewriteHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ttsButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  rewriteBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
});
