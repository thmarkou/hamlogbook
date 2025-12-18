import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '@shared/theme';
import { BandName, BANDS } from '@core/domain/value-objects/Band';
import { ModeName, MODES } from '@core/domain/value-objects/Mode';
import { Callsign } from '@core/domain/value-objects/Callsign';
import { useQSStore } from '@/store';

interface LogQSOFormProps {
  onSubmit: (data: {
    callsign: string;
    band: BandName;
    mode: ModeName;
    rstSent: { readability: number; strength: number };
    rstReceived: { readability: number; strength: number };
    frequency?: number;
    gridSquare?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function LogQSOForm({ onSubmit, onCancel }: LogQSOFormProps) {
  const [callsign, setCallsign] = useState('');
  const [band, setBand] = useState<BandName>('20m');
  const [mode, setMode] = useState<ModeName>('SSB');
  const [rstSentReadability, setRstSentReadability] = useState('5');
  const [rstSentStrength, setRstSentStrength] = useState('9');
  const [rstReceivedReadability, setRstReceivedReadability] = useState('5');
  const [rstReceivedStrength, setRstReceivedStrength] = useState('9');
  const [frequency, setFrequency] = useState('');
  const [gridSquare, setGridSquare] = useState('');
  const [notes, setNotes] = useState('');

  const { checkDuplicate } = useQSStore();

  const handleSubmit = () => {
    // Validate callsign
    if (!Callsign.isValid(callsign)) {
      Alert.alert('Invalid Callsign', 'Please enter a valid callsign');
      return;
    }

    // Check for duplicate
    const duplicate = checkDuplicate(callsign, band, mode, new Date());
    if (duplicate) {
      Alert.alert(
        'Duplicate QSO',
        'A similar QSO was logged recently. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => proceedWithSubmit() },
        ]
      );
      return;
    }

    proceedWithSubmit();
  };

  const proceedWithSubmit = () => {
    onSubmit({
      callsign: callsign.toUpperCase().trim(),
      band,
      mode,
      rstSent: {
        readability: parseInt(rstSentReadability, 10),
        strength: parseInt(rstSentStrength, 10),
      },
      rstReceived: {
        readability: parseInt(rstReceivedReadability, 10),
        strength: parseInt(rstReceivedStrength, 10),
      },
      frequency: frequency ? parseFloat(frequency) : undefined,
      gridSquare: gridSquare.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Callsign */}
        <View style={styles.field}>
          <Text style={styles.label}>Callsign *</Text>
          <TextInput
            style={styles.input}
            value={callsign}
            onChangeText={setCallsign}
            placeholder="W1ABC"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Band */}
        <View style={styles.field}>
          <Text style={styles.label}>Band *</Text>
          <View style={styles.bandContainer}>
            {Object.keys(BANDS).slice(0, 8).map((bandName) => (
              <TouchableOpacity
                key={bandName}
                style={[
                  styles.bandButton,
                  band === bandName && styles.bandButtonActive,
                ]}
                onPress={() => setBand(bandName as BandName)}
              >
                <Text
                  style={[
                    styles.bandButtonText,
                    band === bandName && styles.bandButtonTextActive,
                  ]}
                >
                  {bandName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode */}
        <View style={styles.field}>
          <Text style={styles.label}>Mode *</Text>
          <View style={styles.modeContainer}>
            {(['SSB', 'CW', 'FT8', 'FT4', 'PSK31', 'RTTY'] as ModeName[]).map(
              (modeName) => (
                <TouchableOpacity
                  key={modeName}
                  style={[
                    styles.modeButton,
                    mode === modeName && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode(modeName)}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === modeName && styles.modeButtonTextActive,
                    ]}
                  >
                    {modeName}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* RST Sent */}
        <View style={styles.field}>
          <Text style={styles.label}>RST Sent *</Text>
          <View style={styles.rstContainer}>
            <TextInput
              style={[styles.rstInput, styles.rstReadability]}
              value={rstSentReadability}
              onChangeText={setRstSentReadability}
              keyboardType="numeric"
              maxLength={1}
              placeholder="5"
            />
            <Text style={styles.rstSeparator}>/</Text>
            <TextInput
              style={[styles.rstInput, styles.rstStrength]}
              value={rstSentStrength}
              onChangeText={setRstSentStrength}
              keyboardType="numeric"
              maxLength={1}
              placeholder="9"
            />
          </View>
        </View>

        {/* RST Received */}
        <View style={styles.field}>
          <Text style={styles.label}>RST Received *</Text>
          <View style={styles.rstContainer}>
            <TextInput
              style={[styles.rstInput, styles.rstReadability]}
              value={rstReceivedReadability}
              onChangeText={setRstReceivedReadability}
              keyboardType="numeric"
              maxLength={1}
              placeholder="5"
            />
            <Text style={styles.rstSeparator}>/</Text>
            <TextInput
              style={[styles.rstInput, styles.rstStrength]}
              value={rstReceivedStrength}
              onChangeText={setRstReceivedStrength}
              keyboardType="numeric"
              maxLength={1}
              placeholder="9"
            />
          </View>
        </View>

        {/* Frequency (optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Frequency (MHz)</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="14.200"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Grid Square (optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Grid Square</Text>
          <TextInput
            style={styles.input}
            value={gridSquare}
            onChangeText={setGridSquare}
            placeholder="FN31ab"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            maxLength={6}
          />
        </View>

        {/* Notes (optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Log QSO</Text>
          </TouchableOpacity>
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
  form: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bandContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  bandButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bandButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bandButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bandButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  modeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  rstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rstInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.h3,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  rstReadability: {
    width: 60,
  },
  rstStrength: {
    width: 60,
  },
  rstSeparator: {
    ...typography.h2,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    ...typography.button,
    color: colors.text,
  },
});

