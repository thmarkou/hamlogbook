import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (db) {
    return db;
  }

  // expo-sqlite SDK 51 uses synchronous openDatabase (WebSQL API)
  db = SQLite.openDatabase('hamlogbook.db');
  
  // Initialize database on first access
  db.transaction((tx) => {
    // Enable foreign keys
    tx.executeSql('PRAGMA foreign_keys = ON;');
    
    // Create tables
    createTables(tx);
  });
  
  return db;
}

function createTables(tx: SQLite.SQLTransaction): void {
  // QSOs table
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS qsos (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      callsign TEXT NOT NULL,
      band TEXT NOT NULL,
      mode TEXT NOT NULL,
      rst_sent_readability INTEGER NOT NULL,
      rst_sent_strength INTEGER NOT NULL,
      rst_sent_tone INTEGER,
      rst_received_readability INTEGER NOT NULL,
      rst_received_strength INTEGER NOT NULL,
      rst_received_tone INTEGER,
      frequency REAL,
      grid_square TEXT,
      operator TEXT,
      station TEXT,
      notes TEXT,
      qsl_sent INTEGER DEFAULT 0,
      qsl_received INTEGER DEFAULT 0,
      contest_name TEXT,
      contest_exchange_sent TEXT,
      contest_exchange_received TEXT,
      contest_serial_number INTEGER,
      source TEXT DEFAULT 'manual',
      synced INTEGER DEFAULT 0,
      version INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Operators table (cached lookup data)
  tx.executeSql(`
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
  `);

  // Stations table
  tx.executeSql(`
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

  // Create indexes for performance
  tx.executeSql(`
    CREATE INDEX IF NOT EXISTS idx_qsos_timestamp ON qsos(timestamp);
  `);
  tx.executeSql(`
    CREATE INDEX IF NOT EXISTS idx_qsos_callsign ON qsos(callsign);
  `);
  tx.executeSql(`
    CREATE INDEX IF NOT EXISTS idx_qsos_band_mode ON qsos(band, mode);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db = null;
  }
}
