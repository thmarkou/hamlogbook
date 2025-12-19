import { SQLiteQSORepository } from './qsoRepository';
import { createQSO } from '@core/domain/entities';
import { nanoid } from 'nanoid/non-secure';

const MOCK_CALLSIGNS = [
  'W1ABC',
  'K2XYZ',
  'N3DEF',
  'VE4GHI',
  'JA5JKL',
  'DL6MNO',
  'F5PQR',
  'I8STU',
  'VK9VWX',
  'ZL2YZ',
];

const BANDS: Array<'160m' | '80m' | '40m' | '20m' | '15m' | '10m' | '6m' | '2m'> = [
  '160m',
  '80m',
  '40m',
  '20m',
  '15m',
  '10m',
  '6m',
  '2m',
];

const MODES: Array<'SSB' | 'CW' | 'FT8' | 'FT4' | 'PSK31' | 'RTTY'> = [
  'SSB',
  'CW',
  'FT8',
  'FT4',
  'PSK31',
  'RTTY',
];

const GRID_SQUARES = [
  'FN31ab',
  'DM04cd',
  'JO55ef',
  'EM97gh',
  'CM87ij',
  'DL48kl',
  'FJ20mn',
  'IO91op',
  'VK37qr',
  'ZL12st',
];

export async function seedMockData(count: number = 10): Promise<void> {
  try {
    console.log(`Starting seedMockData with count: ${count}`);
    const repository = new SQLiteQSORepository();
    
    // Check if we already have data
    const existing = await repository.count();
    if (existing > 0) {
      console.log(`Database already has ${existing} QSOs. Skipping seed.`);
      return;
    }

    console.log('Database is empty, creating mock QSOs...');
    const now = new Date();
    const qsos = [];

    for (let i = 0; i < count; i++) {
    // Random timestamp within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

    const callsign = MOCK_CALLSIGNS[Math.floor(Math.random() * MOCK_CALLSIGNS.length)];
    const band = BANDS[Math.floor(Math.random() * BANDS.length)];
    const mode = MODES[Math.floor(Math.random() * MODES.length)];

    // Random RST (readability: 3-5, strength: 1-9)
    const rstSent = {
      readability: Math.floor(Math.random() * 3) + 3, // 3-5
      strength: Math.floor(Math.random() * 9) + 1, // 1-9
    };
    const rstReceived = {
      readability: Math.floor(Math.random() * 3) + 3,
      strength: Math.floor(Math.random() * 9) + 1,
    };

    // Random frequency based on band
    const frequencyMap: Record<string, number> = {
      '160m': 1.8 + Math.random() * 0.2,
      '80m': 3.5 + Math.random() * 0.5,
      '40m': 7.0 + Math.random() * 0.3,
      '20m': 14.0 + Math.random() * 0.5,
      '15m': 21.0 + Math.random() * 0.5,
      '10m': 28.0 + Math.random() * 0.5,
      '6m': 50.0 + Math.random() * 1.0,
      '2m': 144.0 + Math.random() * 2.0,
    };
    const frequency = frequencyMap[band] || undefined;

    // Random grid square (50% chance)
    const gridSquare = Math.random() > 0.5 
      ? GRID_SQUARES[Math.floor(Math.random() * GRID_SQUARES.length)]
      : undefined;

    // Random notes (30% chance)
    const notes = Math.random() > 0.7
      ? `Great contact! ${mode} on ${band}`
      : undefined;

    const qso = createQSO(
      {
        callsign,
        band,
        mode,
        rstSent,
        rstReceived,
        frequency,
        gridSquare,
        notes,
        timestamp,
      },
      nanoid()
    );

    qsos.push(qso);
  }

    // Save all QSOs
    console.log(`Saving ${qsos.length} QSOs to database...`);
    for (let i = 0; i < qsos.length; i++) {
      const qso = qsos[i];
      try {
        await repository.save(qso);
        if ((i + 1) % 5 === 0) {
          console.log(`Saved ${i + 1}/${qsos.length} QSOs...`);
        }
      } catch (error) {
        console.error(`Failed to save QSO ${i + 1}:`, error);
        throw error;
      }
    }

    // Verify
    const finalCount = await repository.count();
    console.log(`✅ Seeded ${count} mock QSOs. Database now has ${finalCount} QSOs.`);
  } catch (error) {
    console.error('Error in seedMockData:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    throw error;
  }
}

