const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// ====== RUN EACH TABLE CREATION SEPARATELY ======
async function initDB() {
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      balance NUMERIC(10,2) DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS numbers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      service_name TEXT,
      service_id TEXT,
      phone TEXT NOT NULL,
      status TEXT DEFAULT 'waiting',
      code TEXT,
      sms_text TEXT,
      time_left INTEGER DEFAULT 600,
      total_time INTEGER DEFAULT 600,
      cost NUMERIC(10,2),
      provider_request_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      service_name TEXT,
      phone TEXT,
      code TEXT,
      status TEXT,
      cost NUMERIC(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deposits (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      method TEXT,
      status TEXT DEFAULT 'pending',
      reference TEXT UNIQUE,
      pay_currency TEXT,
      tx_id TEXT,
      flutterwave_ref TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      method TEXT NOT NULL,
      address TEXT NOT NULL,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS provider_request_id (
      id SERIAL PRIMARY KEY,
      number_id INTEGER,
      provider_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ====== ADD MISSING COLUMN IF TABLE ALREADY EXISTS ======
  try {
    await pool.query(`ALTER TABLE deposits ADD COLUMN IF NOT EXISTS flutterwave_ref TEXT`);
  } catch (e) {
    // Column already exists or error - ignore
  }

  // ====== CREATE INDEXES FOR PERFORMANCE ======
  try {
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_numbers_email ON numbers(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_numbers_status ON numbers(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_history_email ON history(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_deposits_email ON deposits(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_deposits_reference ON deposits(reference)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_withdrawals_email ON withdrawals(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)`);
  } catch (e) {
    console.log('Index creation skipped:', e.message);
  }

  console.log('✅ PostgreSQL tables ready');
}

initDB().catch(err => console.error('DB Init Error:', err));

// ====== DATABASE WRAPPER ======
module.exports = {
  prepare: function(sql) {
    return {
      run: async function(...params) {
        const result = await pool.query(sql, params);
        return {
          rowCount: result.rowCount,
          rows: result.rows,  // Important for RETURNING support
          oid: result.oid
        };
      },
      get: async function(...params) {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
      },
      all: async function(...params) {
        const result = await pool.query(sql, params);
        return result.rows;
      }
    };
  }
};