import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors, typography, spacing } from '@shared/theme';
import { useEffect, useState } from 'react';
import { SQLiteQSORepository } from '@/core/data/local';

export default function StatsScreen() {
  const [stats, setStats] = useState({
    totalQsos: 0,
    bands: new Set<string>(),
    modes: new Set<string>(),
    uniqueCallsigns: new Set<string>(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const repository = new SQLiteQSORepository();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const allQsos = await repository.findAll();
      const bands = new Set<string>();
      const modes = new Set<string>();
      const callsigns = new Set<string>();

      allQsos.forEach((qso) => {
        bands.add(qso.band);
        modes.add(qso.mode);
        callsigns.add(qso.callsign.toString());
      });

      setStats({
        totalQsos: allQsos.length,
        bands,
        modes,
        uniqueCallsigns: callsigns,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStats();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Statistics</Text>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalQsos}</Text>
          <Text style={styles.statLabel}>Total QSOs</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.uniqueCallsigns.size}</Text>
          <Text style={styles.statLabel}>Unique Callsigns</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bands Worked</Text>
          <Text style={styles.sectionValue}>{stats.bands.size}</Text>
          <View style={styles.bandList}>
            {Array.from(stats.bands).sort().map((band) => (
              <View key={band} style={styles.bandTag}>
                <Text style={styles.bandTagText}>{band}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modes Used</Text>
          <Text style={styles.sectionValue}>{stats.modes.size}</Text>
          <View style={styles.modeList}>
            {Array.from(stats.modes).sort().map((mode) => (
              <View key={mode} style={styles.modeTag}>
                <Text style={styles.modeTagText}>{mode}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.display,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  bandList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bandTag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  bandTagText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  modeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeTag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  modeTagText: {
    ...typography.bodySmall,
    color: colors.text,
  },
});

