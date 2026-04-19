const sql = require('mssql');
require('dotenv').config();

const config = {
    connectionString: process.env.AZURE_SQL_CONNECTION_STRING
};

let pool;
async function getPool() {
    if (!pool) pool = await sql.connect(config);
    return pool;
}

module.exports = { getPool, sql };
