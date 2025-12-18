import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/shared/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>HamLogbook</Text>
        <Text style={styles.subtitle}>Smart Amateur Radio Logbook</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/log-qso')}
        >
          <Text style={styles.primaryButtonText}>Log a QSO</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/qso-list')}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Total QSOs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/stats')}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Bands</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/stats')}
          >
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Modes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/qso-list')}
          >
            <Text style={styles.navButtonText}>View Log</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/stats')}
          >
            <Text style={styles.navButtonText}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  primaryButtonText: {
    ...typography.buttonLarge,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  navContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  navButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonText: {
    ...typography.button,
    color: colors.text,
  },
});
