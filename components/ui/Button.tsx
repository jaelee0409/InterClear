import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Spacing } from '@/theme/spacing';
import { ThemedText } from './ThemedText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: import('react-native').ViewStyle;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bgColors: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.primaryMid,
    ghost: 'transparent',
    danger: colors.error,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.textOnPrimary,
    secondary: colors.primary,
    ghost: colors.primary,
    danger: colors.textOnPrimary,
  };

  const heights: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 56 };
  const paddings: Record<ButtonSize, number> = { sm: Spacing.md, md: Spacing.lg, lg: Spacing.xl };
  const textVariants = { sm: 'labelMedium', md: 'labelLarge', lg: 'labelLarge' } as const;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bgColors[variant],
          height: heights[size],
          paddingHorizontal: paddings[size],
          borderRadius: Radius.md,
          opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor: variant === 'secondary' ? colors.primary : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' || variant === 'secondary' ? colors.primary : colors.textOnPrimary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <ThemedText
            variant={textVariants[size]}
            color={textColors[variant]}
            style={icon ? styles.labelWithIcon : undefined}
          >
            {label}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  labelWithIcon: {
    marginLeft: Spacing.xs,
  },
});
