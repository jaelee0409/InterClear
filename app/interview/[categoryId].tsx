import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/Card";
import { ThemedText } from "@/components/ui/ThemedText";
import {
  DIFFICULTY_LABELS,
  JOB_CATEGORIES,
} from "@/domain/interview/constants";
import type { InterviewQuestion } from "@/domain/interview/types";
import { useTheme } from "@/hooks/useTheme";
import { useQuestions } from "@/queries/useInterviewQueries";
import { useSettingsStore } from "@/store/settingsStore";
import { Radius, Spacing } from "@/theme/spacing";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const DIFFICULTY_COLORS = {
  easy: "#22C55E",
  medium: "#F97316",
  hard: "#EF4444",
} as const;

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const category = JOB_CATEGORIES.find((c) => c.id === categoryId);
  const { data: questions = [], isLoading } = useQuestions(categoryId ?? "");
  const showHints = useSettingsStore((s) => s.showHints);

  function handleQuestionPress(question: InterviewQuestion) {
    router.push({
      pathname: "/interview/session/[questionId]",
      params: { questionId: question.id, categoryId },
    });
  }

  return (
    <Screen>
      {/* Category Header */}
      {category && (
        <View style={styles.header}>
          <ThemedText style={styles.icon}>{category.icon}</ThemedText>
          <ThemedText variant="h2">{category.label}</ThemedText>
          <ThemedText variant="bodyMedium" color={colors.textSecondary}>
            {category.description}
          </ThemedText>
        </View>
      )}

      {isLoading && (
        <ThemedText color={colors.textSecondary} style={styles.loading}>
          문제를 불러오는 중...
        </ThemedText>
      )}

      {!isLoading && questions.length === 0 && (
        <Card style={styles.emptyCard}>
          <ThemedText
            variant="bodyMedium"
            color={colors.textSecondary}
            style={{ textAlign: "center" }}
          >
            이 직군의 문제가 곧 추가될 예정입니다.
          </ThemedText>
        </Card>
      )}

      {questions.map((question, idx) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={idx}
          showHints={showHints}
          onPress={() => handleQuestionPress(question)}
        />
      ))}
    </Screen>
  );
}

// ─── Question card with collapsible hint ─────────────────────────────────────

function QuestionCard({
  question,
  index,
  showHints,
  onPress,
}: {
  question: InterviewQuestion;
  index: number;
  showHints: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const [hintVisible, setHintVisible] = useState(false);

  return (
    <Card onPress={onPress} elevated style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <ThemedText variant="labelSmall" color={colors.textSecondary}>
          Q{index + 1}
        </ThemedText>
        <View style={styles.badges}>
          <Badge
            label={DIFFICULTY_LABELS[question.difficulty]}
            color={DIFFICULTY_COLORS[question.difficulty]}
          />
          <Badge
            label={`${question.estimatedSeconds}초`}
            color={colors.textSecondary}
          />
        </View>
      </View>

      <ThemedText variant="bodyLarge" style={styles.questionText}>
        {question.text}
      </ThemedText>

      {/* Hint — only shown when the setting is on and the question has a hint */}
      {showHints && question.hint && (
        <>
          <TouchableOpacity
            onPress={() => setHintVisible((v) => !v)}
            style={[styles.hintToggle, { borderColor: colors.primary + "50" }]}
            activeOpacity={0.7}
          >
            <ThemedText variant="labelSmall" color={colors.primary}>
              {hintVisible ? "💡 힌트 숨기기" : "💡 힌트 보기"}
            </ThemedText>
          </TouchableOpacity>

          {hintVisible && (
            <View
              style={[styles.hintBox, { backgroundColor: colors.primaryLight }]}
            >
              <ThemedText variant="caption" color={colors.primary}>
                {question.hint}
              </ThemedText>
            </View>
          )}
        </>
      )}

      <View style={styles.tags}>
        {question.tags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.tag,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ThemedText variant="labelSmall" color={colors.textSecondary}>
              #{tag}
            </ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color + "60" }]}>
      <ThemedText variant="labelSmall" color={color}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
    alignItems: "flex-start",
  },
  icon: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Spacing.xs,
  },
  loading: {
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
  emptyCard: {
    paddingVertical: Spacing["3xl"],
    marginTop: Spacing.md,
  },
  questionCard: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  questionText: {
    lineHeight: 26,
  },
  hintToggle: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  hintBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
