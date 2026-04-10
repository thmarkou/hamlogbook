import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Share2 } from 'lucide-react-native';
import type { QSO } from '@core/domain/entities';
import { useQSStore } from '@/store';
import { typography, spacing } from '@shared/theme';
import { format } from 'date-fns';
import { exportToADIF } from '@/features/adif/exportToADIF';

/** Screen background (spec). */
const SCREEN_BG = '#000000';
/** Callsign accent (spec). */
const ACCENT_BLUE = '#3B82F6';
/** Card fill — dark gray. */
const CARD_BG = '#1C1C1E';
/** Primary text and field labels (spec: white labels). */
const TEXT_WHITE = '#FFFFFF';
/** Timestamp and secondary chrome. */
const TEXT_MUTED = '#B0B0B0';
/** Error banner accent (keep visible on black). */
const ERROR_RED = '#EF4444';
const ERROR_TINT_BG = 'rgba(239, 68, 68, 0.15)';
const BTN_GRAY = '#2C2C2E';

/**
 * Empty / loading footer for FlatList when there are no rows.
 */
function QSOListEmpty({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={ACCENT_BLUE} />
      </View>
    );
  }
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No QSOs found</Text>
    </View>
  );
}

export default function QSOListScreen() {
  const qsos = useQSStore((s) => s.qsos);
  const qsoCount = useQSStore((s) => s.qsos.length);
  const isLoading = useQSStore((s) => s.isLoading);
  const loadError = useQSStore((s) => s.error);
  const clearError = useQSStore((s) => s.clearError);
  const loadQSosFromDatabase = useQSStore((s) => s.loadQSosFromDatabase);

  // Latest QSO first even if the store was updated by append-only actions.
  const sortedQsos = useMemo(
    () => [...qsos].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [qsos]
  );

  useFocusEffect(
    useCallback(() => {
      void loadQSosFromDatabase();
    }, [loadQSosFromDatabase])
  );

  const handleExportAdif = useCallback(async () => {
    try {
      await exportToADIF(sortedQsos);
    } catch (err) {
      console.error('[HamLogbook] ADIF export failed:', err);
      Alert.alert(
        'Export failed',
        err instanceof Error ? err.message : 'Could not create ADIF file'
      );
    }
  }, [sortedQsos]);

  const renderItem: ListRenderItem<QSO> = useCallback(({ item }) => {
    const freqLabel =
      item.frequency != null ? `${item.frequency.toFixed(3)} MHz` : '—';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.callsign}>{item.callsign.toString()}</Text>
          <Text style={styles.timestamp}>{format(item.timestamp, 'MMM d, HH:mm')}</Text>
        </View>
        {/* Band / Mode / RST / Frequency — label + value rows, white labels */}
        <View style={styles.details}>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Band</Text>
            <Text style={styles.detailValue}>{item.band}</Text>
          </View>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Mode</Text>
            <Text style={styles.detailValue}>{item.mode}</Text>
          </View>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>RST</Text>
            <Text style={styles.detailValue}>
              {item.rstSent.toString()} / {item.rstReceived.toString()}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>{freqLabel}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const listHeader = (
    <View>
      {loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{loadError}</Text>
          <View style={styles.errorBannerActions}>
            <TouchableOpacity
              onPress={() => clearError()}
              style={styles.errorBannerBtn}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
            >
              <Text style={styles.errorBannerBtnLabel}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void loadQSosFromDatabase()}
              style={[styles.errorBannerBtn, styles.errorBannerBtnPrimary]}
              accessibilityRole="button"
              accessibilityLabel="Retry loading QSOs"
            >
              <Text style={styles.errorBannerBtnLabelPrimary}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>QSO Log</Text>
          <Text style={styles.subtitle}>
            {qsoCount} {qsoCount === 1 ? 'QSO' : 'QSOs'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => void handleExportAdif()}
          accessibilityRole="button"
          accessibilityLabel="Export ADIF and share"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Share2 size={26} color={ACCENT_BLUE} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={sortedQsos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={<QSOListEmpty loading={isLoading} />}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading && sortedQsos.length > 0}
        onRefresh={() => void loadQSosFromDatabase()}
        initialNumToRender={12}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: ERROR_TINT_BG,
    borderWidth: 1,
    borderColor: ERROR_RED,
  },
  errorBannerText: {
    ...typography.bodySmall,
    color: ERROR_RED,
    marginBottom: spacing.sm,
  },
  errorBannerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  errorBannerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: BTN_GRAY,
  },
  errorBannerBtnPrimary: {
    backgroundColor: ACCENT_BLUE,
  },
  errorBannerBtnLabel: {
    ...typography.label,
    color: TEXT_WHITE,
  },
  errorBannerBtnLabelPrimary: {
    ...typography.label,
    color: TEXT_WHITE,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  shareButton: {
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: TEXT_WHITE,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: TEXT_MUTED,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  callsign: {
    ...typography.h3,
    fontWeight: '700',
    color: ACCENT_BLUE,
    flex: 1,
    marginRight: spacing.md,
  },
  timestamp: {
    ...typography.bodySmall,
    color: TEXT_MUTED,
    textAlign: 'right',
  },
  details: {
    gap: spacing.sm,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    ...typography.caption,
    color: TEXT_WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    ...typography.body,
    color: TEXT_WHITE,
    flexShrink: 0,
    textAlign: 'right',
    maxWidth: '65%',
  },
  emptyState: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
