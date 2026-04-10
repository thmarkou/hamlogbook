import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useQSStore } from '@/store';
import { typography, spacing } from '@shared/theme';

/** Screen background (spec). */
const SCREEN_BG = '#000000';
/** Primary metric color (spec). */
const ACCENT_BLUE = '#3B82F6';
/** Stat / section card background — matches dashboard tiles. */
const CARD_BG = '#1C1C1E';
/** Tag chips inside breakdown sections. */
const TAG_BG = '#2C2C2E';
const TEXT_WHITE = '#FFFFFF';
const TEXT_MUTED = '#B0B0B0';

type QSOList = ReturnType<typeof useQSStore.getState>['qsos'];

/**
 * Build headline counts and unique band/mode/callsign sets from the Zustand QSO list.
 */
function buildStats(qsos: QSOList) {
  const bandSet = new Set<string>();
  const modeSet = new Set<string>();
  const callsignSet = new Set<string>();

  for (const qso of qsos) {
    bandSet.add(qso.band);
    modeSet.add(qso.mode);
    callsignSet.add(qso.callsign.toString().toUpperCase());
  }

  return {
    totalQsos: qsos.length,
    uniqueCallsigns: callsignSet.size,
    bands: bandSet,
    modes: modeSet,
  };
}

export default function StatsScreen() {
  const qsos = useQSStore((s) => s.qsos);
  const isLoading = useQSStore((s) => s.isLoading);
  const loadQSosFromDatabase = useQSStore((s) => s.loadQSosFromDatabase);

  const { totalQsos, uniqueCallsigns, bands, modes } = useMemo(
    () => buildStats(qsos),
    [qsos]
  );

  const [refreshing, setRefreshing] = useState(false);

  // Keep Zustand in sync with SQLite when this screen is opened.
  useFocusEffect(
    useCallback(() => {
      void loadQSosFromDatabase();
    }, [loadQSosFromDatabase])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadQSosFromDatabase();
    } finally {
      setRefreshing(false);
    }
  }, [loadQSosFromDatabase]);

  const sortedBands = useMemo(() => Array.from(bands).sort(), [bands]);
  const sortedModes = useMemo(() => Array.from(modes).sort(), [modes]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={ACCENT_BLUE}
          />
        }
      >
        <Text style={styles.pageTitle}>Statistics</Text>

        {/* Same two-up stat cards as the home dashboard */}
        <View style={styles.statsRow}>
          <View style={styles.headlineCard}>
            <Text style={styles.headlineValue}>{totalQsos}</Text>
            <Text style={styles.headlineLabel}>Total QSOs</Text>
          </View>
          <View style={styles.headlineCard}>
            <Text style={styles.headlineValue}>{uniqueCallsigns}</Text>
            <Text style={styles.headlineLabel}>Unique Callsigns</Text>
          </View>
        </View>

        {/* Bands: count in blue, unique band names as dark gray tags */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bands Worked</Text>
          <Text style={styles.sectionCount}>{bands.size}</Text>
          <View style={styles.tagWrap}>
            {sortedBands.map((band) => (
              <View key={band} style={styles.tag}>
                <Text style={styles.tagText}>{band}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Modes: count in blue, unique mode names as dark gray tags */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Modes Used</Text>
          <Text style={styles.sectionCount}>{modes.size}</Text>
          <View style={styles.tagWrap}>
            {sortedModes.map((mode) => (
              <View key={mode} style={styles.tag}>
                <Text style={styles.tagText}>{mode}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    ...typography.h1,
    fontWeight: '700',
    color: TEXT_WHITE,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headlineCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  headlineValue: {
    ...typography.display,
    color: ACCENT_BLUE,
    marginBottom: spacing.xs,
  },
  headlineLabel: {
    ...typography.bodySmall,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: TEXT_WHITE,
    marginBottom: spacing.sm,
  },
  sectionCount: {
    ...typography.h2,
    color: ACCENT_BLUE,
    marginBottom: spacing.md,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: TAG_BG,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  tagText: {
    ...typography.bodySmall,
    color: TEXT_WHITE,
  },
});
