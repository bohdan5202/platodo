const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { parseTask } = require('../services/ai');
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
            const parsed = await parseTask(req.body.text);
            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('title', sql.NVarChar, parsed.title)
                .input('subject', sql.NVarChar, parsed.subject)
                .input('deadline', sql.DateTime2, parsed.deadline ? new Date(parsed.deadline) : null)
                .input('priority', sql.Int, parsed.priority)
                .query('UPDATE tasks SET title=@title,subject=@subject,deadline=@deadline,priority=@priority WHERE id=@id');
        } catch (e) { console.error('AI parse failed:', e.message); }
    });
});

router.put('/:id', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        const { is_done } = req.body;
        
        await pool.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .input('is_done', sql.Bit, is_done)
            .query('UPDATE tasks SET is_done=@is_done WHERE id=@id AND user_id=@user_id');
            
        res.json({ success: true });
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
