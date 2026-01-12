'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Sponsor {
    id: number;
    sponsor_name: string;
    logo_url: string;
    website_url?: string;
}

interface SponsorContextType {
    sponsors: Sponsor[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    trackSponsor: (sponsorId: number, eventType: 'impression' | 'click', roomId?: string, matchId?: string) => Promise<void>;
}

const SponsorContext = createContext<SponsorContextType | undefined>(undefined);

export const SponsorProvider = ({ children }: { children: ReactNode }) => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSponsors = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/sponsor-applications/active`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setSponsors(data.sponsors || []);
            } else {
                setError('Failed to fetch sponsors');
            }
        } catch (err) {
            setError('Network error fetching sponsors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsors();
        // Refetch every 5 minutes to keep data fresh
        const interval = setInterval(fetchSponsors, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const trackSponsor = async (sponsorId: number, eventType: 'impression' | 'click', roomId?: string, matchId?: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            // We don't wait for this - fire and forget to not block UI
            fetch(`${apiUrl}/api/sponsor-applications/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sponsor_id: sponsorId,
                    event_type: eventType,
                    room_id: roomId,
                    match_id: matchId
                })
            }).catch(err => console.error('Tracking failed', err));
        } catch (err) {
            // Silently fail
        }
    };

    return (
        <SponsorContext.Provider value={{ sponsors, loading, error, refetch: fetchSponsors, trackSponsor }}>
            {children}
        </SponsorContext.Provider>
    );
};

export const useSponsor = () => {
    const context = useContext(SponsorContext);
    if (context === undefined) {
        throw new Error('useSponsor must be used within SponsorProvider');
    }
    return context;
};
