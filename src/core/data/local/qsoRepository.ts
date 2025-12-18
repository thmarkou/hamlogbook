import { getDatabase } from './database';
import { QSO } from '@core/domain/entities';
import { Callsign, GridSquare, RST } from '@core/domain/value-objects';

export interface QSORepository {
  save(qso: QSO): Promise<void>;
  findById(id: string): Promise<QSO | null>;
  findAll(): Promise<QSO[]>;
  findByCallsign(callsign: string): Promise<QSO[]>;
  update(id: string, updates: Partial<QSO>): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export class SQLiteQSORepository implements QSORepository {
  async save(qso: QSO): Promise<void> {
    const db = await getDatabase();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO qsos (
        id, timestamp, callsign, band, mode,
        rst_sent_readability, rst_sent_strength, rst_sent_tone,
        rst_received_readability, rst_received_strength, rst_received_tone,
        frequency, grid_square, operator, station, notes,
        qsl_sent, qsl_received,
        contest_name, contest_exchange_sent, contest_exchange_received, contest_serial_number,
        source, synced, version, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        qso.id,
        qso.timestamp.toISOString(),
        qso.callsign.toString(),
        qso.band,
        qso.mode,
        qso.rstSent.readability,
        qso.rstSent.strength,
        qso.rstSent.tone ?? null,
        qso.rstReceived.readability,
        qso.rstReceived.strength,
        qso.rstReceived.tone ?? null,
        qso.frequency ?? null,
        qso.gridSquare?.toString() ?? null,
        qso.operator ?? null,
        qso.station ?? null,
        qso.notes ?? null,
        qso.qslSent ? 1 : 0,
        qso.qslReceived ? 1 : 0,
        qso.contestInfo?.contestName ?? null,
        qso.contestInfo?.exchangeSent ?? null,
        qso.contestInfo?.exchangeReceived ?? null,
        qso.contestInfo?.serialNumber ?? null,
        qso.metadata.source,
        qso.metadata.synced ? 1 : 0,
        qso.metadata.version,
        qso.metadata.createdAt.toISOString(),
        qso.metadata.updatedAt.toISOString(),
      ]
    );
  }

  async findById(id: string): Promise<QSO | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<any>(
      'SELECT * FROM qsos WHERE id = ?',
      [id]
    );

    if (!result) {
      return null;
    }

    return this.mapRowToQSO(result);
  }

  async findAll(): Promise<QSO[]> {
    const db = await getDatabase();
    const results: QSO[] = [];
    
    // Use async iterator for getAllAsync equivalent
    const statement = await db.prepareAsync('SELECT * FROM qsos ORDER BY timestamp DESC');
    try {
      const result = await statement.executeAsync();
      for await (const row of result) {
        try {
          results.push(this.mapRowToQSO(row));
        } catch (error) {
          console.error('Error mapping QSO:', error);
        }
      }
    } finally {
      await statement.finalizeAsync();
    }
    
    return results;
  }

  async findByCallsign(callsign: string): Promise<QSO[]> {
    const db = await getDatabase();
    const results: QSO[] = [];
    
    const statement = await db.prepareAsync('SELECT * FROM qsos WHERE callsign = ? ORDER BY timestamp DESC');
    try {
      const result = await statement.executeAsync([callsign.toUpperCase()]);
      for await (const row of result) {
        try {
          results.push(this.mapRowToQSO(row));
        } catch (error) {
          console.error('Error mapping QSO:', error);
        }
      }
    } finally {
      await statement.finalizeAsync();
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
    const db = await getDatabase();
    await db.runAsync('DELETE FROM qsos WHERE id = ?', [id]);
  }

  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM qsos'
    );
    return result?.count ?? 0;
  }

  private mapRowToQSO(row: any): QSO {
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      callsign: Callsign.create(row.callsign),
      band: row.band,
      mode: row.mode,
      rstSent: RST.create(
        row.rst_sent_readability,
        row.rst_sent_strength,
        row.rst_sent_tone ?? undefined
      ),
      rstReceived: RST.create(
        row.rst_received_readability,
        row.rst_received_strength,
        row.rst_received_tone ?? undefined
      ),
      frequency: row.frequency ?? undefined,
      gridSquare: row.grid_square ? GridSquare.create(row.grid_square) : undefined,
      operator: row.operator ?? undefined,
      station: row.station ?? undefined,
      notes: row.notes ?? undefined,
      qslSent: row.qsl_sent === 1,
      qslReceived: row.qsl_received === 1,
      contestInfo: row.contest_name
        ? {
            contestName: row.contest_name,
            exchangeSent: row.contest_exchange_sent ?? undefined,
            exchangeReceived: row.contest_exchange_received ?? undefined,
            serialNumber: row.contest_serial_number ?? undefined,
          }
        : undefined,
      metadata: {
        source: row.source as 'manual' | 'dx-cluster' | 'cat-control',
        synced: row.synced === 1,
        version: row.version,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      },
    };
  }
}
