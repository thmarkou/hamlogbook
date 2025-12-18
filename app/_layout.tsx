import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'HamLogbook' }} />
        <Stack.Screen name="log-qso" options={{ title: 'Log QSO' }} />
        <Stack.Screen name="qso-list" options={{ title: 'QSO Log' }} />
        <Stack.Screen name="stats" options={{ title: 'Statistics' }} />
      </Stack>
    </>
  );
}

