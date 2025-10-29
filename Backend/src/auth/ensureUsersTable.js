const pool = require('../db/pool');

async function ensureUsersTable() {
  // Run as separate statements to avoid multi-statement restrictions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
}

module.exports = { ensureUsersTable };
