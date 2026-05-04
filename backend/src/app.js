const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const plannerRoutes = require('./routes/planner');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', tasksRoutes);
app.use('/planner', plannerRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);

    // Keep-alive: ping /health every 14 min to prevent F1 free tier sleep (sleeps after 20 min idle)
    const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
        try {
            const http = require('http');
            http.get(`${BASE_URL}/health`, res => {
                console.log(`[Keep-alive] ping OK (${res.statusCode})`);
            }).on('error', err => {
                console.warn('[Keep-alive] ping failed:', err.message);
            });
        } catch (e) { /* silent */ }
    }, 14 * 60 * 1000); // every 14 minutes
});
