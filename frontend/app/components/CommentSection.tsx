'use client';

import React, { useState, useEffect } from 'react';
import styles from './CommentSection.module.css';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Comment {
    id: number;
    prediction_id: number;
    user_id: number;
    username: string; // Updated to use username
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    predictionId: number;
    roomId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ predictionId, roomId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useAuth(); // Use token from context
    const { socket } = useSocket();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions/${predictionId}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error('Error fetching comments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [predictionId, roomId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('comment_new', (comment: Comment) => {
            if (comment.prediction_id === predictionId) {
                setComments(prev => [...prev, comment]);
            }
        });

        return () => {
            socket.off('comment_new');
        };
    }, [socket, predictionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !token) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/rooms/${roomId}/predictions/${predictionId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Context token is already auth_token
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment('');
            }
        } catch (err) {
            console.error('Error posting comment:', err);
        }
    };

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>Discussion ({comments.length})</h4>
            <div className={styles.list}>
                {loading ? (
                    <p className={styles.loading}>Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className={styles.empty}>Be the first to comment!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className={styles.comment}>
                            <div className={styles.author}>@{comment.username || 'Prophet'}</div>
                            <div className={styles.content}>{comment.content}</div>
                        </div>
                    ))
                )}
            </div>

            {isAuthenticated && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your thoughts..."
                        className={styles.input}
                    />
                    <button type="submit" className={styles.submitBtn}>Post</button>
                </form>
            )}
        </div>
    );
};

export default CommentSection;
