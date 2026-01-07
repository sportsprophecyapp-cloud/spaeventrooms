import https from 'https';

// 14 minutes (Render free tier sleeps after 15 mins of inactivity)
const PING_INTERVAL = 14 * 60 * 1000; 

export const startKeepAlive = () => {
    // Backend URL (Self)
    const backendUrl = process.env.RENDER_EXTERNAL_URL || 'https://spa-backend-mvb1.onrender.com';
    
    // Frontend URL (User Facing)
    const frontendUrl = 'https://www.sportsprophecyapp.com';

    console.log(`🚀 Mutual Keep-alive started.`);
    console.log(`📡 Targets: ${backendUrl}/health AND ${frontendUrl}`);

    setInterval(() => {
        // Ping Backend
        https.get(`${backendUrl}/health`, (res) => {
            console.log(`💓 Backend ping: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('⚠️ Backend keep-alive failed:', err.message);
        });

        // Ping Frontend (Keep the UI snappy!)
        https.get(frontendUrl, (res) => {
            console.log(`💓 Frontend ping: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('⚠️ Frontend keep-alive failed:', err.message);
        });

    }, PING_INTERVAL);
};
