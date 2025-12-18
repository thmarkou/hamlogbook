/**
 * RST (Readability, Strength, Tone) report
 * Used for signal reporting in amateur radio
 */
export class RST {
  private constructor(
    public readonly readability: number,
    public readonly strength: number,
    public readonly tone?: number
  ) {
    if (readability < 1 || readability > 9) {
      throw new Error('Readability must be between 1 and 9');
    }
    if (strength < 1 || strength > 9) {
      throw new Error('Strength must be between 1 and 9');
    }
    if (tone !== undefined && (tone < 1 || tone > 9)) {
      throw new Error('Tone must be between 1 and 9');
    }
  }

  static create(readability: number, strength: number, tone?: number): RST {
    return new RST(readability, strength, tone);
  }

  static parse(value: string): RST {
    const parts = value.split('');
    if (parts.length < 2 || parts.length > 3) {
      throw new Error('RST must be 2 or 3 digits');
    }
    const readability = parseInt(parts[0], 10);
    const strength = parseInt(parts[1], 10);
    const tone = parts.length === 3 ? parseInt(parts[2], 10) : undefined;
    return new RST(readability, strength, tone);
  }

  toString(): string {
    if (this.tone !== undefined) {
      return `${this.readability}${this.strength}${this.tone}`;
    }
    return `${this.readability}${this.strength}`;
  }

  equals(other: RST): boolean {
    return (
      this.readability === other.readability &&
      this.strength === other.strength &&
      this.tone === other.tone
    );
  }
}

