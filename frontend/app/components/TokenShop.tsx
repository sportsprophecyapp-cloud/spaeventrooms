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
    const { user, updateCosmetics } = useAuth();
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
        const item = cosmetics.find(c => c.id === cosmeticId);
        if (!item) return;

        // Optimistic update via AuthContext (no full reload)
        if (item.type === 'avatar') {
            await updateCosmetics(item.imageUrl, undefined);
        } else if (item.type === 'frame') {
            await updateCosmetics(undefined, item.imageUrl);
        }

        // Also call the gamification equip endpoint to ensure backend consistency if the AuthContext one isn't enough
        // But the user instructions imply updateCosmetics API replaces the need for equipCosmetic or works alongside it.
        // Given user instructions "await updateCosmetics(avatarId)", I will trust that is the primary action now.
        // However, existing gamification logic used logic based on IDs. 
        // If api/users/cosmetics updates the 'equipped' field directly with URLs, we are good.

        setMessage({ type: 'success', text: 'Gear Equipped!' });
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
                            <div className={`${styles.avatarWrapper} ${previewItem?.type === 'frame' ? styles.hasFrame : ''}`}>
                                {previewItem?.type === 'frame' && (
                                    <div className={styles.frameOverlay}>
                                        <img src={previewItem.imageUrl} alt="Frame Preview" />
                                    </div>
                                )}
                                <div className={styles.previewAvatar}>
                                    {previewItem?.type === 'avatar' ? (
                                        <img src={previewItem.imageUrl} alt="Avatar Preview" className={styles.avatarImg} />
                                    ) : (
                                        user?.equipped?.avatar ? (
                                            <img src={user.equipped.avatar} alt="Current Avatar" className={styles.avatarImg} />
                                        ) : displayInitial
                                    )}
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
                                                {item.is_achievement_reward ? (
                                                    <span className={styles.achievementLocked}>EARNED ONLY</span>
                                                ) : (
                                                    <span className={styles.cost}>{item.cost} PTS</span>
                                                )}

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
                                                ) : item.is_achievement_reward ? (
                                                    <button
                                                        className={`${styles.buyBtn} ${styles.lockedBtn}`}
                                                        disabled={true}
                                                    >
                                                        LOCKED
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
