import { View, StyleSheet } from 'react-native';
import { LogQSOForm } from '@/features/qso-logging/components/LogQSOForm';
import { useRouter } from 'expo-router';
import { useQSStore } from '@/store';
import { SQLiteQSORepository } from '@/core/data/local';
import { createQSO } from '@core/domain/entities';
import { nanoid } from 'nanoid/non-secure';
import { Alert } from 'react-native';

export default function LogQSOScreen() {
  const router = useRouter();
  const { addQSO } = useQSStore();
  const repository = new SQLiteQSORepository();

  const handleSubmit = async (data: {
    callsign: string;
    band: string;
    mode: string;
    rstSent: { readability: number; strength: number };
    rstReceived: { readability: number; strength: number };
    frequency?: number;
    gridSquare?: string;
    notes?: string;
  }) => {
    try {
      const id = nanoid();
      const qso = createQSO(
        {
          callsign: data.callsign,
          band: data.band as any,
          mode: data.mode as any,
          rstSent: data.rstSent,
          rstReceived: data.rstReceived,
          frequency: data.frequency,
          gridSquare: data.gridSquare,
          notes: data.notes,
        },
        id
      );

      // Save to database
      await repository.save(qso);

      // Update store
      addQSO(qso);

      Alert.alert('Success', 'QSO logged successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to log QSO'
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LogQSOForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

