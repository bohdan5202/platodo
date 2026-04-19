const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('SELECT * FROM tasks WHERE user_id = @user_id ORDER BY deadline ASC');
        
        res.json(result.recordset);
    } catch (e) {
        console.error('Planner error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/alerts', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('SELECT * FROM alerts WHERE user_id = @user_id ORDER BY created_at DESC');
            
        res.json(result.recordset);
    } catch (e) {
        console.error('Alerts error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
