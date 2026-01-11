'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const SponsorApplyPage = () => {
    const [formData, setFormData] = useState({
        brand_name: '',
        contact_email: '',
        website_url: '',
        arena_target: 'soccer',
        prize_description: '',
        agreed: false
    });

    const [creative, setCreative] = useState({
        logo_size: 100,
        logo_x: 0,
        logo_y: 0,
        prize_size: 100
    });

    const [submitted, setSubmitted] = useState(false);
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
        if (!formData.agreed) return alert('Please agree to terms.');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/sponsor-applications/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand_name: formData.brand_name,
                    contact_email: formData.contact_email,
                    website_url: formData.website_url,
                    arena_target: formData.arena_target,
                    prize_description: formData.prize_description,
                    logo_url: logoPreview,
                    prize_image_url: prizePreview,
                    creative_config: creative,
                    agreed: formData.agreed
                })
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                const errorMsg = data.error || 'Submission failed. Please try again.';
                const missingFields = data.missing ? Object.entries(data.missing).filter(([_, v]) => v).map(([k]) => k).join(', ') : '';
                alert(`${errorMsg}${missingFields ? ` Missing: ${missingFields}` : ''}`);
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Server connection error.');
        }
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={`${styles.successCard} glass`}>
                    <h1>✅ DESIGN SUBMITTED</h1>
                    <p>Our team will review your creative layout and contact you within 24 hours.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>SPONSOR CREATIVE STUDIO</h1>
                <p className={styles.subtitle}>Design your ad and adjust placement perfectly.</p>
            </header>

            <div className={styles.splitLayout}>
                {/* CONTROLS COLUMN */}
                <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
                    <div className={styles.inputGroup}>
                        <label>Brand Name</label>
                        <input required value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} placeholder="e.g. Takomo" />
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Contact Email</label>
                            <input type="email" required value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} placeholder="email@brand.com" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Website URL (Optional)</label>
                            <input value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Brand Logo</label>
                            <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className={styles.fileInput} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Logo Size (%)</label>
                            <input type="range" min="50" max="150" value={creative.logo_size} onChange={e => setCreative({ ...creative, logo_size: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label>Move Horizontal</label>
                            <input type="range" min="-50" max="50" value={creative.logo_x} onChange={e => setCreative({ ...creative, logo_x: parseInt(e.target.value) })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Move Vertical</label>
                            <input type="range" min="-50" max="50" value={creative.logo_y} onChange={e => setCreative({ ...creative, logo_y: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Prize Image</label>
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'prize')} className={styles.fileInput} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Prize Description</label>
                        <textarea required value={formData.prize_description} onChange={e => setFormData({ ...formData, prize_description: e.target.value })} placeholder="Describe your prize..." />
                    </div>

                    <div className={styles.legalSection}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" required checked={formData.agreed} onChange={e => setFormData({ ...formData, agreed: e.target.checked })} />
                            <span>
                                I AGREE TO THE <Link href="/sponsors/terms" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>TERMS & CONDITIONS</Link> AND PRIZE ESCROW PROTOCOL.
                            </span>
                        </label>
                    </div>

                    <button type="submit" className={styles.submitBtn}>SUBMIT DESIGN</button>
                </form>

                {/* LIVE PREVIEW COLUMN */}
                <aside className={styles.previewColumn}>
                    <h3 className={styles.previewTitle}>ARENA LIVE PREVIEW</h3>

                    <div className={styles.previewScroll}>
                        <div className={`${styles.previewWidget} glass`}>
                            <p className={styles.previewLabel}>OFFICIAL ROOM SPONSOR</p>
                            <div className={styles.logoFrame}>
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        style={{
                                            transform: `scale(${creative.logo_size / 100}) translate(${creative.logo_x}px, ${creative.logo_y}px)`,
                                            transition: 'none'
                                        }}
                                        className={styles.previewLogo}
                                    />
                                ) : (
                                    <div className={styles.logoPlaceholder}>LOGO PREVIEW</div>
                                )}
                            </div>
                        </div>

                        <div className={`${styles.previewCard} glass`}>
                            <div className={styles.previewMatchTeams}>EPL: Man City vs Liverpool</div>
                            <div className={styles.previewPrizeTag}>
                                🎫 EARN 1 TICKET FOR: <strong>{formData.brand_name || 'YOUR BRAND'}</strong>
                            </div>
                        </div>

                        <div className={`${styles.previewPrizeCard} glass`}>
                            {prizePreview && <img src={prizePreview} alt="Prize" className={styles.previewPrizeImg} />}
                            <h4>MONTHLY PRIZE DRAW</h4>
                            <p>{formData.prize_description || 'Prize details appear here.'}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SponsorApplyPage;
