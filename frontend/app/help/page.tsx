'use client';

import React, { useState } from 'react';
import styles from './help.module.css';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/context/LanguageContext';
import WhatsAppSupport from '@/app/components/WhatsAppSupport/WhatsAppSupport';

const HelpPage = () => {
    const router = useRouter();
    const { t } = useLanguage();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const faqs = [
        {
            id: 1,
            question: "Is Events Arena really free?",
            answer: "Yes! Events Arena is 100% free to play. No deposits, no purchases, no risk. You compete for rewards from our sponsors, not cash."
        },
        {
            id: 2,
            question: "How do I earn tickets?",
            answer: "You earn 1 Ticket for every correct match prediction. You also get daily login bonuses and streak rewards. Check the Draw Room to see your current ticket balance!"
        },
        {
            id: 3,
            question: "What do tickets do?",
            answer: "Tickets are used to enter prize draws in the Draw Room. Each ticket equals one entry. The more tickets you enter, the higher your chances of winning the prize!"
        },
        {
            id: 4,
            question: "Can I predict on the same game twice?",
            answer: "No, you can only make one prediction per game. Choose wisely before submitting!"
        },
        {
            id: 5,
            question: "How do I enter a prize draw?",
            answer: "Go to the Draw Room from the top navigation bar (🎫 icon). Find an active draw, click 'Enter Draw', and confirm your entry."
        },
        {
            id: 6,
            question: "What prizes can I win?",
            answer: "Prizes are provided by our sponsors and vary by arena. Common prizes include gift cards, merchandise, and digital rewards. Check the Draw Room for current listings."
        },
        {
            id: 7,
            question: "When are predictions resolved?",
            answer: "Predictions are typically resolved within 30-60 minutes after a match ends. Your points and tickets will be updated automatically."
        },
        {
            id: 8,
            question: "Is there a mobile app?",
            answer: "Yes! Events Arena is available on both Android and iOS. You can download it to get live notifications for your wins."
        }
    ];

    const toggleFaq = (id: number) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backBtn}>← Back</button>
                <h1>Help & Support</h1>
                <p>Find answers to common questions or contact our live support concierge.</p>
            </header>

            <main className={styles.main}>
                <section className={styles.supportSection}>
                    <div className={styles.supportCard}>
                        <h2>Events Arena Live Support</h2>
                        <p>Need immediate help? Chat with our live concierge on WhatsApp.</p>
                        <a 
                            href="https://wa.me/16475540219?text=Hello! I'm reaching out from the Events Arena Help Page. I have a question about..." 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.whatsappBtn}
                        >
                            💬 Contact Live Support
                        </a>
                    </div>
                </section>

                <section className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.faqList}>
                        {faqs.map(faq => (
                            <div key={faq.id} className={`${styles.faqItem} ${expandedFaq === faq.id ? styles.expanded : ''}`}>
                                <button className={styles.faqQuestion} onClick={() => toggleFaq(faq.id)}>
                                    <span>{faq.question}</span>
                                    <span className={styles.arrow}>{expandedFaq === faq.id ? '−' : '+'}</span>
                                </button>
                                {expandedFaq === faq.id && (
                                    <div className={styles.faqAnswer}>
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2026 Events Arena. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HelpPage;
