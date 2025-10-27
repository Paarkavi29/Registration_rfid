const { Pool } = require('pg');
require('dotenv').config();

const useSSL = String(process.env.PG_SSL || '').toLowerCase() === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

// Check database connection at startup
pool.connect()
  .then(client => {
    console.log('✅ Database connected successfully!');
    client.release(); // release the client back to the pool
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Listen for unexpected errors
pool.on('error', (err) => {
  console.error('Unexpected PG error', err);
  process.exit(1);
});

module.exports = pool;
