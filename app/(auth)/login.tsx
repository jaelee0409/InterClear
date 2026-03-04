import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, Radius } from '@/theme/spacing';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signInWithEmail, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await signInWithEmail(email.trim(), password);
        if (err) {
          setError(err);
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        const { error: err } = await signUp(email.trim(), password);
        if (err) {
          setError(err);
        } else {
          setSignupDone(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text,
    },
  ];

  return (
    <Screen scrollable horizontalPadding>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.logo}>🎙️</ThemedText>
          <ThemedText variant="h1">인터클리어</ThemedText>
          <ThemedText variant="bodyMedium" color={colors.textSecondary}>
            AI 면접 코치와 함께 합격을 준비하세요
          </ThemedText>
        </View>

        {signupDone ? (
          <View style={styles.doneBox}>
            <ThemedText variant="h3" style={styles.center}>
              이메일을 확인해주세요 ✉️
            </ThemedText>
            <ThemedText variant="bodyMedium" color={colors.textSecondary} style={styles.center}>
              가입하신 이메일로 확인 링크를 보냈습니다.{'\n'}
              링크를 클릭한 후 로그인해주세요.
            </ThemedText>
            <Button
              label="로그인으로 이동"
              fullWidth
              onPress={() => {
                setMode('login');
                setSignupDone(false);
              }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <ThemedText variant="h3" style={styles.formTitle}>
              {mode === 'login' ? '로그인' : '회원가입'}
            </ThemedText>

            <TextInput
              style={inputStyle}
              placeholder="이메일"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <TextInput
              style={inputStyle}
              placeholder="비밀번호 (최소 6자)"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error && (
              <ThemedText variant="bodySmall" color={colors.error}>
                {error}
              </ThemedText>
            )}

            <Button
              label={mode === 'login' ? '로그인' : '가입하기'}
              fullWidth
              loading={loading}
              onPress={handleSubmit}
            />

            <Button
              label={
                mode === 'login'
                  ? '계정이 없으신가요? 회원가입'
                  : '이미 계정이 있으신가요? 로그인'
              }
              variant="ghost"
              fullWidth
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.sm,
  },
  logo: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  form: {
    gap: Spacing.md,
  },
  formTitle: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  doneBox: {
    gap: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
});
