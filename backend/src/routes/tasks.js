const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { parseTask } = require('../services/ai');
const { plannerSync } = require('../services/planner');
const { checkDeadlineConflicts } = require('../services/deadlineWatcher');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
    const pool = await getPool();
    const id = require('crypto').randomUUID();

    await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .input('user_id', sql.UniqueIdentifier, req.user.id)
        .input('raw_input', sql.NVarChar, req.body.text)
        .query('INSERT INTO tasks (id,user_id,raw_input) VALUES (@id,@user_id,@raw_input)');

    res.status(201).json({ id, raw_input: req.body.text });

    setImmediate(async () => {
        try {
            // Thread 1: parse task with AI
            const parsed = await parseTask(req.body.text);
            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('title', sql.NVarChar, parsed.title)
                .input('subject', sql.NVarChar, parsed.subject)
                .input('deadline', sql.DateTime2, parsed.deadline ? new Date(parsed.deadline) : null)
                .input('priority', sql.Int, parsed.priority)
                .query('UPDATE tasks SET title=@title,subject=@subject,deadline=@deadline,priority=@priority WHERE id=@id');

            // Thread 3: assign planned_date based on workload and deadline
            plannerSync(id, req.user.id);

            // Thread 2: check if this new deadline creates a conflict day
            if (parsed.deadline) checkDeadlineConflicts(req.user.id);
        } catch (e) { console.error('AI parse failed:', e.message); }
    });
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        const { is_done, planned_date, title, subject, deadline, priority } = req.body;
        
        const request = pool.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id);

        let updates = [];
        if (is_done !== undefined) {
            updates.push('is_done=@is_done');
            request.input('is_done', sql.Bit, is_done);
        }
        if (planned_date !== undefined) {
            updates.push('planned_date=@planned_date');
            request.input('planned_date', sql.DateTime2, planned_date ? new Date(planned_date) : null);
        }
        if (title !== undefined) {
            updates.push('title=@title');
            request.input('title', sql.NVarChar, title);
        }
        if (subject !== undefined) {
            updates.push('subject=@subject');
            request.input('subject', sql.NVarChar, subject || null);
        }
        if (deadline !== undefined) {
            updates.push('deadline=@deadline');
            request.input('deadline', sql.DateTime2, deadline ? new Date(deadline) : null);
        }
        if (priority !== undefined) {
            updates.push('priority=@priority');
            request.input('priority', sql.Int, priority);
        }

        if (updates.length > 0) {
            await request.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id=@id AND user_id=@user_id`);
        }
            
        res.json({ success: true });

        // Thread 2: re-check conflicts when deadline changes
        if (deadline !== undefined) {
            setImmediate(() => checkDeadlineConflicts(req.user.id));
        }
    } catch (err) {
        console.error('Update task failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        
        await pool.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('DELETE FROM tasks WHERE id=@id AND user_id=@user_id');
            
        res.json({ success: true });
    } catch (err) {
        console.error('Delete task failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
