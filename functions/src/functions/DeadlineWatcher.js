const { app } = require('@azure/functions');
const sql = require('mssql');
// Зверни увагу на шляхи: створи папку shared всередині папки src
const { replanConflict } = require('../shared/ai');
const { sendPush } = require('../shared/fcm');

app.timer('DeadlineWatcher', {
    schedule: '0 */30 * * * *',
    handler: async (myTimer, context) => {
        // А це весь твій код з інструкції для index.js [cite: 89]
        const pool = await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);

        // Знаходимо дні де 3+ дедлайни у того ж користувача
        const result = await pool.request().query(`
            SELECT user_id, CAST(deadline AS DATE) as day, COUNT(*) as cnt
            FROM tasks WHERE is_done=0 AND deadline > GETDATE()
            GROUP BY user_id, CAST(deadline AS DATE)
            HAVING COUNT(*) >= 3
        `);

        for (const conflict of result.recordset) {
            const tasks = await getTasksForDay(pool, conflict.user_id, conflict.day);
            const plan = await replanConflict(tasks, conflict.day);

            // Зберігаємо alert
            await pool.request()
                .input('uid', sql.UniqueIdentifier, conflict.user_id)
                .input('msg', sql.NVarChar, plan)
                .query('INSERT INTO alerts (user_id,message) VALUES (@uid,@msg)');

            // Відправляємо push
            const user = await getUser(pool, conflict.user_id);
            if (user.fcm_token) await sendPush(user.fcm_token, 'Deadline conflict!', plan);
        }
    }
});