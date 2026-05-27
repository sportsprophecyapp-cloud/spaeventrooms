'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function MaintenanceBarrier({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Entering the Arena...');

    useEffect(() => {
        const exemptPaths = ['/maintenance', '/privacy', '/terms', '/corporate', '/delete-account'];
        
        // Prevent redirects on static/exempt pages
        if (exemptPaths.some(path => pathname === path || pathname?.startsWith(path + '/'))) {
            setIsChecking(false);
            return;
        }

        let isMounted = true;
        
        // Dynamic status updater to manage free-tier backend cold starts
        const messageTimer = setTimeout(() => {
            if (isMounted && isChecking) {
                setLoadingMessage('The Arena is waking up... (Render Free Tier cold start takes ~20 seconds)');
            }
        }, 5000);

        const checkHealth = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://spa-backend-mvb1.onrender.com';
            
            try {
                // Set 30-second timeout to allow Render Free Tier backend to complete its cold start
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const res = await fetch(`${apiUrl}/health`, {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                
                clearTimeout(timeoutId);

                if (!isMounted) return;

                if (!res.ok) {
                    // Backend is up but database query failed (e.g. 500/503)
                    console.error('Health check failed: API returned status', res.status);
                    router.push('/maintenance');
                } else {
                    // Successful connection
                    setIsChecking(false);
                }
            } catch (err: any) {
                if (!isMounted) return;
                
                // Network error or fetch aborted (API is suspended or taking > 30s)
                console.error('Health check failed: Connection error', err);
                router.push('/maintenance');
            }
        };

        checkHealth();

        return () => {
            isMounted = false;
            clearTimeout(messageTimer);
        };
    }, [pathname, router]);

    const exemptPaths = ['/maintenance', '/privacy', '/terms', '/corporate', '/delete-account'];
    const isExempt = exemptPaths.some(path => pathname === path || pathname?.startsWith(path + '/'));

    if (isChecking && !isExempt) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#050505',
                color: '#ffffff',
                fontFamily: 'var(--font-outfit), sans-serif',
                gap: '1.5rem',
                padding: '2rem',
                textAlign: 'center',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '3px solid rgba(0, 112, 243, 0.1)',
                    borderTopColor: 'var(--accent, #0070f3)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    boxShadow: '0 0 15px rgba(0, 112, 243, 0.2)'
                }} />
                
                <h1 style={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: 0
                }}>
                    EVENTS <span style={{ color: 'var(--accent, #0070f3)' }}>ARENA</span>
                </h1>
                
                <p style={{ 
                    maxWidth: '380px',
                    lineHeight: '1.5',
                    fontSize: '0.85rem', 
                    color: 'var(--neutral, #a0aec0)',
                    letterSpacing: '0.05em',
                    margin: 0
                }}>
                    {loadingMessage}
                </p>

                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}} />
            </div>
        );
    }

    return <>{children}</>;
}
