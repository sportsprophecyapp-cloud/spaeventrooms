'use client';

import React, { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import styles from './TokenShop.module.css';

interface TokenShopProps {
    onClose: () => void;
}

export default function TokenShop({ onClose }: TokenShopProps) {
    const { cosmetics, tokenBalance, purchaseCosmetic, loading } = useGamification();
    const [purchasing, setPurchasing] = useState<number | null>(null);
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
            setMessage({ type: 'success', text: 'Purchase successful!' });
        } else {
            setMessage({ type: 'error', text: 'Purchase failed. Try again.' });
        }

        setTimeout(() => setMessage(null), 3000);
        setPurchasing(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    ✕
                </button>

                <div className={styles.header}>
                    <h2>Token Shop</h2>
                    <div className={styles.balance}>
                        <span className={styles.balanceIcon}>🪙</span>
                        <span className={styles.balanceAmount}>{tokenBalance.toLocaleString()}</span>
                    </div>
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.grid}>
                    {loading ? (
                        <div className={styles.loading}>Loading shop...</div>
                    ) : cosmetics.length === 0 ? (
                        <div className={styles.empty}>No cosmetics available yet.</div>
                    ) : (
                        cosmetics.map((item) => (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.cardImage}>
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} />
                                    ) : (
                                        <div className={styles.placeholder}>
                                            {item.type === 'avatar' ? '👤' : item.type === 'frame' ? '🖼️' : '🎨'}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.cardContent}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.type}>{item.type}</p>
                                    {item.description && (
                                        <p className={styles.description}>{item.description}</p>
                                    )}

                                    <div className={styles.cardFooter}>
                                        <span className={styles.cost}>
                                            <span className={styles.costIcon}>🪙</span>
                                            {item.cost}
                                        </span>

                                        {item.owned ? (
                                            <span className={styles.ownedBadge}>Owned</span>
                                        ) : (
                                            <button
                                                className={styles.buyBtn}
                                                onClick={() => handlePurchase(item.id, item.cost)}
                                                disabled={purchasing === item.id || tokenBalance < item.cost}
                                            >
                                                {purchasing === item.id ? 'Buying...' : 'Buy'}
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
    );
}
