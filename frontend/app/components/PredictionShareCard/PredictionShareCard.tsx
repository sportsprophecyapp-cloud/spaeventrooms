'use client';

import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import styles from './PredictionShareCard.module.css';

interface PredictionShareCardProps {
    homeTeam: string;
    awayTeam: string;
    homeLogo: string;
    awayLogo: string;
    pick: string;
    username: string;
    referralCode: string;
    matchId: string;
    onClose: () => void;
}

const PredictionShareCard: React.FC<PredictionShareCardProps> = ({
    homeTeam,
    awayTeam,
    homeLogo,
    awayLogo,
    pick,
    username,
    referralCode,
    matchId,
    onClose
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const isReferralMode = matchId === 'referral';

    const shareUrl = isReferralMode 
        ? `${window.location.origin}/auth/register?ref=${referralCode}`
        : `${window.location.origin}/rooms/nhl?match=${matchId}&ref=${referralCode}`;

    const handleDownload = async () => {
        if (cardRef.current === null) return;
        
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = isReferralMode ? `EventsArena-Invite-${username}.png` : `EventsArena-Prediction-${matchId}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        }
    };

    const handleNativeShare = async () => {
        if (cardRef.current === null) return;

        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'prediction.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: isReferralMode ? 'Join my Arena Squad!' : 'My Events Arena Prediction',
                    text: isReferralMode 
                        ? `Join me on Events Arena and get a crown bonus! @${username}`
                        : `I'm picking the ${pick} to win! Scan the QR code to bet against me.`,
                });
            } else {
                handleDownload();
            }
        } catch (err) {
            console.error('Share failed', err);
            handleDownload();
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.previewContainer}>
                    <div ref={cardRef} className={styles.card}>
                        <div className={styles.header}>
                            <img src="/assets/icon.png" className={styles.miniLogo} alt="Logo" />
                            <span className={styles.arenaTag}>EVENTS ARENA</span>
                        </div>

                        <div className={styles.mainTitle}>{isReferralMode ? 'SQUAD INVITE' : 'PREDICTION LOCKED'}</div>

                        <div className={styles.matchup}>
                            <div className={styles.team}>
                                <div className={styles.logoCircle}>
                                    <img src={homeLogo} alt={homeTeam} className={styles.teamLogo} />
                                </div>
                                <span className={styles.teamName}>{homeTeam}</span>
                            </div>

                            <div className={styles.vs}>VS</div>

                            <div className={styles.team}>
                                <div className={styles.logoCircle}>
                                    <img src={awayLogo} alt={awayTeam} className={styles.teamLogo} />
                                </div>
                                <span className={styles.teamName}>{awayTeam}</span>
                            </div>
                        </div>

                        <div className={styles.predictionBox}>
                            <span className={styles.pickLabel}>{isReferralMode ? 'RECRUITER' : 'MY PICK'}</span>
                            <span className={styles.pickValue}>{isReferralMode ? `@${username}`.toUpperCase() : pick.toUpperCase()}</span>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.userInfo}>
                                <span className={styles.username}>{isReferralMode ? 'UNLIMITED REWARDS' : `@${username}`}</span>
                                <span className={styles.inviteText}>{isReferralMode ? 'SCAN TO JOIN SQUAD' : 'SCAN TO CHALLENGE ME'}</span>
                            </div>
                            <div className={styles.qrWrapper}>
                                <QRCodeSVG 
                                    value={shareUrl} 
                                    size={80} 
                                    bgColor={"transparent"} 
                                    fgColor={"#B4975A"} 
                                    level={"H"}
                                />
                            </div>
                        </div>
                        
                        <div className={styles.watermark}>WWW.SPORTSPROPHECYAPP.COM</div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button onClick={handleNativeShare} className={styles.shareBtn}>
                        📤 SHARE TO SOCIAL
                    </button>
                    <button onClick={onClose} className={styles.closeBtn}>
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PredictionShareCard;
