import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme/spacing';

// ─── Content ────────────────────────────────────────────────────────────────

const PRIVACY_POLICY = `최종 업데이트: 2026년 3월 4일

인터클리어(이하 "서비스")은 사용자의 개인정보를 소중히 여기며, 관련 법령을 준수합니다.

1. 수집하는 정보
서비스는 다음 정보를 수집합니다:
• 이메일 주소 (회원가입 및 로그인)
• 녹음 파일 (AI 분석 후 즉시 삭제됨)
• 면접 연습 기록 및 AI 피드백

2. 정보 이용 목적
• 서비스 제공 및 개선
• AI 면접 피드백 생성
• 계정 관리 및 고객 지원

3. 정보 보관 기간
• 계정 삭제 시 모든 데이터를 즉시 삭제합니다.
• 녹음 파일은 AI 분석 완료 후 서버에서 삭제됩니다.

4. 제3자 제공
수집된 개인정보는 법령에 의한 경우를 제외하고 제3자에게 제공되지 않습니다.

5. 보안
업계 표준의 암호화 및 보안 조치를 통해 개인정보를 보호합니다.

6. 문의
개인정보 처리에 관한 문의: support@interclear.app`;

const TERMS_OF_SERVICE = `최종 업데이트: 2026년 3월 4일

인터클리어 서비스를 이용하시기 전에 아래 이용약관을 읽어주세요.

1. 서비스 개요
인터클리어는 AI를 활용한 한국어 면접 연습 서비스입니다. 본 서비스는 실제 채용 결과를 보장하지 않습니다.

2. 계정
• 만 14세 이상만 가입할 수 있습니다.
• 계정 정보의 보안은 사용자 책임입니다.
• 부정 이용 시 계정이 정지될 수 있습니다.

3. 무료/유료 플랜
• 무료 플랜: 하루 1회 면접 연습
• 프리미엄 플랜: 무제한 연습 및 추가 기능
• 요금제는 사전 공지 후 변경될 수 있습니다.

4. 금지 행위
• 서비스를 상업적 목적으로 무단 활용하는 행위
• 자동화 도구를 이용한 대량 접근
• 타인의 계정 도용

5. 면책 조항
서비스는 "있는 그대로" 제공되며, 서비스 중단 또는 오류로 인한 손해에 대해 책임지지 않습니다.

6. 준거법
본 약관은 대한민국 법률에 따라 해석됩니다.

7. 문의
서비스 관련 문의: support@interclear.app`;

const DOCS = {
  privacy: {
    title: '개인정보 처리방침',
    content: PRIVACY_POLICY,
  },
  terms: {
    title: '이용약관',
    content: TERMS_OF_SERVICE,
  },
} as const;

type DocKey = keyof typeof DOCS;

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const docKey = (doc as DocKey) in DOCS ? (doc as DocKey) : 'privacy';
  const { content } = DOCS[docKey];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing['3xl'] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.body}>
        {content.split('\n').map((line, i) => {
          const isHeading = /^\d+\./.test(line);
          return (
            <ThemedText
              key={i}
              variant={isHeading ? 'labelLarge' : 'bodySmall'}
              color={isHeading ? colors.text : colors.textSecondary}
              style={[styles.line, isHeading && styles.heading]}
            >
              {line || ' '}
            </ThemedText>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
  },
  body: {
    gap: Spacing.xs,
  },
  line: {
    lineHeight: 22,
  },
  heading: {
    marginTop: Spacing.lg,
  },
});
