import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQSStore } from '@/store';
import { useEffect, useState } from 'react';
import { QSO } from '@core/domain/entities';
import { SQLiteQSORepository } from '@/core/data/local';
import { colors, typography, spacing } from '@shared/theme';
import { format } from 'date-fns';

export default function QSOListScreen() {
  const { qsos } = useQSStore();
  const [localQsos, setLocalQsos] = useState<QSO[]>([]);
  const repository = new SQLiteQSORepository();

  useEffect(() => {
    loadQSOs();
  }, []);

  const loadQSOs = async () => {
    try {
      const allQsos = await repository.findAll();
      setLocalQsos(allQsos);
    } catch (error) {
      console.error('Failed to load QSOs:', error);
    }
  };

  const renderQSO = ({ item }: { item: QSO }) => {
    return (
      <View style={styles.qsoCard}>
        <View style={styles.qsoHeader}>
          <Text style={styles.callsign}>{item.callsign.toString()}</Text>
          <Text style={styles.timestamp}>
            {format(item.timestamp, 'MMM dd, HH:mm')}
          </Text>
        </View>
        <View style={styles.qsoDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Band:</Text>
            <Text style={styles.detailValue}>{item.band}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mode:</Text>
            <Text style={styles.detailValue}>{item.mode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>RST:</Text>
            <Text style={styles.detailValue}>
              {item.rstSent.toString()} / {item.rstReceived.toString()}
            </Text>
          </View>
          {item.frequency && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Freq:</Text>
              <Text style={styles.detailValue}>{item.frequency.toFixed(3)} MHz</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QSO Log</Text>
        <Text style={styles.count}>{localQsos.length} QSOs</Text>
      </View>
      {localQsos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No QSOs logged yet</Text>
          <Text style={styles.emptySubtext}>
            Tap "Log a QSO" to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={localQsos}
          renderItem={renderQSO}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={false}
          onRefresh={loadQSOs}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
  },
  qsoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qsoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  callsign: {
    ...typography.h3,
    color: colors.primary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  qsoDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    minWidth: 60,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

