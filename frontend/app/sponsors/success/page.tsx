const SuccessContent = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (sessionId) {
            const verify = async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    await fetch(`${apiUrl}/api/sponsor-applications/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ session_id: sessionId })
                    });
                } catch (e) {
                    console.error('Verification error', e);
                }
            };
            verify();
        }
    }, [sessionId]);

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass`}>
                <span className={styles.icon}>🎉</span>
                <h1 className={styles.title}>PAYMENT RECEIVED!</h1>
                <p className={styles.text}>
                    Your sponsorship application has been secured. <br />
                    Our team will review your creative assets within 24 hours.
                </p>
                <Link href="/rooms/soccer" className={styles.btn}>
                    ENTER THE ARENA
                </Link>
            </div>
        </div>
    );
};

const SuccessPage = () => {
    return (
        <Suspense fallback={<div className={styles.container}>Loading verification...</div>}>
            <SuccessContent />
        </Suspense>
    );
};

export default SuccessPage;
