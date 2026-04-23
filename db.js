const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
      cost REAL,
      provider_request_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      service_name TEXT,
      phone TEXT,
      code TEXT,
      status TEXT,
      cost REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS deposits (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT,
      status TEXT DEFAULT 'pending',
      reference TEXT UNIQUE,
      pay_currency TEXT,
      tx_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS provider_request_id (
      id SERIAL PRIMARY KEY,
      number_id INTEGER,
      provider_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ PostgreSQL tables ready');
}

initDB().catch(err => console.error('DB Init Error:', err));

module.exports = {
  prepare: function(sql) {
    return {
      run: async function(...params) { return await pool.query(sql, params); },
      get: async function(...params) { 
        const res = await pool.query(sql, params); 
        return res.rows[0]; 
      },
      all: async function(...params) { 
        const res = await pool.query(sql, params); 
        return res.rows; 
      }
    };
  }
};