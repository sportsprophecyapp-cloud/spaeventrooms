'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import styles from './ChatFilterManager.module.css';

interface FilteredWord {
    id: number;
    word: string;
}

const ChatFilterManager = () => {
    const { token } = useAuth();
    const [words, setWords] = useState<FilteredWord[]>([]);
    const [newWord, setNewWord] = useState('');

    const fetchWords = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/moderation/filter`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setWords(await res.json());
        } catch (e) { console.error('Fetch words failed'); }
    };

    useEffect(() => {
        if (token) fetchWords();
    }, [token]);

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWord.trim()) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/moderation/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ word: newWord.trim() })
            });
            if (res.ok) {
                setNewWord('');
                fetchWords(); // Refresh list
            }
        } catch (e) { console.error('Add word failed'); }
    };

    const handleDeleteWord = async (wordId: number) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            await fetch(`${apiUrl}/api/moderation/filter/${wordId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchWords(); // Refresh list
        } catch (e) { console.error('Delete word failed'); }
    };

    return (
        <div className={`${styles.manager} glass`}>
            <h3>Chat Filter Words</h3>
            <form onSubmit={handleAddWord} className={styles.addForm}>
                <input 
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className={styles.input}
                    placeholder="Add a word to the filter..."
                />
                <button type="submit" className={styles.addBtn}>ADD</button>
            </form>

            <div className={styles.wordList}>
                {words.map(w => (
                    <div key={w.id} className={styles.wordItem}>
                        <span>{w.word}</span>
                        <button onClick={() => handleDeleteWord(w.id)} className={styles.deleteBtn}>DELETE</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatFilterManager;
