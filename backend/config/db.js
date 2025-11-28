const { Pool } = require('pg');
require('dotenv').config();

console.log("========================================");
console.log("🔍 DB INIT DEBUG");
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL (sanitized):", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:\/\/.*?:.*?@/, '://***:***@') : "none");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("========================================");

const connectionString = process.env.DATABASE_URL;
let pool;

if (connectionString) {
  console.log("➡️ Using CockroachDB Cloud via DATABASE_URL");

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    application_name: 'sweet-swap-backend'
  });

} else {
  console.log("➡️ Using LOCAL DATABASE settings");

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 26257),
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'sweet_swap',
    password: process.env.DB_PASSWORD || undefined,
    ssl: String(process.env.DB_SSL || '').toLowerCase() === 'true'
      ? { rejectUnauthorized: false }
      : false,
    application_name: 'sweet-swap-backend'
  });
}

// test DB connection immediately
(async () => {
  try {
    console.log("🔄 Testing database connection...");
    await pool.query("SELECT 1");
    console.log("SUCCESS: Connected to the database");
  } catch (err) {
    console.error("DATABASE CONNECTION ERROR:");
    console.error(err);
  }
})();

// Convert "?" placeholders to PostgreSQL $1, $2, ...
function toPg(sql, params = []) {
  let i = 0;
  const outSql = sql.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });
  return { sql: outSql, params };
}

module.exports = {
  query: async (sql, params = []) => {
    const { sql: pgSql, params: pgParams } = toPg(sql, params);

    // Debug queries for Render
    console.log("Executing SQL:", pgSql);
    console.log("Params:", pgParams);

    try {
      const res = await pool.query(pgSql, pgParams);
      return [res.rows];
    } catch (err) {
      console.error("QUERY ERROR:");
      console.error(err);
      throw err;
    }
  },
  getClient: () => pool.connect()
};