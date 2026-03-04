import React from 'react';
import { Text, type TextProps } from 'react-native';
import { Typography, type TypographyVariant } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

type ThemedTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

export function ThemedText({
  variant = 'bodyMedium',
  color,
  style,
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[Typography[variant], { color: color ?? colors.text }, style]}
      {...props}
    />
  );
}
