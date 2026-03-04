import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { Spacing } from '@/theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  key: string;
  emoji: string;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    emoji: '🎯',
    title: '면접, AI와 함께\n준비하세요',
    description: '원하는 직군을 선택하고\n실전처럼 면접 연습을 시작하세요',
  },
  {
    key: 'record',
    emoji: '🎙️',
    title: '답변을\n녹음하세요',
    description: 'AI가 질문을 읽어주면\n마이크에 대고 자유롭게 답변해보세요',
  },
  {
    key: 'feedback',
    emoji: '📊',
    title: 'AI 피드백으로\n성장하세요',
    description: '답변의 구조, 전달력, 내용을\nAI가 점수와 함께 분석해드립니다',
  },
  {
    key: 'history',
    emoji: '📈',
    title: '기록으로\n성장을 확인하세요',
    description: '매 연습 결과가 저장되어\n나의 발전 과정을 한눈에 볼 수 있어요',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);

  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  function finish() {
    setOnboardingComplete(true);
    router.replace('/(tabs)/home');
  }

  function handleNext() {
    if (isLast) {
      finish();
    } else {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  }

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <View style={[styles.skipRow, { paddingTop: insets.top + Spacing.md }]}>
        <Button
          label="건너뛰기"
          variant="ghost"
          size="sm"
          onPress={finish}
        />
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <ThemedText style={styles.emoji}>{item.emoji}</ThemedText>
            <ThemedText variant="h2" style={styles.title}>
              {item.title}
            </ThemedText>
            <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.description}>
              {item.description}
            </ThemedText>
          </View>
        )}
      />

      {/* Dots + CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? colors.primary : colors.border,
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          label={isLast ? '시작하기 →' : '다음'}
          size="lg"
          fullWidth
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.lg,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 96,
  },
  title: {
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
