import React, { useState } from 'react';
import { StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ThemedText } from '@/components/ui/ThemedText';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/contexts/AuthContext';
import { useInterviewStore } from '@/store/interviewStore';
import { useSessionHistory } from '@/queries/useInterviewQueries';
import { Spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const settings = useSettingsStore();
  const { email } = useAuthStore();
  const { signOut } = useAuth();
  const { data: sessions = [] } = useSessionHistory();
  const { seedMockHistory, clearHistory } = useInterviewStore();

  const emailPrefix = email?.split('@')[0] ?? '';
  const displayName = settings.displayName || emailPrefix || '면접 연습생';

  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  function startEditing() {
    setDraftName(settings.displayName);
    setEditingName(true);
  }

  function commitName() {
    settings.setDisplayName(draftName.trim());
    setEditingName(false);
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  const scoredSessions = sessions.filter((s) => s.feedback?.overallScore !== undefined);
  const avgScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce((sum, s) => sum + (s.feedback?.overallScore ?? 0), 0) /
            scoredSessions.length,
        )
      : null;

  return (
    <Screen scrollable horizontalPadding>
      {/* Avatar + Name */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryMid }]}>
          <ThemedText style={styles.avatarEmoji}>🧑‍💼</ThemedText>
        </View>
        {editingName ? (
          <TextInput
            style={[styles.nameInput, { color: colors.text, borderColor: colors.primary }]}
            value={draftName}
            onChangeText={setDraftName}
            onBlur={commitName}
            onSubmitEditing={commitName}
            autoFocus
            returnKeyType="done"
            maxLength={30}
            placeholderTextColor={colors.textSecondary}
            placeholder="이름을 입력하세요"
          />
        ) : (
          <TouchableOpacity onPress={startEditing} activeOpacity={0.7} style={styles.nameRow}>
            <ThemedText variant="h2">{displayName}</ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              ✏️
            </ThemedText>
          </TouchableOpacity>
        )}
        <ThemedText variant="bodyMedium" color={colors.textSecondary}>
          {email ?? ''}
        </ThemedText>
      </View>

      {/* Stats */}
      <Card elevated style={styles.statsCard}>
        <View style={styles.statsRow}>
          <StatItem label="총 연습" value={`${sessions.length}회`} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatItem
            label="평균 점수"
            value={avgScore !== null ? `${avgScore}점` : '-'}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatItem label="무료 플랜" value="1회/일" colors={colors} />
        </View>
      </Card>

      {/* Settings */}
      <ThemedText variant="h4" style={styles.sectionTitle}>
        설정
      </ThemedText>

      <Card style={styles.settingsCard}>
        <SettingRow
          label="힌트 표시"
          description="각 문제 카드에 힌트 보기 버튼을 표시합니다"
          value={settings.showHints}
          onToggle={settings.setShowHints}
          colors={colors}
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <SettingRow
          label="다크 모드"
          description="시스템 설정을 따릅니다"
          value={settings.theme === 'dark'}
          onToggle={(val) => settings.setTheme(val ? 'dark' : 'system')}
          colors={colors}
        />
      </Card>

      {/* Dev Tools — only in development builds */}
      {__DEV__ && (
        <>
          <ThemedText variant="h4" style={styles.sectionTitle}>
            개발자 도구
          </ThemedText>
          <Card style={styles.settingsCard}>
            <ThemedText variant="caption" color={colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
              히스토리 UI 디버깅용 목업 세션 데이터
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Button
                label="히스토리 추가"
                variant="secondary"
                size="sm"
                onPress={seedMockHistory}
                style={{ flex: 1 }}
              />
              <Button
                label="초기화"
                variant="ghost"
                size="sm"
                onPress={clearHistory}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </>
      )}

      {/* TTS Debug */}
      <ThemedText variant="h4" style={styles.sectionTitle}>
        TTS 진단
      </ThemedText>
      <TTSDebugCard colors={colors} />

      {/* Legal */}
      <ThemedText variant="h4" style={styles.sectionTitle}>
        법적 정보
      </ThemedText>
      <Card style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } } as any)}
          activeOpacity={0.7}
        >
          <ThemedText variant="labelLarge">개인정보 처리방침</ThemedText>
          <ThemedText variant="bodySmall" color={colors.textSecondary}>›</ThemedText>
        </TouchableOpacity>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={styles.legalRow}
          onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } } as any)}
          activeOpacity={0.7}
        >
          <ThemedText variant="labelLarge">이용약관</ThemedText>
          <ThemedText variant="bodySmall" color={colors.textSecondary}>›</ThemedText>
        </TouchableOpacity>
      </Card>

      {/* Sign out */}
      <Button
        label="로그아웃"
        variant="ghost"
        fullWidth
        onPress={handleSignOut}
        style={styles.signOutButton}
      />

      <ThemedText variant="caption" color={colors.textTertiary} style={styles.version}>
        InterClear v1.0.0 · AI 면접 코치
      </ThemedText>
    </Screen>
  );
}

function StatItem({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.statItem}>
      <ThemedText variant="h2" color={colors.primary}>
        {value}
      </ThemedText>
      <ThemedText variant="caption" color={colors.textSecondary}>
        {label}
      </ThemedText>
    </View>
  );
}

function SettingRow({
  label,
  description,
  value,
  onToggle,
  colors,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <ThemedText variant="labelLarge">{label}</ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary}>
          {description}
        </ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.textOnPrimary}
      />
    </View>
  );
}

function TTSDebugCard({ colors }: { colors: ReturnType<typeof useTheme>['colors'] }) {
  const [status, setStatus] = useState<string>('아직 테스트 안 함');
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  async function runTest() {
    setStatus('🔍 목소리 목록 확인 중...');
    const available = await Speech.getAvailableVoicesAsync();
    setVoices(available);

    const korean = available.filter(
      (v) => v.language.startsWith('ko') || v.identifier.includes('ko'),
    );

    setStatus(`총 ${available.length}개 목소리, 한국어 ${korean.length}개 발견`);
    setIsSpeaking(true);

    Speech.speak('안녕하세요. 면접 연습을 시작해 볼까요?', {
      language: 'ko',
      rate: 0.88,
      onDone: () => {
        setIsSpeaking(false);
        setStatus((prev) => prev + '\n✅ TTS 완료 — 소리가 들렸나요?');
      },
      onError: (err) => {
        setIsSpeaking(false);
        setStatus((prev) => prev + `\n❌ TTS 오류: ${err.message ?? '알 수 없는 오류'}`);
      },
    });
  }

  const koreanVoices = voices.filter(
    (v) => v.language.startsWith('ko') || v.identifier.includes('ko'),
  );

  return (
    <Card style={styles.debugCard}>
      <ThemedText variant="bodySmall" color={colors.textSecondary} style={styles.debugStatus}>
        {status}
      </ThemedText>

      {koreanVoices.length > 0 && (
        <View style={styles.voiceList}>
          <ThemedText variant="labelSmall" color={colors.success}>
            한국어 목소리:
          </ThemedText>
          {koreanVoices.map((v) => (
            <ThemedText key={v.identifier} variant="caption" color={colors.textSecondary}>
              • {v.name} ({v.language})
            </ThemedText>
          ))}
        </View>
      )}

      {voices.length > 0 && koreanVoices.length === 0 && (
        <ThemedText variant="caption" color={colors.warning} style={styles.debugStatus}>
          ⚠️ 한국어 목소리가 없습니다.{'\n'}
          iOS: 설정 → 손쉬운 사용 → 말하기 → 목소리 → 한국어{'\n'}
          Android: 설정 → 일반 → TTS → 한국어 설치
        </ThemedText>
      )}

      <Button
        label={isSpeaking ? '재생 중...' : '🔊 TTS 테스트'}
        variant="secondary"
        size="sm"
        disabled={isSpeaking}
        onPress={runTest}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 44,
    lineHeight: 56,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 160,
    textAlign: 'center',
  },
  statsCard: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 40,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingsCard: {
    marginBottom: Spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.base,
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  signOutButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  version: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  debugCard: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  debugStatus: {
    lineHeight: 20,
  },
  voiceList: {
    gap: Spacing.xs,
  },
});
