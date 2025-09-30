const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ PostgreSQL Pool initialized using DATABASE_URL (Production mode).');
} else {
  throw new Error("❌ DATABASE_URL is missing. Add it in Railway Variables!");
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
