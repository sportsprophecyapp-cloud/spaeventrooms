'use client';

import React, { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import styles from './TokenShop.module.css';

interface TokenShopProps {
    onClose: () => void;
}

export default function TokenShop({ onClose }: TokenShopProps) {
    const { cosmetics, tokenBalance, purchaseCosmetic, loading } = useGamification();
    const { user } = useAuth();
    const [purchasing, setPurchasing] = useState<number | null>(null);
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handlePurchase = async (cosmeticId: number, cost: number) => {
        if (tokenBalance < cost) {
            setMessage({ type: 'error', text: 'Insufficient tokens!' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        setPurchasing(cosmeticId);
        const success = await purchaseCosmetic(cosmeticId);

        if (success) {
            setMessage({ type: 'success', text: 'Prophecy Gear Acquired!' });
        } else {
            setMessage({ type: 'error', text: 'Acquisition Failed. Try again.' });
        }

        setTimeout(() => setMessage(null), 3000);
        setPurchasing(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass`} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>

                <div className={styles.layout}>
                    {/* Left: Preview Area */}
                    <div className={styles.previewSection}>
                        <h2 className={styles.title}>Cosmetic Lab</h2>
                        <div className={styles.previewContainer}>
                            <div className={styles.avatarWrapper} style={{ 
                                borderColor: previewItem?.type === 'frame' ? 'var(--accent)' : 'var(--glass-border)' 
                            }}>
                                <div className={styles.previewAvatar}>
                                    {user?.username?.charAt(0).toUpperCase() || 'P'}
                                </div>
                            </div>
                            <p className={styles.previewName}>@{user?.username || 'Prophet'}</p>
                            <span className={styles.previewStatus}>
                                {previewItem ? `PREVIEWING: ${previewItem.name}` : 'Select gear to try on'}
                            </span>
                        </div>
                        
                        <div className={styles.balance}>
                            <span className={styles.balanceLabel}>YOUR TOKENS</span>
                            <span className={styles.balanceAmount}>{tokenBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Right: Items Grid */}
                    <div className={styles.itemsSection}>
                        <div className={styles.grid}>
                            {loading ? (
                                <div className={styles.loading}>Accessing Gear...</div>
                            ) : (
                                cosmetics.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={`${styles.card} ${previewItem?.id === item.id ? styles.activePreview : ''}`}
                                        onClick={() => setPreviewItem(item)}
                                    >
                                        <div className={styles.cardImage}>
                                            <span className={styles.itemIcon}>
                                                {item.type === 'avatar' ? '👤' : '🖼️'}
                                            </span>
                                        </div>

                                        <div className={styles.cardContent}>
                                            <h3>{item.name}</h3>
                                            <div className={styles.cardFooter}>
                                                <span className={styles.cost}>{item.cost} PTS</span>
                                                {item.owned ? (
                                                    <span className={styles.ownedBadge}>OWNED</span>
                                                ) : (
                                                    <button
                                                        className={styles.buyBtn}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePurchase(item.id, item.cost);
                                                        }}
                                                        disabled={purchasing === item.id || tokenBalance < item.cost}
                                                    >
                                                        {purchasing === item.id ? '...' : 'BUY'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`${styles.toast} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
