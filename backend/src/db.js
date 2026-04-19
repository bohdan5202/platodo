const sql = require('mssql');
require('dotenv').config();

const config = {
    connectionString: process.env.Server
};

let pool;
async function getPool() {
    if (!pool) pool = await sql.connect(config);
    return pool;
}

module.exports = { getPool, sql };
