import type { QSO } from '@core/domain/entities';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * One ADIF field: <TAG:N>value where N is the character length of value.
 */
function adifField(tag: string, value: string): string {
  return `<${tag}:${value.length}>${value}`;
}

/** ADIF QSO_DATE: UTC YYYYMMDD */
function utcQsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** ADIF TIME_ON: UTC HHMMSS */
function utcTimeOn(d: Date): string {
  const h = String(d.getUTCHours()).padStart(2, '0');
  const mi = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${h}${mi}${s}`;
}

/**
 * Single QSO as one ADIF row (fields concatenated, terminated by <EOR>).
 */
function formatQsoRecord(q: QSO): string {
  const parts: string[] = [];

  parts.push(adifField('CALL', q.callsign.toString().toUpperCase()));
  parts.push(adifField('BAND', String(q.band).toUpperCase()));
  parts.push(adifField('MODE', q.mode));
  parts.push(adifField('QSO_DATE', utcQsoDate(q.timestamp)));
  parts.push(adifField('TIME_ON', utcTimeOn(q.timestamp)));
  parts.push(adifField('RST_SENT', q.rstSent.toString()));
  parts.push(adifField('RST_RCVD', q.rstReceived.toString()));

  if (q.frequency != null) {
    parts.push(adifField('FREQ', String(q.frequency)));
  }

  if (q.gridSquare) {
    parts.push(adifField('GRIDSQUARE', q.gridSquare.toString().toUpperCase()));
  }

  if (q.notes?.trim()) {
    const safeNotes = q.notes.trim().replace(/\r?\n/g, ' ');
    parts.push(adifField('NOTES', safeNotes));
  }

  parts.push('<EOR>');
  return parts.join('');
}

/**
 * Full ADIF document: preamble line, header (ADIF_VER, PROGRAMID), <EOH>, then records.
 */
export function buildAdifString(qsos: QSO[]): string {
  const lines: string[] = [
    'HamLogbook export',
    adifField('ADIF_VER', '3.1.0'),
    adifField('PROGRAMID', 'HamLogbook'),
    '<EOH>',
  ];

  for (const q of qsos) {
    lines.push(formatQsoRecord(q));
  }

  return lines.join('\n');
}

/**
 * Writes all given QSOs to a temporary .adi file and opens the native share sheet.
 * Call with the current list from the Zustand store (e.g. sorted as on screen).
 */
export async function exportToADIF(qsos: QSO[]): Promise<void> {
  if (qsos.length === 0) {
    Alert.alert('Nothing to export', 'Add QSOs before exporting ADIF.');
    return;
  }

  const content = buildAdifString(qsos);
  const filename = `hamlogbook_${Date.now()}.adi`;
  const base = FileSystem.cacheDirectory;
  if (!base) {
    console.error('[HamLogbook ADIF] cacheDirectory is not available');
    throw new Error('File system cache is not available');
  }

  const uri = `${base}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  console.log('[HamLogbook ADIF] Wrote', filename, `(${qsos.length} QSO(s))`);

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    console.warn('[HamLogbook ADIF] Sharing is not available on this platform');
    Alert.alert('Sharing unavailable', 'Cannot open the share sheet on this device.');
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'application/octet-stream',
    dialogTitle: 'Export ADIF',
    UTI: 'public.plain-text',
  });
  console.log('[HamLogbook ADIF] Share sheet presented');
}
