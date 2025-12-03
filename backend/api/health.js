const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
    });
});

module.exports = app;
