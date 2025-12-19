import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, typography, spacing } from '@shared/theme';
import { useEffect, useState, useCallback } from 'react';
import { SQLiteQSORepository } from '@/core/data/local';
import { seedMockData } from '@/core/data/local/seedMockData';
import { Alert } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalQsos: 0,
    uniqueCallsigns: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      console.log('=== Loading stats ===');
      setError(null);
      setIsLoading(true);
      
      const repository = new SQLiteQSORepository();
      console.log('Repository created');
      
      const count = await repository.count();
      console.log(`Current QSO count: ${count}`);
      
      if (count === 0) {
        console.log('Database is empty, seeding mock data...');
        try {
          await seedMockData(15);
          console.log('Mock data seeded successfully');
        } catch (seedError) {
          console.error('Error seeding mock data:', seedError);
          setError(`Failed to seed data: ${seedError instanceof Error ? seedError.message : 'Unknown error'}`);
          Alert.alert('Error', `Failed to seed mock data: ${seedError instanceof Error ? seedError.message : 'Unknown error'}`);
        }
      }

      const allQsos = await repository.findAll();
      console.log(`Loaded ${allQsos.length} QSOs from database`);
      
      const uniqueCallsigns = new Set(
        allQsos.map((qso) => qso.callsign.toString().toUpperCase())
      ).size;

      setStats({
        totalQsos: allQsos.length,
        uniqueCallsigns,
      });
      console.log(`Stats updated: ${allQsos.length} QSOs, ${uniqueCallsigns} unique callsigns`);
    } catch (error) {
      console.error('Failed to load stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Stack:', error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reload stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HamLogbook</Text>
        <Text style={styles.subtitle}>Smart Amateur Radio Logbook</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
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

        {/* Debug: Force seed mock data */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.warning }]}
            onPress={async () => {
              try {
                console.log('Manual seed triggered');
                await seedMockData(15);
                Alert.alert('Success', 'Mock data seeded! Reloading stats...');
                await loadStats();
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to seed');
              }
            }}
          >
            <Text style={styles.buttonText}>🔧 Debug: Seed Mock Data</Text>
          </TouchableOpacity>
        )}
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
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.button,
    color: colors.text,
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
