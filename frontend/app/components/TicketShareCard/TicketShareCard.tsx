'use client';

import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import styles from './TicketShareCard.module.css';

interface TicketShareCardProps {
    prizeTitle: string;
    prizeValue: string;
    sponsorName: string;
    username: string;
    referralCode: string;
    onClose: () => void;
}

const TicketShareCard: React.FC<TicketShareCardProps> = ({
    prizeTitle,
    prizeValue,
    sponsorName,
    username,
    referralCode,
    onClose
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'my-golden-ticket.png', { type: 'image/png' });

            if (navigator.share) {
                await navigator.share({
                    title: 'My Events Arena Entry',
                    text: `I'm officially entered to win ${prizeValue} from ${sponsorName}! Scan to join me in the Arena.`,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = 'my-golden-ticket.png';
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error('Error exporting ticket:', err);
        } finally {
            setIsExporting(false);
        }
    };

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${referralCode}`;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.container} onClick={e => e.stopPropagation()}>
                <div className={styles.cardWrapper} ref={cardRef}>
                    <div className={styles.ticketCard}>
                        <div className={styles.header}>
                            <div className={styles.logo}>
                                <span>ARENA</span>
                                <div className={styles.goldBadge}>OFFICIAL ENTRY</div>
                            </div>
                            <div className={styles.sponsor}>
                                <span>SPONSORED BY</span>
                                <strong>{sponsorName.toUpperCase()}</strong>
                            </div>
                        </div>

                        <div className={styles.prizeSection}>
                            <span className={styles.entryText}>I'M OFFICIALLY IN TO WIN:</span>
                            <h2 className={styles.prizeTitle}>{prizeTitle}</h2>
                            <div className={styles.prizeValue}>{prizeValue}</div>
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.userInfo}>
                                <span className={styles.label}>ENTRANT</span>
                                <span className={styles.username}>{username}</span>
                            </div>
                            <div className={styles.qrSection}>
                                <div className={styles.qrWrapper}>
                                    <QRCodeSVG value={shareUrl} size={60} level="H" />
                                </div>
                                <span className={styles.qrLabel}>SCAN TO JOIN</span>
                            </div>
                        </div>
                        
                        <div className={styles.ticketStub}>
                            <span>#EVENTSARENA-ENTRY-{Math.floor(Math.random() * 100000)}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.closeBtn} onClick={onClose}>CANCEL</button>
                    <button className={styles.shareBtn} onClick={handleShare} disabled={isExporting}>
                        {isExporting ? 'GENERATING...' : '📤 SHARE GOLDEN TICKET'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketShareCard;
