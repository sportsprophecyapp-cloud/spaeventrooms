'use client';

import React, { useEffect, useState } from 'react';
import styles from './RewardCenter.module.css';
import { useAuth } from '@/app/context/AuthContext';

interface Voucher {
    id: string;
    title: string;
    description: string;
    claimed: boolean;
}

const RewardCenter = () => {
    const { token } = useAuth();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);

    useEffect(() => {
        const fetchVouchers = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            try {
                const res = await fetch(`${apiUrl}/api/gamification/vouchers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setVouchers(data.vouchers);
                }
            } catch (err) {
                console.error('Error fetching vouchers:', err);
            }
        };

        if (token) {
            fetchVouchers();
        }
    }, [token]);

    const handleClaim = async (voucherId: string) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/gamification/vouchers/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voucherId })
            });

            if (res.ok) {
                setVouchers(vouchers.map(v => v.id === voucherId ? { ...v, claimed: true } : v));
            }
        } catch (err) {
            console.error('Error claiming voucher:', err);
        }
    };

    return (
        <section className={`${styles.rewardCenter} glass`}>
            <h3>REWARD CENTER</h3>
            <p>Your collection of claimed prize vouchers.</p>
            <div className={styles.voucherList}>
                {vouchers.map(voucher => (
                    <div key={voucher.id} className={`${styles.voucher} ${voucher.claimed ? styles.claimed : ''}`}>
                        <div className={styles.voucherInfo}>
                            <h4>{voucher.title}</h4>
                            <p>{voucher.description}</p>
                        </div>
                        <button onClick={() => handleClaim(voucher.id)} disabled={voucher.claimed} className={styles.claimBtn}>
                            {voucher.claimed ? 'CLAIMED' : 'CLAIM'}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RewardCenter;
