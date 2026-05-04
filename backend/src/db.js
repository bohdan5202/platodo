const sql = require('mssql');
require('dotenv').config();

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

let pool = null;

async function getPool() {
    // Return existing pool if connected
    if (pool && pool.connected) return pool;

    // Reconnect if pool dropped (e.g. after Azure SQL idle timeout)
    pool = await sql.connect(connectionString);
    return pool;
}

// Pre-connect at module load so first request isn't slow
sql.connect(connectionString)
    .then(p => { pool = p; console.log('[DB] Pool connected'); })
    .catch(err => console.error('[DB] Initial connection failed:', err.message));

module.exports = { getPool, sql };