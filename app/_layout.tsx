import { AuthProvider } from "@/contexts/AuthContext";
import { SpeechProvider } from "@/contexts/SpeechContext";
import { queryClient } from "@/queries/queryClient";
import { useSettingsStore } from "@/store/settingsStore";
import { Colors } from "@/theme/colors";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Root layout — mounts all global providers once.
 * Routing is handled by index.tsx (initial) and explicit router.replace()
 * calls in login/sign-out actions.
 * Order: GestureHandler → SafeArea → Query → Auth → Speech → App.
 */
export default function RootLayout() {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore((s) => s.theme);

  const isDark =
    themeSetting === "system"
      ? systemScheme === "dark"
      : themeSetting === "dark";

  const theme = isDark ? Colors.dark : Colors.light;

  // useEffect(() => {
  //   async function setNavBar() {
  //     await NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  //   }

  //   setNavBar();
  // }, [theme.surface, isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SpeechProvider>
              <StatusBar
                style={isDark ? "light" : "dark"}
                backgroundColor={theme.surface}
                translucent={false}
              />
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="interview/[categoryId]"
                  options={{
                    headerShown: false,
                    headerBackTitle: "돌아가기",
                    title: "문제 선택",
                    presentation: "card",
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    // Edge-to-edge: status bar is transparent, so the native
                    // stack must account for the status bar height when
                    // positioning the header title / back button.
                  }}
                />
                <Stack.Screen
                  name="interview/session/[questionId]"
                  options={{
                    headerShown: true,
                    headerBackTitle: "문제 목록",
                    title: "면접 연습",
                    presentation: "card",
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                  }}
                />
                <Stack.Screen
                  name="legal/[doc]"
                  options={({ route }) => {
                    const params = route.params as { doc?: string } | undefined;
                    const titles: Record<string, string> = {
                      privacy: '개인정보 처리방침',
                      terms: '이용약관',
                    };
                    return {
                      headerShown: true,
                      headerBackTitle: '프로필',
                      title: titles[params?.doc ?? ''] ?? '법적 정보',
                      presentation: 'card',
                      headerStyle: { backgroundColor: theme.surface },
                      headerTintColor: theme.text,
                    };
                  }}
                />
              </Stack>
            </SpeechProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
