'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function DailyLoginButton() {
    const { token, refreshUser } = useAuth(); // We need refreshUser to update the UI balance after claim
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [streak, setStreak] = useState<number>(0);
    const [reward, setReward] = useState<number | null>(null);
    const [claimedToday, setClaimedToday] = useState(false);

    useEffect(() => {
        // Quick local check to prevent spamming if we know we claimed it
        const lastClaimDate = localStorage.getItem('lastDailyClaimDate');
        if (lastClaimDate) {
            const today = new Date().toDateString();
            if (lastClaimDate === today) {
                setClaimedToday(true);
            }
        }
    }, []);

    const handleClaim = async () => {
        if (!token) return;
        setLoading(true);
        setMessage(null);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';

        try {
            const res = await fetch(`${apiUrl}/api/gamification/daily-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success) {
                if (data.alreadyClaimed) {
                    setMessage("Already claimed for today!");
                    setClaimedToday(true);
                    setStreak(data.streak || 0);
                    // Update local storage just in case
                    localStorage.setItem('lastDailyClaimDate', new Date().toDateString());
                } else {
                    setStreak(data.streak?.current || 1);
                    setReward(data.reward?.amount || 0);
                    setMessage(`+${data.reward?.amount} Tokens! Streak: ${data.streak?.current}`);
                    setClaimedToday(true);
                    localStorage.setItem('lastDailyClaimDate', new Date().toDateString());

                    // Celebration!
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#FF6B6B', '#FF8E53', '#FFD93D']
                    });

                    // CRITICAL: Refresh user context to show new balance in UserTray
                    await refreshUser();
                }
            } else {
                setMessage(data.error || "Failed to claim reward.");
            }
        } catch (err) {
            console.error(err);
            setMessage("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (claimedToday && !message) {
        // Optional: Hide button if claimed, or show "Come back tomorrow"
        // For now, let's show a "Claimed" state so user knows it exists
    }

    // Inline Styles
    const containerStyle: React.CSSProperties = {
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
    };

    const buttonStyle: React.CSSProperties = {
        background: claimedToday
            ? 'linear-gradient(135deg, #444 0%, #222 100%)'
            : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', // Vibrant gradient
        border: 'none',
        borderRadius: '12px',
        padding: '12px 24px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: claimedToday ? 'default' : 'pointer',
        boxShadow: claimedToday ? 'none' : '0 4px 15px rgba(255, 107, 107, 0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: loading ? 0.7 : 1,
        width: '100%',
        maxWidth: '350px',
        justifyContent: 'center'
    };

    return (
        <div style={containerStyle}>
            <button
                onClick={handleClaim}
                disabled={loading || claimedToday}
                style={buttonStyle}
            >
                <span>🔥</span>
                {loading ? 'Claiming...' : claimedToday ? 'Daily Reward Claimed' : 'Claim Daily Reward'}
            </button>

            {message && (
                <div style={{
                    color: '#FF8E53',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    {message}
                </div>
            )}

            {streak > 0 && !claimedToday && (
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                    Current Streak: {streak} Days
                </div>
            )}
        </div>
    );
}
