const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 26257),
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'sweet_swap',
  password: process.env.DB_PASSWORD || undefined,
  ssl: (String(process.env.DB_SSL || '').toLowerCase() === 'true')
    ? { rejectUnauthorized: false }
    : false,
  application_name: 'sweet-swap-backend'
});

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
    const res = await pool.query(pgSql, pgParams);
    return [res.rows]; // <— important: array with rows
  },
  getClient: () => pool.connect()
};
