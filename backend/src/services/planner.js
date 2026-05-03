const { getPool, sql } = require('../db');
const { assignPlannedDate } = require('./ai');

/**
 * Thread 3 — Planner Sync
 * Runs after Thread 1 (AI Parser) completes.
 * Finds the best available day for the task and writes planned_date to the DB.
 */
async function plannerSync(taskId, userId) {
    try {
        const pool = await getPool();

        // Fetch the newly parsed task
        const taskResult = await pool.request()
            .input('id', sql.UniqueIdentifier, taskId)
            .query('SELECT id, title, deadline, priority FROM tasks WHERE id = @id');

        const task = taskResult.recordset[0];
        if (!task) return;

        // Fetch user's existing schedule for the next 14 days to understand load
        const scheduleResult = await pool.request()
            .input('user_id', sql.UniqueIdentifier, userId)
            .query(`
                SELECT planned_date FROM tasks
                WHERE user_id = @user_id
                  AND planned_date IS NOT NULL
                  AND planned_date >= CAST(GETDATE() AS DATE)
                  AND planned_date <= DATEADD(day, 14, CAST(GETDATE() AS DATE))
                  AND is_done = 0
            `);

        const existingSchedule = scheduleResult.recordset;

        // Call AI to pick the best day
        const plannedDate = await assignPlannedDate(task, existingSchedule);

        // Write planned_date back to the task
        await pool.request()
            .input('id', sql.UniqueIdentifier, taskId)
            .input('planned_date', sql.DateTime2, plannedDate)
            .query('UPDATE tasks SET planned_date = @planned_date WHERE id = @id');

        console.log(`[Thread 3] Assigned planned_date ${plannedDate.toISOString().split('T')[0]} to task ${taskId}`);
    } catch (err) {
        console.error('[Thread 3] plannerSync failed:', err.message);
    }
}

module.exports = { plannerSync };
