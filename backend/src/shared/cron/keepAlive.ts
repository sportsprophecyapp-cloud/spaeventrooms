
import https from 'https';

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (Render sleeps after 15)

export const startKeepAlive = () => {
    // Only run if we have a URL to ping
    const url = process.env.RENDER_EXTERNAL_URL
        ? `${process.env.RENDER_EXTERNAL_URL}/health`
        : null;

    if (!url) {
        console.log('ℹ️ Keep-alive skipped: RENDER_EXTERNAL_URL not set (running locally?)');
        return;
    }

    console.log(`🚀 Keep-alive service started. Pinging ${url} every 14 minutes.`);

    setInterval(() => {
        https.get(url, (res) => {
            console.log(`💓 Keep-alive ping sent. Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('⚠️ Keep-alive ping failed:', err.message);
        });
    }, PING_INTERVAL);
};
