import { SoccerRoom } from '../rooms/soccer/room';
import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

// Mock request/response
const mockReq = {} as any;
const mockRes = {
    json: (data: any) => {
        console.log('Room Response:', JSON.stringify(data, null, 2));
    },
    status: (code: number) => {
        console.log('Status:', code);
        return mockRes;
    }
} as any;

const run = async () => {
    // We can't easily instantiate the room because it sets up router with app.
    // Instead we can just reuse the query logic or try to spin up a minimal app.
    // Let's just run the query that room.ts runs to verify the transformation.

    // OR, better, let's just use the database directly to test the grouping logic
    // copying the logic from room.ts effectively.

    // Actually, let's try to hit the endpoint if the server was running, but it's not.
    // So let's write a script that does exactly what room.ts does.

    const { query } = require('../shared/database');

    try {
        const result = await query('SELECT * FROM soccer_matches ORDER BY league ASC, start_time ASC');
        const matches = result.rows;

        const grouped: Record<string, any[]> = {};
        matches.forEach((match: any) => {
            const leagueName = match.league || 'Unknown League';
            if (!grouped[leagueName]) {
                grouped[leagueName] = [];
            }
            grouped[leagueName].push(match);
        });

        const sections = Object.keys(grouped).map(league => ({
            title: league,
            logo: grouped[league][0]?.league_logo,
            matches: grouped[league].map((m: any) => `${m.home_team} vs ${m.away_team} (${m.status})`)
        }));

        console.log('Generated Sections:', JSON.stringify(sections, null, 2));

    } catch (err) {
        console.error(err);
    }

    setTimeout(() => process.exit(0), 1000);
};

run();
