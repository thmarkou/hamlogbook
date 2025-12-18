/**
 * Represents an amateur radio band
 */
export type BandName =
  | '160m'
  | '80m'
  | '60m'
  | '40m'
  | '30m'
  | '20m'
  | '17m'
  | '15m'
  | '12m'
  | '10m'
  | '6m'
  | '2m'
  | '70cm'
  | '33cm'
  | '23cm';

export interface Band {
  name: BandName;
  frequencyRange: [min: number, max: number]; // in MHz
  wavelength: number; // in meters
}

export const BANDS: Record<BandName, Band> = {
  '160m': { name: '160m', frequencyRange: [1.8, 2.0], wavelength: 160 },
  '80m': { name: '80m', frequencyRange: [3.5, 4.0], wavelength: 80 },
  '60m': { name: '60m', frequencyRange: [5.0, 5.4], wavelength: 60 },
  '40m': { name: '40m', frequencyRange: [7.0, 7.3], wavelength: 40 },
  '30m': { name: '30m', frequencyRange: [10.1, 10.15], wavelength: 30 },
  '20m': { name: '20m', frequencyRange: [14.0, 14.35], wavelength: 20 },
  '17m': { name: '17m', frequencyRange: [18.068, 18.168], wavelength: 17 },
  '15m': { name: '15m', frequencyRange: [21.0, 21.45], wavelength: 15 },
  '12m': { name: '12m', frequencyRange: [24.89, 24.99], wavelength: 12 },
  '10m': { name: '10m', frequencyRange: [28.0, 29.7], wavelength: 10 },
  '6m': { name: '6m', frequencyRange: [50.0, 54.0], wavelength: 6 },
  '2m': { name: '2m', frequencyRange: [144.0, 148.0], wavelength: 2 },
  '70cm': { name: '70cm', frequencyRange: [420.0, 450.0], wavelength: 0.7 },
  '33cm': { name: '33cm', frequencyRange: [902.0, 928.0], wavelength: 0.33 },
  '23cm': { name: '23cm', frequencyRange: [1240.0, 1300.0], wavelength: 0.23 },
};

export function getBandByFrequency(frequency: number): Band | null {
  for (const band of Object.values(BANDS)) {
    const [min, max] = band.frequencyRange;
    if (frequency >= min && frequency <= max) {
      return band;
    }
  }
  return null;
}

export function getBandByName(name: string): Band | null {
  return BANDS[name as BandName] || null;
}

