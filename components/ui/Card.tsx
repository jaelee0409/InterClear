import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Shadow, Spacing } from '@/theme/spacing';

type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
};

export function Card({
  children,
  onPress,
  style,
  elevated = false,
  padded = true,
}: CardProps) {
  const { colors } = useTheme();

  const baseStyle = [
    styles.card,
    {
      backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
      borderColor: colors.border,
      ...(elevated ? Shadow.md : Shadow.sm),
    },
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  padded: {
    padding: Spacing.base,
  },
  pressed: {
    opacity: 0.88,
  },
});
