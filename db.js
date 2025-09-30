// db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let pool;

if (connectionString) {
  // ✅ Production mode (Railway أو أي سيرفر سحابي)
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // مهم جداً للاتصال مع قواعد البيانات السحابية
    },
  });
  console.log('✅ PostgreSQL Pool initialized using DATABASE_URL (Production mode).');
} else {
  // ✅ Local development
  if (!process.env.PG_USER) {
    throw new Error("❌ DATABASE_URL is missing, and local PG_USER is not defined.");
  }

  pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: false, // محلي مش محتاج SSL
  });
  console.log('✅ PostgreSQL Pool initialized using local env variables.');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
