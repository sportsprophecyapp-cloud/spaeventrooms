'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

const SponsorApplyPage = () => {
    const [formData, setFormData] = useState({
        brand_name: '',
        contact_email: '',
        arena_target: 'soccer',
        frequency: 'monthly',
        prize_quantity: 1,
        prize_description: '',
        logo_url: '',
        prize_url: '',
        agreed: false
    });
    const [submitted, setSubmitted] = useState(false);

    // Mock Live Preview State
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [prizePreview, setPrizePreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'prize') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') setLogoPreview(reader.result as string);
                else setPrizePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.agreed) return alert('You must agree to the prize delivery terms.');
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={`${styles.successCard} glass`}>
                    <h1>✅ STRATEGY SUBMITTED</h1>
                    <p>Our team will review your proposal. We will contact you at <strong>{formData.contact_email}</strong> within 24 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>FOUNDING PARTNER SANDBOX</h1>
                <p className={styles.subtitle}>Design your campaign and preview your Arena exposure.</p>
            </header>

            <div className={styles.splitLayout}>
                {/* FORM COLUMN */}
                <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
                    <div className={styles.inputGroup}>
                        <label>Brand Name</label>
                        <input required value={formData.brand_name} onChange={e => setFormData({...formData, brand_name: e.target.value})} placeholder="e.g. Takomo Golf" />
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Brand Logo</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className={styles.fileInput} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Target Arena</label>
                            <select value={formData.arena_target} onChange={e => setFormData({...formData, arena_target: e.target.value})} className={styles.select}>
                                <option value="soccer">Soccer Arena</option>
                                <option value="golf">Golf Arena</option>
                                <option value="global">Global</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Prize Image</label>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'prize')} className={styles.fileInput} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Prize Description</label>
                        <textarea required value={formData.prize_description} onChange={e => setFormData({...formData, prize_description: e.target.value})} placeholder="e.g. Win a full set of 101 Irons..." />
                    </div>

                    <div className={styles.legalSection}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" required checked={formData.agreed} onChange={e => setFormData({...formData, agreed: e.target.checked})} />
                            <span>I AGREE TO THE DIGITAL REDEMPTION PROTOCOL.</span>
                        </label>
                    </div>

                    <button type="submit" className={styles.submitBtn}>SUBMIT CAMPAIGN</button>
                </form>

                {/* LIVE PREVIEW COLUMN */}
                <aside className={styles.previewColumn}>
                    <h3 className={styles.previewTitle}>LIVE ARENA PREVIEW</h3>
                    
                    <div className={styles.previewScroll}>
                        {/* 1. SPONSOR WIDGET PREVIEW */}
                        <div className={`${styles.previewWidget} glass`}>
                            <p className={styles.previewLabel}>OFFICIAL ROOM SPONSOR</p>
                            {logoPreview ? <img src={logoPreview} alt="Logo" className={styles.previewLogo} /> : <div className={styles.logoPlaceholder}>YOUR LOGO HERE</div>}
                        </div>

                        {/* 2. MATCH CARD PREVIEW */}
                        <div className={`${styles.previewCard} glass`}>
                            <div className={styles.previewMatchTeams}>Manchester City vs Liverpool</div>
                            <div className={styles.previewPrizeTag}>
                                🎫 EARN 1 TICKET FOR: <strong>{formData.brand_name || 'Your Brand'}</strong>
                            </div>
                        </div>

                        {/* 3. PRIZE DRAW PREVIEW */}
                        <div className={`${styles.previewPrizeCard} glass`}>
                            {prizePreview && <img src={prizePreview} alt="Prize" className={styles.previewPrizeImg} />}
                            <h4>{formData.frequency.toUpperCase()} PRIZE DRAW</h4>
                            <p>{formData.prize_description || 'Your prize description will appear here for all Supporters to see.'}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SponsorApplyPage;
