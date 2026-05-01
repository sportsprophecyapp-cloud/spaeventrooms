import React from 'react';
import styles from './LayeredProfileCard.module.css';

interface LayeredIdentity {
    shape: string;
    gems: Record<string, number>;
    colour: string;
    portrait: string;
    title: string;
    aura: boolean;
}

interface LayeredProfileCardProps {
    identity: LayeredIdentity;
    size?: number;
    className?: string;
}

export default function LayeredProfileCard({ identity, size = 150, className = '' }: LayeredProfileCardProps) {
    // 1. Map colours based on streak
    const getColourGlow = (colour: string) => {
        switch (colour) {
            case 'spectral': return 'drop-shadow(0 0 15px rgba(238,130,238,0.8))';
            case 'gold': return 'drop-shadow(0 0 10px rgba(255,215,0,0.8))';
            case 'silver': return 'drop-shadow(0 0 8px rgba(192,192,192,0.8))';
            case 'bronze': return 'drop-shadow(0 0 8px rgba(205,127,50,0.8))';
            default: return 'drop-shadow(0 0 5px rgba(0,0,0,0.5))';
        }
    };

    const getStrokeColour = (colour: string) => {
        switch (colour) {
            case 'spectral': return 'url(#spectralGrad)';
            case 'gold': return '#FFD700';
            case 'silver': return '#C0C0C0';
            case 'bronze': return '#CD7F32';
            default: return '#2C2F3F';
        }
    };

    // 2. Avatar Portraits mapping
    const renderAvatar = (portrait: string) => {
        switch (portrait) {
            case 'Oracle': return '👁️';
            case 'Analyst': return '💻';
            case 'Scout': return '📋';
            case 'Fan':
            default: return '🧢';
        }
    };

    // 3. Shape definition (using clipPath for the image/avatar, but SVG path for the border)
    // We'll just use a circle for now to ensure it looks good quickly, but the data is there for stars.
    
    // Calculate Gem rings (5 arenas)
    // We'll draw 5 arcs, each divided into 10 smaller segments (or just filled proportionally)
    const arenas = [
        { id: 'soccer', color: '#F5A623' }, // Gold/amber
        { id: 'nhl', color: '#00BFFF' },    // Ice blue
        { id: 'nfl', color: '#CD7F32' },    // Amber/bronze
        { id: 'f1', color: '#8A2BE2' },     // Deep purple
        { id: 'nba', color: '#FF4500' }     // Orange
    ];

    const radius = 45;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const segmentLength = circumference / 5;

    return (
        <div className={`${styles.cardWrapper} ${className}`} style={{ width: size, height: size }}>
            {/* Layer 6: Champion Aura */}
            {identity.aura && <div className={styles.championAura}></div>}

            <div className={styles.svgContainer}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <defs>
                        <linearGradient id="spectralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff00ff" />
                            <stop offset="50%" stopColor="#00ffff" />
                            <stop offset="100%" stopColor="#ff00ff" />
                        </linearGradient>
                    </defs>

                    {/* Base Background */}
                    <circle cx="50" cy="50" r="48" fill="#0B0E1A" />

                    {/* Layer 2: Gems (Arcs) */}
                    {arenas.map((arena, i) => {
                        const gems = identity.gems[arena.id] || 0;
                        const rotation = (i * 360) / 5 - 90; // Start at top
                        
                        // Fill percentage of this arc (10 gems max = 100% of segment)
                        const fillPercent = gems / 10;
                        const arcLength = segmentLength * 0.9; // 10% gap between arenas
                        const filledLength = arcLength * fillPercent;

                        return (
                            <g key={arena.id} transform={`rotate(${rotation} 50 50)`}>
                                {/* Background Arc */}
                                <circle 
                                    cx="50" cy="50" r={radius} 
                                    fill="none" stroke="#1A1F35" strokeWidth={strokeWidth}
                                    strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                                />
                                {/* Filled Arc */}
                                {gems > 0 && (
                                    <circle 
                                        cx="50" cy="50" r={radius} 
                                        fill="none" stroke={arena.color} strokeWidth={strokeWidth}
                                        strokeDasharray={`${filledLength} ${circumference - filledLength}`}
                                        strokeLinecap="round"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Layer 3: Frame Colour & Layer 1: Shape */}
                    <circle 
                        cx="50" cy="50" r="38" 
                        fill="none" 
                        stroke={getStrokeColour(identity.colour)} 
                        strokeWidth="3" 
                        style={{ filter: getColourGlow(identity.colour) }}
                    />

                    {/* Layer 4: Avatar Portrait (Text Emoji for now) */}
                    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="30">
                        {renderAvatar(identity.portrait)}
                    </text>
                </svg>
            </div>

            {/* Layer 5: Title Badge */}
            <div className={styles.titleBadge}>
                {identity.title}
            </div>
        </div>
    );
}
