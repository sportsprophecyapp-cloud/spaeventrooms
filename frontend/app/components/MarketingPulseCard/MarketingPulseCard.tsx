'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import styles from './MarketingPulseCard.module.css';

interface MarketingPulseCardProps {
    homeTeam: string;
    awayTeam: string;
    homeLogo: string;
    awayLogo: string;
    homePct: number;
    awayPct: number;
    drawPct?: number;
    totalVotes: number;
}

const MarketingPulseCard: React.FC<MarketingPulseCardProps> = ({
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    homePct,
    awayPct,
    drawPct = 0,
    totalVotes
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
            const link = document.createElement('a');
            link.download = `sentiment-${homeTeam}-vs-${awayTeam}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error exporting pulse card:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card} ref={cardRef}>
                <div className={styles.header}>
                    <div className={styles.arenaLogo}>ARENA PULSE</div>
                    <div className={styles.liveBadge}>LIVE SENTIMENT</div>
                </div>

                <div className={styles.mainContent}>
                    <div className={styles.matchup}>
                        <div className={styles.team}>
                            <img src={homeLogo} alt="" />
                            <span className={styles.teamName}>{homeTeam}</span>
                            <span className={styles.percentage}>{homePct}%</span>
                        </div>
                        <div className={styles.vs}>VS</div>
                        <div className={styles.team}>
                            <img src={awayLogo} alt="" />
                            <span className={styles.teamName}>{awayTeam}</span>
                            <span className={styles.percentage}>{awayPct}%</span>
                        </div>
                    </div>

                    <div className={styles.barContainer}>
                        <div className={styles.bar}>
                            <div className={styles.homeBar} style={{ width: `${homePct}%` }}></div>
                            {drawPct > 0 && <div className={styles.drawBar} style={{ width: `${drawPct}%` }}></div>}
                            <div className={styles.awayBar} style={{ width: `${awayPct}%` }}></div>
                        </div>
                        <div className={styles.barLabels}>
                            <span>{homeTeam}</span>
                            {drawPct > 0 && <span>DRAW</span>}
                            <span>{awayTeam}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.stats}>
                        <strong>{totalVotes}</strong> FANS HAVE VOTED
                    </div>
                    <div className={styles.watermark}>sportsprophecyapp.com</div>
                </div>
            </div>

            <button className={styles.exportBtn} onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'CAPTURING...' : '📸 DOWNLOAD FOR SOCIAL MEDIA'}
            </button>
        </div>
    );
};

export default MarketingPulseCard;
