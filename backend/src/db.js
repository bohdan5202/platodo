const sql = require('mssql');
require('dotenv').config();

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

let pool;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(connectionString);
    }
    return pool;
}

module.exports = { getPool, sql };