const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
let pool;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  console.log("✅ PostgreSQL Pool initialized using DATABASE_URL (Production mode).");
} else {
  if (!process.env.PG_USER) {
    console.error("❌ DATABASE_URL is missing and no local vars set.");
    throw new Error("DB connection info missing.");
  }

  pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: false
  });
  console.log("✅ PostgreSQL Pool initialized using local environment variables.");
}

module.exports = {
  query: async (text, params) => {
    try {
      console.log("📥 DB query:", text);
      const res = await pool.query(text, params);
      console.log("📤 DB query success, rows:", res.rowCount);
      return res;
    } catch (err) {
      console.error("❌ DB query failed:", err);
      throw err;
    }
  },
  pool
};
