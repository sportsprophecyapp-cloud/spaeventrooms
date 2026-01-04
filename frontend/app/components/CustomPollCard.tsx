import React, { useState } from 'react';
import styles from './CustomPollCard.module.css';
import CommentSection from './CommentSection';

interface CustomPollCardProps {
    prediction: {
        id: number;
        question: string;
        options: string | string[];
        correct_answer: string | null;
        closes_at: string | null;
    };
    roomId: string;
    onVote: (option: string) => void;
}

const CustomPollCard = ({ prediction, roomId, onVote }: CustomPollCardProps) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const options = typeof prediction.options === 'string'
        ? JSON.parse(prediction.options)
        : prediction.options;

    const isClosed = prediction.closes_at && new Date() > new Date(prediction.closes_at);
    const isRevealed = !!prediction.correct_answer;

    const handleVote = async (opt: string) => {
        if (isClosed || isRevealed || loading) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        setLoading(true);
        try {
            await onVote(opt);
            setSelected(opt);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.card} ${isRevealed ? styles.revealed : ''} ${isClosed ? styles.closed : ''}`}>
            <div className={styles.status}>
                {isRevealed ? '✅ RESULT' : isClosed ? '🔒 CLOSED' : '🗳️ LIVE POLL'}
            </div>
            <h3 className={styles.question}>{prediction.question}</h3>

            <div className={styles.options}>
                {options.map((opt: string) => (
                    <button
                        key={opt}
                        className={`
                            ${styles.optionBtn} 
                            ${selected === opt ? styles.selected : ''} 
                            ${prediction.correct_answer === opt ? styles.correct : ''}
                            ${isRevealed && prediction.correct_answer !== opt && selected === opt ? styles.incorrect : ''}
                        `}
                        onClick={() => handleVote(opt)}
                        disabled={isClosed || isRevealed}
                    >
                        {opt}
                        {prediction.correct_answer === opt && <span className={styles.check}>✓</span>}
                    </button>
                ))}
            </div>

            {isRevealed && (
                <div className={styles.resultMsg}>
                    {selected === prediction.correct_answer ? 'Correct! +100 Points' : 'Better luck next time!'}
                </div>
            )}

            <CommentSection predictionId={prediction.id} roomId={roomId} />
        </div>
    );
};

export default CustomPollCard;
