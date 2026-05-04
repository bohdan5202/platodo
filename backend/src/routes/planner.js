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
            .query('SELECT * FROM alerts WHERE user_id = @user_id AND is_visible = 1 ORDER BY created_at DESC');
            
        res.json(result.recordset);
    } catch (e) {
        console.error('Alerts error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/alerts/history', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('SELECT * FROM alerts WHERE user_id = @user_id ORDER BY created_at DESC');
            
        res.json(result.recordset);
    } catch (e) {
        console.error('Alerts history error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/alerts/:id', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('UPDATE alerts SET is_visible = 0 WHERE id = @id AND user_id = @user_id');
        res.json({ success: true });
    } catch (e) {
        console.error('Delete alert error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/alerts', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('UPDATE alerts SET is_visible = 0 WHERE user_id = @user_id');
        res.json({ success: true });
    } catch (e) {
        console.error('Clear all alerts error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/alerts/read', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('UPDATE alerts SET is_read = 1 WHERE user_id = @user_id AND is_read = 0');
        res.json({ success: true });
    } catch (e) {
        console.error('Mark all read error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/alerts/:id/read', authenticate, async (req, res) => {
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.UniqueIdentifier, req.params.id)
            .input('user_id', sql.UniqueIdentifier, req.user.id)
            .query('UPDATE alerts SET is_read = 1 WHERE id = @id AND user_id = @user_id');
        res.json({ success: true });
    } catch (e) {
        console.error('Mark read error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
