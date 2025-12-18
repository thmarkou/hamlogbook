/**
 * Represents an amateur radio operating mode
 */
export type ModeName =
  | 'SSB'
  | 'CW'
  | 'FT8'
  | 'FT4'
  | 'PSK31'
  | 'RTTY'
  | 'SSTV'
  | 'AM'
  | 'FM'
  | 'DIGITAL'
  | 'OTHER';

export type ModeCategory = 'voice' | 'digital' | 'cw' | 'data';

export interface Mode {
  name: ModeName;
  category: ModeCategory;
  description: string;
}

export const MODES: Record<ModeName, Mode> = {
  SSB: { name: 'SSB', category: 'voice', description: 'Single Sideband' },
  CW: { name: 'CW', category: 'cw', description: 'Continuous Wave (Morse Code)' },
  FT8: { name: 'FT8', category: 'digital', description: 'FT8 Digital Mode' },
  FT4: { name: 'FT4', category: 'digital', description: 'FT4 Digital Mode' },
  PSK31: { name: 'PSK31', category: 'digital', description: 'PSK31 Digital Mode' },
  RTTY: { name: 'RTTY', category: 'digital', description: 'Radio Teletype' },
  SSTV: { name: 'SSTV', category: 'data', description: 'Slow Scan Television' },
  AM: { name: 'AM', category: 'voice', description: 'Amplitude Modulation' },
  FM: { name: 'FM', category: 'voice', description: 'Frequency Modulation' },
  DIGITAL: { name: 'DIGITAL', category: 'digital', description: 'Other Digital Mode' },
  OTHER: { name: 'OTHER', category: 'data', description: 'Other Mode' },
};

export function getModeByName(name: string): Mode | null {
  return MODES[name as ModeName] || null;
}

