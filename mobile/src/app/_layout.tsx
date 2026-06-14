import { Stack } from 'expo-router';
import { useAuthStore } from '../lib/store/auth-store';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AchievementToast } from '../features/progress/components/AchievementToast';

export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <AchievementToast />
    </>
  );
}
