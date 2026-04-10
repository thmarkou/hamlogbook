import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@shared/theme';
import { useQSStore } from '@/store';

/**
 * Loads all QSO rows from SQLite into Zustand once when the app starts.
 */
function HydrateQSOStoreFromSQLite() {
  const loadQSosFromDatabase = useQSStore((s) => s.loadQSosFromDatabase);

  useEffect(() => {
    void loadQSosFromDatabase();
  }, [loadQSosFromDatabase]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HydrateQSOStoreFromSQLite />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaProvider>
  );
}
