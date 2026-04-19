const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const pool = await getPool();
        
        // Check if user exists
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');
        if (checkUser.recordset.length > 0) return res.status(400).json({ error: 'User already exists' });

        const id = require('crypto').randomUUID();
        const hash = await bcrypt.hash(password, 10);

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hash)
            .query('INSERT INTO users (id, email, password_hash) VALUES (@id, @email, @password_hash)');

        res.status(201).json({ message: 'User created' });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, fcm_token } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, password_hash FROM users WHERE email = @email');

        if (result.recordset.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        if (fcm_token) {
            await pool.request()
                .input('id', sql.UniqueIdentifier, user.id)
                .input('fcm_token', sql.NVarChar, fcm_token)
                .query('UPDATE users SET fcm_token = @fcm_token WHERE id = @id');
        }

        const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
        res.json({ token });
    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
