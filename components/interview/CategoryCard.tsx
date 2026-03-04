import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radius } from '@/theme/spacing';
import { ThemedText } from '@/components/ui/ThemedText';
import type { JobCategory } from '@/domain/interview/types';
import { Pressable } from 'react-native';

type CategoryCardProps = {
  category: JobCategory;
  onPress: (category: JobCategory) => void;
};

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(category)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: category.color }]} />

      <View style={styles.body}>
        <ThemedText style={styles.icon}>{category.icon}</ThemedText>
        <ThemedText variant="labelLarge" numberOfLines={2}>
          {category.label}
        </ThemedText>
        <ThemedText
          variant="caption"
          color={colors.textSecondary}
          numberOfLines={2}
          style={styles.description}
        >
          {category.description}
        </ThemedText>
        <ThemedText variant="labelSmall" color={category.color} style={styles.count}>
          {category.questionCount}문항
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minHeight: 140,
  },
  accent: {
    height: 4,
    width: '100%',
  },
  body: {
    padding: Spacing.md,
    flex: 1,
    gap: Spacing.xs,
  },
  icon: {
    fontSize: 28,
    lineHeight: 36,
  },
  description: {
    marginTop: 2,
  },
  count: {
    marginTop: 'auto',
    paddingTop: Spacing.sm,
  },
});
