const axios = require('axios');

const API_URL = 'https://sportsprophecy-backend-lqq2d5um5.vercel.app/api';

async function debugEvents() {
    try {
        console.log('Fetching events from:', API_URL + '/events');
        const response = await axios.get(API_URL + '/events');
        const events = response.data;

        console.log(`Fetched ${events.length} events.`);

        if (events.length > 0) {
            console.log('Sample event structure:', JSON.stringify(events[0], null, 2));

            const uniqueSports = [...new Set(events.map(e => e.sport_key || e.sport))];
            console.log('Unique sports found:', uniqueSports);

            const now = new Date();
            const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);

            const upcoming = events.filter(event => {
                const eventDate = new Date(event.commence_time || event.startTime);
                return eventDate >= now && eventDate <= fortyEightHoursLater;
            });

            console.log(`Events in next 48 hours: ${upcoming.length}`);
            if (upcoming.length > 0) {
                console.log('Sample upcoming event:', JSON.stringify(upcoming[0], null, 2));
            }
        } else {
            console.log('No events returned from API.');
        }

    } catch (error) {
        console.error('Error fetching events:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

debugEvents();
