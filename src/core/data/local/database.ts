import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Canonical `qsos` table (logical fields requested for the app):
 * id, callsign, band, mode, rst_sent, rst_rcvd, frequency, grid, notes, timestamp
 *
 * RST values are stored as compact strings (e.g. "59") compatible with RST.parse().
 */
const QSOS_TABLE_MINIMAL = `
CREATE TABLE IF NOT EXISTS qsos (
  id TEXT PRIMARY KEY NOT NULL,
  callsign TEXT NOT NULL,
  band TEXT NOT NULL,
  mode TEXT NOT NULL,
  rst_sent TEXT NOT NULL,
  rst_rcvd TEXT NOT NULL,
  frequency REAL,
  grid TEXT,
  notes TEXT,
  timestamp TEXT NOT NULL
);
`;

/**
 * One-time migration from the legacy normalized schema (split RST columns, grid_square, etc.).
 */
const LEGACY_QSOS_MIGRATION = `
DROP TABLE IF EXISTS qsos__migrated;
CREATE TABLE qsos__migrated (
  id TEXT PRIMARY KEY NOT NULL,
  callsign TEXT NOT NULL,
  band TEXT NOT NULL,
  mode TEXT NOT NULL,
  rst_sent TEXT NOT NULL,
  rst_rcvd TEXT NOT NULL,
  frequency REAL,
  grid TEXT,
  notes TEXT,
  timestamp TEXT NOT NULL
);
INSERT INTO qsos__migrated (id, callsign, band, mode, rst_sent, rst_rcvd, frequency, grid, notes, timestamp)
SELECT
  id,
  callsign,
  band,
  mode,
  CASE
    WHEN rst_sent_tone IS NOT NULL THEN
      CAST(rst_sent_readability AS TEXT) || CAST(rst_sent_strength AS TEXT) || CAST(rst_sent_tone AS TEXT)
    ELSE
      CAST(rst_sent_readability AS TEXT) || CAST(rst_sent_strength AS TEXT)
  END,
  CASE
    WHEN rst_received_tone IS NOT NULL THEN
      CAST(rst_received_readability AS TEXT) || CAST(rst_received_strength AS TEXT) || CAST(rst_received_tone AS TEXT)
    ELSE
      CAST(rst_received_readability AS TEXT) || CAST(rst_received_strength AS TEXT)
  END,
  frequency,
  grid_square,
  notes,
  timestamp
FROM qsos;
DROP TABLE qsos;
ALTER TABLE qsos__migrated RENAME TO qsos;
`;

async function tableColumnNames(database: SQLite.SQLiteDatabase): Promise<Set<string>> {
  const rows = await database.getAllAsync<{ name: string }>('PRAGMA table_info(qsos)');
  return new Set(rows.map((r) => r.name));
}

async function ensureQsosSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  const columns = await tableColumnNames(database);

  if (columns.size === 0) {
    console.log('[HamLogbook DB] qsos table missing; creating minimal schema');
    await database.execAsync(QSOS_TABLE_MINIMAL);
    return;
  }

  if (columns.has('rst_sent')) {
    console.log('[HamLogbook DB] qsos table uses current schema');
    return;
  }

  if (!columns.has('rst_sent_readability')) {
    console.warn('[HamLogbook DB] qsos table has unexpected columns; skipping migration');
    return;
  }

  console.log('[HamLogbook DB] Migrating qsos from legacy schema to simplified columns');
  try {
    await database.execAsync(LEGACY_QSOS_MIGRATION);
    console.log('[HamLogbook DB] qsos migration completed successfully');
  } catch (err) {
    console.error('[HamLogbook DB] qsos migration failed:', err);
    throw err;
  }
}

/**
 * Opens SQLite (creates file if needed), ensures `qsos` and auxiliary tables exist, runs legacy migration when required.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('hamlogbook.db');
    console.log('[HamLogbook DB] Opened database file hamlogbook.db');

    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      ${QSOS_TABLE_MINIMAL}
      CREATE TABLE IF NOT EXISTS operators (
        id TEXT PRIMARY KEY,
        callsign TEXT UNIQUE NOT NULL,
        name TEXT,
        country TEXT,
        grid_square TEXT,
        qth TEXT,
        email TEXT,
        cached_at TEXT
      );
      CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        equipment TEXT,
        antenna TEXT,
        power INTEGER,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await ensureQsosSchema(db);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_qsos_timestamp ON qsos(timestamp);
      CREATE INDEX IF NOT EXISTS idx_qsos_callsign ON qsos(callsign);
      CREATE INDEX IF NOT EXISTS idx_qsos_band_mode ON qsos(band, mode);
    `);

    console.log('[HamLogbook DB] Schema ready (qsos + indexes)');
    return db;
  } catch (err) {
    console.error('[HamLogbook DB] Failed to initialize database:', err);
    db = null;
    throw err;
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    try {
      await db.closeAsync();
      console.log('[HamLogbook DB] Database connection closed');
    } catch (err) {
      console.error('[HamLogbook DB] Error while closing database:', err);
    } finally {
      db = null;
    }
  }
}
