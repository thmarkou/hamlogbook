/**
 * Maidenhead Grid Square Locator System
 * Format: 2 letters, 2 digits, 2 letters (e.g., FN31ab)
 */
const GRID_SQUARE_REGEX = /^[A-R]{2}[0-9]{2}[A-X]{2}$/i;

export class GridSquare {
  private constructor(private readonly value: string) {
    const normalized = value.toUpperCase().trim();
    if (!GRID_SQUARE_REGEX.test(normalized)) {
      throw new Error(
        'Invalid grid square format. Must be in format: 2 letters, 2 digits, 2 letters (e.g., FN31ab)'
      );
    }
  }

  static create(value: string): GridSquare {
    return new GridSquare(value);
  }

  static isValid(value: string): boolean {
    return GRID_SQUARE_REGEX.test(value.toUpperCase().trim());
  }

  toString(): string {
    return this.value.toUpperCase();
  }

  equals(other: GridSquare): boolean {
    return this.value.toUpperCase() === other.value.toUpperCase();
  }

  /**
   * Calculate distance between two grid squares in kilometers
   */
  distanceTo(other: GridSquare): number {
    const [lat1, lon1] = this.toLatLon();
    const [lat2, lon2] = other.toLatLon();
    return this.haversineDistance(lat1, lon1, lat2, lon2);
  }

  /**
   * Convert grid square to latitude/longitude
   */
  private toLatLon(): [number, number] {
    const grid = this.value.toUpperCase();
    const lon = ((grid.charCodeAt(0) - 65) * 20 + parseInt(grid[2], 10) * 2 + (grid.charCodeAt(4) - 65) / 12) - 180;
    const lat = ((grid.charCodeAt(1) - 65) * 10 + parseInt(grid[3], 10) + (grid.charCodeAt(5) - 65) / 24) - 90;
    return [lat, lon];
  }

  /**
   * Haversine formula for distance calculation
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

