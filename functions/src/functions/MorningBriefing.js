const { app } = require('@azure/functions');
const sql = require('mssql');
const { generateBriefing } = require('../shared/ai');
const { sendPush } = require('../shared/fcm');

app.timer('MorningBriefing', {
    schedule: '0 0 8 * * *', // Every day at 8:00 AM
    handler: async (myTimer, context) => {
        const pool = await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);
        const today = new Date().toISOString().split('T')[0];

        // Get all users (we store briefing for everyone, push only if they have a token)
        const users = await pool.request().query('SELECT id, fcm_token FROM users');

        for (const user of users.recordset) {
            // Find today's tasks for this user
            const tasks = await pool.request()
                .input('uid', sql.UniqueIdentifier, user.id)
                .input('today', sql.Date, new Date(today))
                .query('SELECT title, subject FROM tasks WHERE user_id=@uid AND planned_date=@today AND is_done=0');

            if (tasks.recordset.length === 0) {
                // Clear old briefing so the banner doesn't show stale content
                await pool.request()
                    .input('uid', sql.UniqueIdentifier, user.id)
                    .query('UPDATE users SET morning_briefing = NULL WHERE id = @uid');
                continue;
            }

            // Generate briefing via AI
            const briefing = await generateBriefing(JSON.stringify(tasks.recordset));

            // Save to users.morning_briefing (shown on Dashboard)
            await pool.request()
                .input('uid', sql.UniqueIdentifier, user.id)
                .input('briefing', sql.NVarChar, briefing)
                .query('UPDATE users SET morning_briefing = @briefing WHERE id = @uid');

            // Also save as an alert (visible in Alerts page)
            await pool.request()
                .input('uid', sql.UniqueIdentifier, user.id)
                .input('msg', sql.NVarChar, briefing)
                .query("INSERT INTO alerts (user_id, message, type) VALUES (@uid, @msg, 'morning_briefing')");

            // Send push notification if token available
            if (user.fcm_token) {
                await sendPush(user.fcm_token, 'Good morning 🌅', briefing).catch(
                    err => context.log.error('FCM push failed:', err.message)
                );
            }
        }
    }
});