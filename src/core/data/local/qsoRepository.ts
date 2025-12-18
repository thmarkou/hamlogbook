import { getDatabase } from './database';
import { QSO, CreateQSOInput } from '@core/domain/entities';
import { Callsign, GridSquare, RST } from '@core/domain/value-objects';
import * as SQLite from 'expo-sqlite';

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
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
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
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findById(id: string): Promise<QSO | null> {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM qsos WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }
            try {
              const qso = this.mapRowToQSO(rows.item(0));
              resolve(qso);
            } catch (error) {
              reject(error);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findAll(): Promise<QSO[]> {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM qsos ORDER BY timestamp DESC',
          [],
          (_, { rows }) => {
            const qsos: QSO[] = [];
            for (let i = 0; i < rows.length; i++) {
              try {
                qsos.push(this.mapRowToQSO(rows.item(i)));
              } catch (error) {
                console.error('Error mapping QSO:', error);
              }
            }
            resolve(qsos);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async findByCallsign(callsign: string): Promise<QSO[]> {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM qsos WHERE callsign = ? ORDER BY timestamp DESC',
          [callsign.toUpperCase()],
          (_, { rows }) => {
            const qsos: QSO[] = [];
            for (let i = 0; i < rows.length; i++) {
              try {
                qsos.push(this.mapRowToQSO(rows.item(i)));
              } catch (error) {
                console.error('Error mapping QSO:', error);
              }
            }
            resolve(qsos);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
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
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM qsos WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async count(): Promise<number> {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM qsos',
          [],
          (_, { rows }) => {
            resolve(rows.length > 0 ? rows.item(0).count : 0);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
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
