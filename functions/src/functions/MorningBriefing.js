const { app } = require('@azure/functions');
const sql = require('mssql');
const { generateBriefing } = require('../shared/ai');
const { sendPush } = require('../shared/fcm');

app.timer('MorningBriefing', {
    schedule: '0 0 8 * * *', // Щодня о 8:00 ранку 
    handler: async (myTimer, context) => {
        const pool = await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);
        const today = new Date().toISOString().split('T')[0];

        // Отримуємо всіх користувачів, у яких є токен для пуш-повідомлень [cite: 92]
        const users = await pool.request().query('SELECT id, fcm_token FROM users');

        for (const user of users.recordset) {
            if (!user.fcm_token) continue;

            // Шукаємо завдання користувача на сьогодні, які ще не виконані [cite: 92]
            const tasks = await pool.request()
                .input('uid', sql.UniqueIdentifier, user.id)
                .input('today', sql.Date, new Date(today))
                .query('SELECT title, subject FROM tasks WHERE user_id=@uid AND planned_date=@today AND is_done=0');

            if (tasks.recordset.length === 0) continue;

            // Генеруємо текст брифінгу через AI та відправляємо пуш [cite: 92]
            const briefing = await generateBriefing(tasks.recordset);
            await sendPush(user.fcm_token, 'Good morning 🌅', briefing);
        }
    }
});