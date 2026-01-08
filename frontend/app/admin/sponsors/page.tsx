'use client';

import React from 'react';
import styles from './page.module.css'; // Assuming a page-specific CSS module
import SponsorDashboard from '../../components/SponsorDashboard/SponsorDashboard';
import { useAuth } from '@/app/context/AuthContext';

const AdminSponsorsPage = () => {
    const { user } = useAuth();
    const canViewSponsors = user?.permissions.includes('can_view_sponsors');

    if (!canViewSponsors) {
        return <div className={styles.error}>ACCESS DENIED: Requires 'can_view_sponsors' permission.</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SPONSOR OVERVIEW</h1>
                <p className={styles.subtitle}>Aggregated Data for Partners</p>
            </header>

            <main className={styles.main}>
                <SponsorDashboard />
                {/* Add more sponsor-specific data or charts here later */}
            </main>
        </div>
    );
};

export default AdminSponsorsPage;
