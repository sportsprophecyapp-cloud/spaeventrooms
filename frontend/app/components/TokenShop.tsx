'use client';

import React, { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import { useAuth } from '../context/AuthContext';
import styles from './TokenShop.module.css';

interface TokenShopProps {
    onClose: () => void;
}

export default function TokenShop({ onClose }: TokenShopProps) {
    const { cosmetics, tokenBalance, purchaseCosmetic, equipCosmetic, loading } = useGamification();
    const { user } = useAuth();
    const [purchasing, setPurchasing] = useState<number | null>(null);
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const displayUsername = user?.username || 'Prophet';
    const displayInitial = displayUsername.charAt(0).toUpperCase();

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
            // AUTO EQUIP
            await equipCosmetic(cosmeticId, '');
        } else {
            setMessage({ type: 'error', text: 'Acquisition Failed. Try again.' });
        }

        setTimeout(() => setMessage(null), 3000);
        setPurchasing(null);
    };

    const handleEquip = async (cosmeticId: number) => {
        const success = await equipCosmetic(cosmeticId, '');
        if (success) {
            setMessage({ type: 'success', text: 'Gear Equipped!' });
        } else {
            setMessage({ type: 'error', text: 'Equip failed.' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        // FIX: Added onClick to the overlay to allow closing by clicking outside
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
                                    {displayInitial}
                                </div>
                            </div>
                            <p className={styles.previewName}>@{displayUsername}</p>
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
                                                    <button
                                                        className={`${styles.buyBtn} ${styles.equipBtn}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEquip(item.id);
                                                        }}
                                                    >
                                                        EQUIP
                                                    </button>
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
