const { Pool } = require('pg');
require('dotenv').config();

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'explore_sri_lanka',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Max concurrent connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Pool error listener for unexpected idle client errors
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

/**
 * Executes a parameterized SQL query against the connection pool
 * @param {string} text - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Database Query] executed in ${duration}ms (rows: ${res.rowCount})`);
    }
    return res;
  } catch (error) {
    console.error(`[Database Query Error]: ${error.message} \nQuery: ${text}`);
    throw error;
  }
};

/**
 * Verifies active database connection and PostGIS availability
 */
const testConnection = async () => {
  try {
    const res = await pool.query(`
      SELECT 
        NOW() AS server_time, 
        current_database() AS database_name,
        PostGIS_Version() AS postgis_version;
    `);
    console.log('✅ [PostgreSQL + PostGIS Connected]');
    console.log(`   Database : ${res.rows[0].database_name}`);
    console.log(`   PostGIS  : ${res.rows[0].postgis_version}`);
    console.log(`   Time     : ${res.rows[0].server_time}`);
    return true;
  } catch (error) {
    console.error('❌ [Database Connection Failed]:', error.code || '', error.message || error);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
