const { app } = require('@azure/functions');
const sql = require('mssql');
// Зверни увагу на шляхи: створи папку shared всередині папки src
const { replanConflict } = require('../shared/ai');
const { sendPush } = require('../shared/fcm');

async function getTasksForDay(pool, userId, day) {
    const result = await pool.request()
        .input('uid', sql.UniqueIdentifier, userId)
        .input('day', sql.Date, day)
        .query('SELECT title, subject, deadline, priority FROM tasks WHERE user_id=@uid AND CAST(deadline AS DATE)=@day AND is_done=0');
    return result.recordset;
}

async function getUser(pool, userId) {
    const result = await pool.request()
        .input('uid', sql.UniqueIdentifier, userId)
        .query('SELECT id, fcm_token FROM users WHERE id=@uid');
    return result.recordset[0];
}

app.timer('DeadlineWatcher', {
    schedule: '0 */30 * * * *',
    handler: async (myTimer, context) => {
        const pool = await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);

        const result = await pool.request().query(`
            SELECT user_id, CAST(deadline AS DATE) as day, COUNT(*) as cnt
            FROM tasks WHERE is_done=0 AND deadline > GETDATE()
            GROUP BY user_id, CAST(deadline AS DATE)
            HAVING COUNT(*) >= 3
        `);

        for (const conflict of result.recordset) {
            const tasks = await getTasksForDay(pool, conflict.user_id, conflict.day);
            const plan = await replanConflict(tasks, conflict.day);

            await pool.request()
                .input('uid', sql.UniqueIdentifier, conflict.user_id)
                .input('msg', sql.NVarChar, plan)
                .query('INSERT INTO alerts (user_id,message) VALUES (@uid,@msg)');

            const user = await getUser(pool, conflict.user_id);
            if (user.fcm_token) await sendPush(user.fcm_token, 'Deadline conflict!', plan);
        }
    }
});