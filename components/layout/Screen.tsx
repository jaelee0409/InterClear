import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** Padding on left/right sides */
  horizontalPadding?: boolean;
  /**
   * SafeAreaView edges to inset. Defaults to ['top','left','right'].
   * Pass ['left','right'] on screens inside a Stack with headerShown:true —
   * the navigator header already handles the top inset.
   */
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
};

/**
 * Root screen wrapper. Handles safe area, background color, and optional scroll.
 * All screens should use this as their outermost container.
 */
export function Screen({
  children,
  scrollable = false,
  style,
  contentStyle,
  horizontalPadding = true,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const { colors } = useTheme();

  const inner = horizontalPadding ? [styles.content, contentStyle] : contentStyle;

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background }, style]}
        edges={edges}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, inner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }, style]}
      edges={edges}
    >
      <View style={[styles.flex, inner]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['3xl'],
  },
});
