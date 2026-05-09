/**
 * CERBERUS GADGET STORE - Oracle DB Config
 * File: backend-api/config/database.js
 * Uses oracledb thin mode (no Oracle Client install needed for Oracle 21c+)
 */

const oracledb = require('oracledb');

// Thin mode is the default in oracledb v6+ (no Oracle Instant Client needed for Oracle 21c+)
// If you are using Oracle 19c or older, comment the next line and install Oracle Instant Client:
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_3' });
oracledb.thin = true; // explicit thin mode

// Connection pool configuration
const poolConfig = {
  user:          process.env.ORACLE_USER,
  password:      process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
  poolMin:       2,
  poolMax:       10,
  poolIncrement: 1,
  poolTimeout:   60,
  stmtCacheSize: 30
};

let pool = null;

/**
 * Initialize the Oracle connection pool
 */
async function initOraclePool() {
  try {
    pool = await oracledb.createPool(poolConfig);
    console.log('Oracle connection pool created');
  } catch (err) {
    throw new Error(`Oracle pool init failed: ${err.message}`);
  }
}

/**
 * Execute a SQL query with optional binds
 * @param {string} sql   - SQL statement
 * @param {object} binds - Bind parameters
 * @param {object} opts  - Options (autoCommit, outFormat, etc.)
 */
async function execute(sql, binds = {}, opts = {}) {
  if (!pool) {
    throw new Error('Oracle pool not initialized. Call initOraclePool() first.');
  }

  const options = {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    autoCommit: true,
    ...opts
  };

  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error closing connection:', e); }
    }
  }
}

/**
 * Call a stored procedure
 */
async function callProcedure(procName, binds = {}) {
  const bindKeys = Object.keys(binds);
  const paramStr = bindKeys.map(k => `:${k}`).join(', ');
  const sql = `BEGIN ${procName}(${paramStr}); END;`;
  return execute(sql, binds, { autoCommit: false });
}

/**
 * Run multiple statements in a transaction
 */
async function withTransaction(callback) {
  if (!pool) throw new Error('Oracle pool not initialized.');
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = { initOraclePool, execute, callProcedure, withTransaction };
