const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const { EmailClient } = require("@azure/communication-email");

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const pool = await getPool();
        
        // Check if user exists
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM users WHERE email = @email');
        if (checkUser.recordset.length > 0) return res.status(400).json({ error: 'User already exists' });

        const id = require('crypto').randomUUID();
        const hash = await bcrypt.hash(password, 10);
        const verificationToken = require('crypto').randomBytes(32).toString('hex');

        await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, hash)
            .input('name', sql.NVarChar, name || null)
            .input('verification_token', sql.NVarChar, verificationToken)
            .query('INSERT INTO users (id, email, password_hash, name, is_verified, verification_token, verification_token_expires) VALUES (@id, @email, @password_hash, @name, 0, @verification_token, DATEADD(hour, 24, GETDATE()))');

        // Send verification email
        if (process.env.ACS_CONNECTION_STRING && process.env.ACS_SENDER_EMAIL) {
            try {
                const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
                
                await emailClient.beginSend({
                    senderAddress: process.env.ACS_SENDER_EMAIL,
                    content: {
                        subject: "Verify your Platodo email",
                        plainText: `Hello ${name || 'there'},\n\nPlease verify your email address by clicking the link below:\n\n${verifyLink}\n\nThanks,\nThe Platodo Team`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2>Hello ${name || 'there'},</h2>
                                <p>Please verify your email address by clicking the button below:</p>
                                <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #6B5CE7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0;">Verify Email</a>
                                <p style="font-size: 13px; color: #8888AA;">If the button doesn't work, copy and paste this link: <a href="${verifyLink}">${verifyLink}</a></p>
                                <p>Thanks,<br/>The Platodo Team</p>
                            </div>
                        `
                    },
                    recipients: { to: [{ address: email }] }
                });
            } catch (err) {
                console.error('Failed to send verification email:', err);
            }
        }

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
            .query('SELECT id, password_hash, is_verified FROM users WHERE email = @email');

        if (result.recordset.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        if (user.is_verified === false) {
            return res.status(403).json({ error: 'unverified_email', message: 'Please verify your email before logging in.' });
        }

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

router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Token is required' });

        const pool = await getPool();
        const result = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT id FROM users WHERE verification_token = @token AND verification_token_expires > GETDATE()');

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        await pool.request()
            .input('id', sql.UniqueIdentifier, result.recordset[0].id)
            .query('UPDATE users SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = @id');

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (e) {
        console.error('Verify email error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const pool = await getPool();
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, name, is_verified FROM users WHERE email = @email');

        if (checkUser.recordset.length === 0) {
            return res.json({ success: true });
        }

        const user = checkUser.recordset[0];
        if (user.is_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        const verificationToken = require('crypto').randomBytes(32).toString('hex');
        await pool.request()
            .input('id', sql.UniqueIdentifier, user.id)
            .input('token', sql.NVarChar, verificationToken)
            .query('UPDATE users SET verification_token = @token, verification_token_expires = DATEADD(hour, 24, GETDATE()) WHERE id = @id');

        if (process.env.ACS_CONNECTION_STRING && process.env.ACS_SENDER_EMAIL) {
            const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
            
            await emailClient.beginSend({
                senderAddress: process.env.ACS_SENDER_EMAIL,
                content: {
                    subject: "Verify your Platodo email",
                    plainText: `Hello ${user.name || 'there'},\n\nPlease verify your email address by clicking the link below:\n\n${verifyLink}\n\nThanks,\nThe Platodo Team`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>Hello ${user.name || 'there'},</h2>
                            <p>Please verify your email address by clicking the button below:</p>
                            <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #6B5CE7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0;">Verify Email</a>
                            <p style="font-size: 13px; color: #8888AA;">If the button doesn't work, copy and paste this link: <a href="${verifyLink}">${verifyLink}</a></p>
                            <p>Thanks,<br/>The Platodo Team</p>
                        </div>
                    `
                },
                recipients: { to: [{ address: email }] }
            });
        }

        res.json({ success: true, message: 'Verification email resent' });
    } catch (e) {
        console.error('Resend verification error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.UniqueIdentifier, req.user.id)
            .query('SELECT id, email, name, morning_briefing FROM users WHERE id = @id');

        if (result.recordset.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.recordset[0]);
    } catch (e) {
        console.error('Me error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

        const pool = await getPool();
        await pool.request()
            .input('id', sql.UniqueIdentifier, req.user.id)
            .input('name', sql.NVarChar, name.trim())
            .query('UPDATE users SET name = @name WHERE id = @id');

        res.json({ success: true, name: name.trim() });
    } catch (e) {
        console.error('Update me error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`[Forgot Password] Request received for: ${email}`);
        
        if (!email) {
            console.log(`[Forgot Password] No email provided.`);
            return res.status(400).json({ error: 'Email is required' });
        }

        const pool = await getPool();
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, name FROM users WHERE email = @email');

        if (checkUser.recordset.length === 0) {
            console.log(`[Forgot Password] User not found: ${email}`);
            // Return success even if not found to prevent email enumeration
            return res.json({ success: true });
        }

        const user = checkUser.recordset[0];
        console.log(`[Forgot Password] User found. Generating token...`);
        const token = require('crypto').randomBytes(32).toString('hex');

        // Store token in DB (expiry 1 hour)
        await pool.request()
            .input('id', sql.UniqueIdentifier, user.id)
            .input('reset_token', sql.NVarChar, token)
            .query(`UPDATE users SET reset_token = @reset_token, reset_token_expires = DATEADD(hour, 1, GETDATE()) WHERE id = @id`);
        console.log(`[Forgot Password] Token stored in DB.`);

        // Send Email
        if (!process.env.ACS_CONNECTION_STRING || !process.env.ACS_SENDER_EMAIL) {
            console.error(`[Forgot Password] ERROR: ACS_CONNECTION_STRING or ACS_SENDER_EMAIL is missing in .env!`);
            return res.status(500).json({ error: 'Server email configuration is missing.' });
        }

        console.log(`[Forgot Password] Initializing EmailClient...`);
        const emailClient = new EmailClient(process.env.ACS_CONNECTION_STRING);
        
        // Use FRONTEND_URL if set in Azure, otherwise default to localhost for testing
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        
        console.log(`[Forgot Password] Sending email via ACS to ${email} from ${process.env.ACS_SENDER_EMAIL}...`);
        const poller = await emailClient.beginSend({
            senderAddress: process.env.ACS_SENDER_EMAIL,
            content: {
                subject: "Reset your Platodo password",
                plainText: `Hello ${user.name || 'there'},\n\nWe received a request to reset your password. Click the link below to set a new password:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.\n\nThanks,\nThe Platodo Team`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Hello ${user.name || 'there'},</h2>
                        <p>We received a request to reset your password. Click the button below to set a new password:</p>
                        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #6B5CE7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 15px 0;">Reset Password</a>
                        <p style="font-size: 13px; color: #8888AA;">If the button doesn't work, copy and paste this link: <a href="${resetLink}">${resetLink}</a></p>
                        <p style="margin-top: 30px;">If you did not request this, you can safely ignore this email.</p>
                        <p>Thanks,<br/>The Platodo Team</p>
                    </div>
                `
            },
            recipients: {
                to: [{ address: email }]
            }
        });

        console.log(`[Forgot Password] Waiting for email to be sent...`);
        const result = await poller.pollUntilDone();
        console.log(`[Forgot Password] Email send result:`, result);

        res.json({ success: true });
    } catch (e) {
        console.error('[Forgot Password] FATAL ERROR:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

        const pool = await getPool();
        const checkToken = await pool.request()
            .input('token', sql.NVarChar, token)
            .query('SELECT id FROM users WHERE reset_token = @token AND reset_token_expires > GETDATE()');

        if (checkToken.recordset.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const userId = checkToken.recordset[0].id;
        const hash = await bcrypt.hash(newPassword, 10);

        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('hash', sql.NVarChar, hash)
            .query('UPDATE users SET password_hash = @hash, reset_token = NULL, reset_token_expires = NULL WHERE id = @id');

        res.json({ success: true });
    } catch (e) {
        console.error('Reset password error:', e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
