const { getPool, sql } = require('../db');
const { replanConflict } = require('./ai');
const { sendPush } = require('./fcm');

/**
 * Thread 2 — Deadline Watcher (event-driven)
 * Runs after a task is created or updated.
 * Checks if the affected user has 3+ tasks due on the same day,
 * and if so generates an AI conflict alert, saves it to the alerts table,
 * and sends a push notification to the user's phone via FCM.
 */
async function checkDeadlineConflicts(userId) {
    try {
        const pool = await getPool();

        // Find days where this user has 3+ deadline tasks
        const conflictResult = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT CAST(deadline AS DATE) as day, COUNT(*) as cnt
                FROM tasks
                WHERE user_id = @user_id
                  AND is_done = 0
                  AND deadline > GETDATE()
                GROUP BY CAST(deadline AS DATE)
                HAVING COUNT(*) >= 3
            `);

        for (const conflict of conflictResult.recordset) {
            // Check if we already generated an alert for this day recently (last 24h) to avoid spam
            const existing = await pool.request()
                .input('user_id', sql.UniqueIdentifier, userId)
                .input('day', sql.Date, conflict.day)
                .query(`
                    SELECT COUNT(*) as cnt FROM alerts
                    WHERE user_id = @user_id
                      AND type = 'conflict'
                      AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
                      AND message LIKE '%' + CONVERT(varchar, @day, 23) + '%'
                `);

            if (existing.recordset[0].cnt > 0) continue; // skip duplicate alerts

            // Fetch the tasks on that day
            const tasksResult = await pool.request()
                .input('user_id', sql.UniqueIdentifier, userId)
                .input('day', sql.Date, conflict.day)
                .query(`
                    SELECT title, subject, deadline, priority
                    FROM tasks
                    WHERE user_id = @user_id
                      AND CAST(deadline AS DATE) = @day
                      AND is_done = 0
                `);

            const tasks = tasksResult.recordset;
            const plan = await replanConflict(tasks, conflict.day);

            // Save alert to DB
            await pool.request()
                .input('user_id', sql.UniqueIdentifier, userId)
                .input('message', sql.NVarChar, plan)
                .input('type', sql.NVarChar, 'conflict')
                .query(`INSERT INTO alerts (user_id, message, type) VALUES (@user_id, @message, @type)`);

            // Send push notification to phone if user has FCM token
            const userResult = await pool.request()
                .input('user_id', sql.UniqueIdentifier, userId)
                .query('SELECT fcm_token FROM users WHERE id = @user_id');
            const fcmToken = userResult.recordset[0]?.fcm_token;
            if (fcmToken) {
                const dayStr = new Date(conflict.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                await sendPush(fcmToken, `⚠️ Deadline conflict on ${dayStr}`, plan).catch(
                    err => console.error('[Thread 2] FCM push failed:', err.message)
                );
            }

            console.log(`[Thread 2] Conflict alert created for user ${userId} on ${conflict.day}`);
        }
    } catch (err) {
        console.error('[Thread 2] checkDeadlineConflicts failed:', err.message);
    }
}

module.exports = { checkDeadlineConflicts };
