import { getDatabase } from './database';
import { QSO } from '@core/domain/entities';
import { Callsign, GridSquare, RST } from '@core/domain/value-objects';
import type { BandName } from '@core/domain/value-objects/Band';
import type { ModeName } from '@core/domain/value-objects/Mode';

const DEFAULT_DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

export interface QSORepository {
  save(qso: QSO): Promise<void>;
  findById(id: string): Promise<QSO | null>;
  findAll(): Promise<QSO[]>;
  findByCallsign(callsign: string): Promise<QSO[]>;
  findRecentDuplicate(
    callsign: string,
    band: string,
    mode: string,
    referenceTime: Date,
    windowMs?: number
  ): Promise<QSO | null>;
  update(id: string, updates: Partial<QSO>): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export class SQLiteQSORepository implements QSORepository {
  async save(qso: QSO): Promise<void> {
    try {
      const database = await getDatabase();

      await database.runAsync(
        `INSERT OR REPLACE INTO qsos (
          id, callsign, band, mode, rst_sent, rst_rcvd, frequency, grid, notes, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qso.id,
          qso.callsign.toString(),
          qso.band,
          qso.mode,
          qso.rstSent.toString(),
          qso.rstReceived.toString(),
          qso.frequency ?? null,
          qso.gridSquare?.toString() ?? null,
          qso.notes ?? null,
          qso.timestamp.toISOString(),
        ]
      );

      console.log('[HamLogbook DB] Saved QSO to SQLite:', qso.id);
    } catch (err) {
      console.error('[HamLogbook DB] Failed to save QSO:', err);
      throw err;
    }
  }

  async findById(id: string): Promise<QSO | null> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM qsos WHERE id = ?',
      [id]
    );

    if (!result) {
      return null;
    }

    return this.mapRowToQSO(result);
  }

  async findAll(): Promise<QSO[]> {
    try {
      const database = await getDatabase();
      const rows = await database.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM qsos ORDER BY timestamp DESC'
      );
      const results: QSO[] = [];
      for (const row of rows) {
        try {
          results.push(this.mapRowToQSO(row));
        } catch (error) {
          console.error('[HamLogbook DB] Error mapping QSO row:', error);
        }
      }
      console.log('[HamLogbook DB] Loaded', results.length, 'QSO record(s) from SQLite');
      return results;
    } catch (err) {
      console.error('[HamLogbook DB] findAll failed:', err);
      throw err;
    }
  }

  async findRecentDuplicate(
    callsign: string,
    band: string,
    mode: string,
    referenceTime: Date,
    windowMs: number = DEFAULT_DUPLICATE_WINDOW_MS
  ): Promise<QSO | null> {
    const database = await getDatabase();
    const from = new Date(referenceTime.getTime() - windowMs).toISOString();
    const to = new Date(referenceTime.getTime() + windowMs).toISOString();

    const row = await database.getFirstAsync<Record<string, unknown>>(
      `SELECT * FROM qsos
       WHERE callsign = ? AND band = ? AND mode = ?
         AND timestamp > ? AND timestamp < ?
       ORDER BY timestamp DESC
       LIMIT 1`,
      [callsign.toUpperCase(), band, mode, from, to]
    );

    if (!row) {
      return null;
    }

    return this.mapRowToQSO(row);
  }

  async findByCallsign(callsign: string): Promise<QSO[]> {
    const database = await getDatabase();
    const rows = await database.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM qsos WHERE callsign = ? ORDER BY timestamp DESC',
      [callsign.toUpperCase()]
    );
    const results: QSO[] = [];
    for (const row of rows) {
      try {
        results.push(this.mapRowToQSO(row));
      } catch (error) {
        console.error('[HamLogbook DB] Error mapping QSO row:', error);
      }
    }
    return results;
  }

  async update(id: string, updates: Partial<QSO>): Promise<void> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new Error(`QSO with id ${id} not found`);
    }

    const updated: QSO = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
        version: existing.metadata.version + 1,
      },
    };

    await this.save(updated);
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM qsos WHERE id = ?', [id]);
    console.log('[HamLogbook DB] Deleted QSO from SQLite:', id);
  }

  async count(): Promise<number> {
    const database = await getDatabase();
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM qsos'
    );
    return result?.count ?? 0;
  }

  /**
   * Map a `qsos` row to the domain entity. DB does not store metadata; defaults are applied for in-memory use.
   */
  private mapRowToQSO(row: Record<string, unknown>): QSO {
    const ts = String(row.timestamp);
    const createdAt = new Date(ts);

    return {
      id: String(row.id),
      timestamp: createdAt,
      callsign: Callsign.create(String(row.callsign)),
      band: row.band as BandName,
      mode: row.mode as ModeName,
      rstSent: RST.parse(String(row.rst_sent)),
      rstReceived: RST.parse(String(row.rst_rcvd)),
      frequency: row.frequency != null ? Number(row.frequency) : undefined,
      gridSquare: row.grid ? GridSquare.create(String(row.grid)) : undefined,
      operator: undefined,
      station: undefined,
      notes: row.notes != null ? String(row.notes) : undefined,
      qslSent: false,
      qslReceived: false,
      contestInfo: undefined,
      metadata: {
        source: 'manual',
        synced: false,
        version: 1,
        createdAt,
        updatedAt: createdAt,
      },
    };
  }
}
