import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 48,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  navContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    width: '100%',
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
