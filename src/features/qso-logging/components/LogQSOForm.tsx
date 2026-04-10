import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { typography, spacing } from '@shared/theme';
import type { BandName } from '@core/domain/value-objects/Band';
import { BANDS } from '@core/domain/value-objects/Band';
import type { ModeName } from '@core/domain/value-objects/Mode';
import { MODES } from '@core/domain/value-objects/Mode';
import { Callsign } from '@core/domain/value-objects/Callsign';
import type { QSO } from '@core/domain/entities';

/** Pure black screen background (spec). */
const SCREEN_BG = '#000000';
/** Active segment and primary button fill (spec). */
const ACCENT_BLUE = '#3B82F6';
/** Dark gray for text fields, RST cells, and unselected segments. */
const FIELD_GRAY = '#1C1C1E';
/** Cancel button background. */
const SECONDARY_BTN_GRAY = '#2C2C2E';
const LABEL_COLOR = '#FFFFFF';
const PLACEHOLDER_GRAY = '#808080';
const MUTED_LABEL = '#B0B0B0';

const BAND_ORDER: BandName[] = [
  '160m',
  '80m',
  '60m',
  '40m',
  '30m',
  '20m',
  '17m',
  '15m',
  '12m',
  '10m',
  '6m',
  '2m',
  '70cm',
  '33cm',
  '23cm',
];

const MODE_ORDER: ModeName[] = (Object.keys(MODES) as ModeName[]).filter((m) => m in MODES);

/** Keep a single RST digit in 1..9 for split RST inputs. */
function clampRstDigit(raw: string): string {
  const digit = raw.replace(/\D/g, '').slice(-1);
  if (!digit) return '';
  const n = parseInt(digit, 10);
  if (n < 1) return '1';
  if (n > 9) return '9';
  return String(n);
}

export interface LogQSOFormSubmitData {
  callsign: string;
  band: BandName;
  mode: ModeName;
  rstSent: { readability: number; strength: number };
  rstReceived: { readability: number; strength: number };
  frequency?: number;
  gridSquare?: string;
  notes?: string;
}

interface LogQSOFormProps {
  onSubmit: (data: LogQSOFormSubmitData) => void | Promise<void>;
  onCancel: () => void;
  checkDuplicateInDb: (
    callsign: string,
    band: BandName,
    mode: ModeName,
    at: Date
  ) => Promise<QSO | null>;
}

export function LogQSOForm({ onSubmit, onCancel, checkDuplicateInDb }: LogQSOFormProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildPayload = (): LogQSOFormSubmitData => ({
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
    frequency: frequency.trim() ? parseFloat(frequency) : undefined,
    gridSquare: gridSquare.trim() || undefined,
    notes: notes.trim() || undefined,
  });

  const submitPayload = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!Callsign.isValid(callsign)) {
      Alert.alert('Invalid Callsign', 'Please enter a valid callsign');
      return;
    }

    const r = parseInt(rstSentReadability, 10);
    const s = parseInt(rstSentStrength, 10);
    const rr = parseInt(rstReceivedReadability, 10);
    const rs = parseInt(rstReceivedStrength, 10);
    if ([r, s, rr, rs].some((n) => Number.isNaN(n) || n < 1 || n > 9)) {
      Alert.alert('Invalid RST', 'RST values must be digits from 1 to 9');
      return;
    }

    const duplicate = await checkDuplicateInDb(
      callsign.toUpperCase().trim(),
      band,
      mode,
      new Date()
    );
    if (duplicate) {
      Alert.alert(
        'Duplicate QSO',
        'A similar QSO was logged recently. Do you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => void submitPayload() },
        ]
      );
      return;
    }

    await submitPayload();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Callsign *</Text>
            <TextInput
              style={styles.textField}
              value={callsign}
              onChangeText={setCallsign}
              placeholder="W1ABC"
              placeholderTextColor={PLACEHOLDER_GRAY}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {/* Horizontal segment control for band */}
          <View style={styles.field}>
            <Text style={styles.label}>Band *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.segmentScrollContent}
            >
              {BAND_ORDER.filter((b) => b in BANDS).map((name) => {
                const selected = band === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => setBand(name)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Horizontal segment control for mode */}
          <View style={styles.field}>
            <Text style={styles.label}>Mode *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.segmentScrollContent}
            >
              {MODE_ORDER.map((name) => {
                const selected = mode === name;
                return (
                  <TouchableOpacity
                    key={name}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => setMode(name)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* RST sent: two single-digit fields separated by slash */}
          <View style={styles.field}>
            <Text style={styles.label}>RST Sent *</Text>
            <View style={styles.rstRow}>
              <TextInput
                style={styles.rstInput}
                value={rstSentReadability}
                onChangeText={(t) => setRstSentReadability(clampRstDigit(t))}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="5"
                placeholderTextColor={PLACEHOLDER_GRAY}
              />
              <Text style={styles.rstSlash}>/</Text>
              <TextInput
                style={styles.rstInput}
                value={rstSentStrength}
                onChangeText={(t) => setRstSentStrength(clampRstDigit(t))}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="9"
                placeholderTextColor={PLACEHOLDER_GRAY}
              />
            </View>
          </View>

          {/* RST received: two single-digit fields separated by slash */}
          <View style={styles.field}>
            <Text style={styles.label}>RST Received *</Text>
            <View style={styles.rstRow}>
              <TextInput
                style={styles.rstInput}
                value={rstReceivedReadability}
                onChangeText={(t) => setRstReceivedReadability(clampRstDigit(t))}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="5"
                placeholderTextColor={PLACEHOLDER_GRAY}
              />
              <Text style={styles.rstSlash}>/</Text>
              <TextInput
                style={styles.rstInput}
                value={rstReceivedStrength}
                onChangeText={(t) => setRstReceivedStrength(clampRstDigit(t))}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="9"
                placeholderTextColor={PLACEHOLDER_GRAY}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Frequency (MHz)</Text>
            <TextInput
              style={styles.textField}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="14.200"
              placeholderTextColor={PLACEHOLDER_GRAY}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Grid Square</Text>
            <TextInput
              style={styles.textField}
              value={gridSquare}
              onChangeText={setGridSquare}
              placeholder="FN31ab"
              placeholderTextColor={PLACEHOLDER_GRAY}
              autoCapitalize="characters"
              maxLength={6}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.textField, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              placeholderTextColor={PLACEHOLDER_GRAY}
              multiline
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={onCancel}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelBtnLabel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.submitBtn]}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={LABEL_COLOR} />
              ) : (
                <Text style={styles.submitBtnLabel}>Log QSO</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: LABEL_COLOR,
    marginBottom: spacing.sm,
  },
  textField: {
    backgroundColor: FIELD_GRAY,
    color: LABEL_COLOR,
    ...typography.body,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  segmentScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  segment: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    backgroundColor: FIELD_GRAY,
  },
  segmentSelected: {
    backgroundColor: ACCENT_BLUE,
  },
  segmentLabel: {
    ...typography.body,
    color: MUTED_LABEL,
    fontWeight: '500',
  },
  segmentLabelSelected: {
    color: LABEL_COLOR,
    fontWeight: '600',
  },
  rstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rstInput: {
    backgroundColor: FIELD_GRAY,
    color: LABEL_COLOR,
    ...typography.h3,
    width: 56,
    height: 52,
    borderRadius: 12,
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  rstSlash: {
    ...typography.h2,
    color: LABEL_COLOR,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: SECONDARY_BTN_GRAY,
  },
  cancelBtnLabel: {
    ...typography.buttonLarge,
    color: LABEL_COLOR,
  },
  submitBtn: {
    backgroundColor: ACCENT_BLUE,
  },
  submitBtnLabel: {
    ...typography.buttonLarge,
    color: LABEL_COLOR,
  },
});
