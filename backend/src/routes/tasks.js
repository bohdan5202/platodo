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

module.exports = router;
