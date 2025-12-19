import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@shared/theme';
import { useEffect, useState } from 'react';
import { SQLiteQSORepository } from '@/core/data/local';
import { seedMockData } from '@/core/data/local/seedMockData';

export default function Index() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalQsos: 0,
    uniqueCallsigns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const repository = new SQLiteQSORepository();
      const count = await repository.count();
      
      if (count === 0) {
        // Seed mock data if database is empty
        await seedMockData(15);
      }

      const allQsos = await repository.findAll();
      const uniqueCallsigns = new Set(
        allQsos.map((qso) => qso.callsign.toString().toUpperCase())
      ).size;

      setStats({
        totalQsos: allQsos.length,
        uniqueCallsigns,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HamLogbook</Text>
        <Text style={styles.subtitle}>Smart Amateur Radio Logbook</Text>
      </View>

      {!isLoading && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalQsos}</Text>
            <Text style={styles.statLabel}>Total QSOs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.uniqueCallsigns}</Text>
            <Text style={styles.statLabel}>Unique Callsigns</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/log-qso')}
        >
          <Text style={styles.primaryButtonText}>Log a QSO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/qso-list')}
        >
          <Text style={styles.buttonText}>View QSO Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/stats')}
        >
          <Text style={styles.buttonText}>Statistics</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: {
    ...typography.display,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    ...typography.h3,
    color: colors.text,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
});
