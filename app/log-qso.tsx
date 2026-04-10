import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogQSOForm } from '@/features/qso-logging/components/LogQSOForm';
import { useRouter } from 'expo-router';
import { useQSStore, useDashboardStatsStore } from '@/store';
import { SQLiteQSORepository } from '@/core/data/local';
import { createQSO } from '@core/domain/entities';
import { nanoid } from 'nanoid/non-secure';
import { Alert } from 'react-native';

/** Match log form chrome (pure black). */
const SCREEN_BG = '#000000';

const repository = new SQLiteQSORepository();

export default function LogQSOScreen() {
  const router = useRouter();
  const addQSO = useQSStore((s) => s.addQSO);
  const syncDashboard = useDashboardStatsStore((s) => s.syncFromDatabase);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <LogQSOForm
        checkDuplicateInDb={(callsign, band, mode, at) =>
          repository.findRecentDuplicate(callsign, band, mode, at)
        }
        onSubmit={async (data) => {
          try {
            const id = nanoid();
            const qso = createQSO(
              {
                callsign: data.callsign,
                band: data.band,
                mode: data.mode,
                rstSent: data.rstSent,
                rstReceived: data.rstReceived,
                frequency: data.frequency,
                gridSquare: data.gridSquare,
                notes: data.notes,
              },
              id
            );

            // Persist for offline-first list/stats; Zustand keeps in-memory list in sync.
            await repository.save(qso);
            addQSO(qso);
            await syncDashboard();

            router.back();
          } catch (error) {
            Alert.alert(
              'Error',
              error instanceof Error ? error.message : 'Failed to log QSO'
            );
          }
        }}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
});
