'use client';

import React from 'react';
import styles from './SkeletonCard.module.css';

interface SkeletonCardProps {
    type?: 'announcement' | 'match' | 'poll';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'announcement' }) => {
    return (
        <div className={`${styles.skeleton} ${styles[type]}`}>
            <div className={styles.shimmer}></div>
            <div className={styles.header}></div>
            <div className={styles.line}></div>
            <div className={styles.lineShort}></div>
        </div>
    );
};

export default SkeletonCard;
