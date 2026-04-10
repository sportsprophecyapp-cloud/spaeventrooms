'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

const ApplyFormContent = () => {
    const searchParams = useSearchParams();
    const tier = searchParams.get('tier');

    // Map tier IDs to readable names
    const tierNames: Record<string, string> = {
        'founding': 'Founding Partner (Exclusive)',
        'starter': 'Starter Arena ($99/mo)',
        'growth': 'Growth Arena ($299/mo)',
        'premium': 'Premium Arena ($599/mo)'
    };

    const selectedTierName = tier ? tierNames[tier] : null;

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

    // Compress image to keep DB size under ~50KB
    const compressImage = (file: File, maxWidth: number, quality: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Canvas not supported');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'prize') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Enforce 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Please use an image under 5MB.');
            e.target.value = '';
            return;
        }

        try {
            // Logo: max 300px, Prize: max 600px - compress to JPEG at 70%
            const maxPx = type === 'logo' ? 300 : 600;
            const compressed = await compressImage(file, maxPx, 0.7);
            if (type === 'logo') setLogoPreview(compressed);
            else setPrizePreview(compressed);
        } catch {
            alert('Error processing image. Please try another file.');
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
                    agreed: formData.agreed,
                    package_tier: tier && !tier.startsWith('tier_') ? `tier_${tier}` : (tier || 'custom') // FIX: Ensure backend prefix match
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.checkoutUrl) {
                    // Redirect to Stripe
                    window.location.href = data.checkoutUrl;
                } else {
                    setSubmitted(true);
                }
            } else {
                const data = await res.json();
                const errorMsg = data.error || 'Submission failed. Please try again.';
                // ... error handling
                alert(errorMsg);
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

                {selectedTierName ? (
                    <div style={{ marginTop: '20px', padding: '10px', background: 'var(--accent)', borderRadius: '8px', display: 'inline-block', fontWeight: 'bold', color: 'black' }}>
                        Selected Package: {selectedTierName}
                    </div>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        <Link href="/sponsors/pricing" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                            View Ad Packages & Pricing
                        </Link>
                    </div>
                )}
            </header>

            <div className={styles.splitLayout}>
                {/* CONTROLS COLUMN */}
                <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="brand_name">Brand Name</label>
                        <input id="brand_name" name="brand_name" required value={formData.brand_name} onChange={e => setFormData({ ...formData, brand_name: e.target.value })} placeholder="e.g. Takomo" />
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="contact_email">Contact Email</label>
                            <input id="contact_email" name="contact_email" type="email" required value={formData.contact_email} onChange={e => setFormData({ ...formData, contact_email: e.target.value })} placeholder="email@brand.com" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="website_url">Website URL (Optional)</label>
                            <input id="website_url" name="website_url" value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="logo_upload">Brand Logo <span className={styles.guideline}>(512x512px Transparent PNG)</span></label>
                            <input id="logo_upload" name="logo_upload" type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className={styles.fileInput} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="logo_size">Logo Size (%)</label>
                            <input id="logo_size" name="logo_size" type="range" min="50" max="150" value={creative.logo_size} onChange={e => setCreative({ ...creative, logo_size: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="logo_x">Move Horizontal</label>
                            <input id="logo_x" name="logo_x" type="range" min="-50" max="50" value={creative.logo_x} onChange={e => setCreative({ ...creative, logo_x: parseInt(e.target.value) })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="logo_y">Move Vertical</label>
                            <input id="logo_y" name="logo_y" type="range" min="-50" max="50" value={creative.logo_y} onChange={e => setCreative({ ...creative, logo_y: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="prize_image">Prize / Promo Image <span className={styles.guideline}>(1200x400px Recommended)</span></label>
                        <input id="prize_image" name="prize_image" type="file" accept="image/*" onChange={e => handleFileChange(e, 'prize')} className={styles.fileInput} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="prize_description">Prize Description</label>
                        <textarea id="prize_description" name="prize_description" required value={formData.prize_description} onChange={e => setFormData({ ...formData, prize_description: e.target.value })} placeholder="Describe your prize..." />
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

const SponsorApplyPage = () => {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <ApplyFormContent />
        </Suspense>
    );
};

export default SponsorApplyPage;
