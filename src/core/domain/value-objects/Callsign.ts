import { z } from 'zod';

/**
 * Validates and represents a valid amateur radio callsign
 * Format: 1-2 letter prefix, 1 digit, 1-3 letter suffix
 * Examples: W1ABC, VE3XYZ, G4ABC
 */
const callsignSchema = z
  .string()
  .regex(
    /^[A-Z]{1,2}[0-9][A-Z]{1,3}$/,
    'Invalid callsign format. Must be in format: 1-2 letters, 1 digit, 1-3 letters'
  )
  .min(3)
  .max(7);

export class Callsign {
  private constructor(private readonly value: string) {
    const result = callsignSchema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid callsign: ${result.error.message}`);
    }
  }

  static create(value: string): Callsign {
    return new Callsign(value.toUpperCase().trim());
  }

  static isValid(value: string): boolean {
    return callsignSchema.safeParse(value.toUpperCase().trim()).success;
  }

  toString(): string {
    return this.value;
  }

  equals(other: Callsign): boolean {
    return this.value === other.value;
  }
}

