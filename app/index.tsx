import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { colors, typography, spacing } from '@shared/theme';
import { useDashboardStatsStore } from '@/store';

const PURE_BLACK = '#000000';

export default function Index() {
  const router = useRouter();
  const totalQsos = useDashboardStatsStore((s) => s.totalQsos);
  const uniqueCallsigns = useDashboardStatsStore((s) => s.uniqueCallsigns);
  const syncFromDatabase = useDashboardStatsStore((s) => s.syncFromDatabase);

  useFocusEffect(
    useCallback(() => {
      void syncFromDatabase();
    }, [syncFromDatabase])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>HamLogbook</Text>
          <Text style={styles.subtitle}>Smart Amateur Radio Logbook</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalQsos}</Text>
            <Text style={styles.statLabel}>Total QSOs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{uniqueCallsigns}</Text>
            <Text style={styles.statLabel}>Unique Callsigns</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => router.push('/log-qso')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonPrimaryLabel}>Log a QSO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/qso-list')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonSecondaryLabel}>View QSO Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/stats')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonSecondaryLabel}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PURE_BLACK,
  },
  scroll: {
    flex: 1,
    backgroundColor: PURE_BLACK,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
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
    color: colors.text,
    opacity: 0.85,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dashboardStatCard,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
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
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  button: {
    minHeight: 56,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonPrimaryLabel: {
    ...typography.buttonLarge,
    color: colors.text,
  },
  buttonSecondary: {
    backgroundColor: colors.dashboardSecondaryButton,
  },
  buttonSecondaryLabel: {
    ...typography.buttonLarge,
    color: colors.text,
  },
});
