'use client';

import React from 'react';
import styles from './PwaGuideModal.module.css';

interface PwaGuideModalProps {
    platform: 'chrome' | 'safari' | null;
    onClose: () => void;
}

export default function PwaGuideModal({ platform, onClose }: PwaGuideModalProps) {
    if (!platform) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} glass`} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
                
                <h2 className={styles.title}>
                    {platform === 'chrome' ? 'Install on Android / Chrome' : 'Install on iPhone / Safari'}
                </h2>

                <div className={styles.steps}>
                    {platform === 'chrome' ? (
                        <>
                            <div className={styles.step}>
                                <span className={styles.number}>1</span>
                                <p>Tap the <strong>three dots (⋮)</strong> in the top right corner.</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.number}>2</span>
                                <p>Select <strong>"Install App"</strong> or "Add to Home screen".</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.step}>
                                <span className={styles.number}>1</span>
                                <p>Tap the <strong>Share button (□ with ↑)</strong> at the bottom.</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.number}>2</span>
                                <p>Scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.visualHint}>
                    <p>The icon will appear on your home screen for instant access! 🚀</p>
                </div>

                <button className={styles.gotItBtn} onClick={onClose}>GOT IT!</button>
            </div>
        </div>
    );
}
