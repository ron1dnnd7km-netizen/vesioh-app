const Database = require('better-sqlite3');
const db = new Database('smsvirtual.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    password TEXT DEFAULT '',
    balance REAL DEFAULT 6.00
  );

  CREATE TABLE IF NOT EXISTS  provider_request_id (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'waiting',
    time_left INTEGER DEFAULT 1200,
    total_time INTEGER DEFAULT 1200,
    cost REAL NOT NULL,
    code TEXT,
    sms_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

    CREATE TABLE IF NOT EXISTS numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'waiting',
    time_left INTEGER DEFAULT 1200,
    total_time INTEGER DEFAULT 1200,
    cost REAL NOT NULL,
    code TEXT,
    sms_text TEXT,
    provider_request_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    service_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    code TEXT,
    status TEXT DEFAULT 'success',
    cost REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add name/password columns if they don't exist (for existing databases)
try { db.exec('ALTER TABLE users ADD COLUMN name TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN password TEXT DEFAULT ""'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN ref_code TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE users ADD COLUMN referred_by TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE numbers ADD COLUMN provider_request_id TEXT'); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
try { db.exec('ALTER TABLE deposits ADD COLUMN reference TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE deposits ADD COLUMN pay_currency TEXT'); } catch(e) {}
module.exports = db;
