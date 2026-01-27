'use client';

import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './ReviewModal.module.css';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        title: string;
        image: string;
    };
    userId: string;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, product, userId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get user profile for name (optional, if you want to store it)
            const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', userId).single();
            const userName = profile?.first_name || 'Anonymous';

            const { error } = await supabase.from('reviews').insert({
                user_id: userId,
                product_id: product.id,
                rating,
                comment,
                full_name: userName // Storing name for easier display
            });

            if (error) throw error;

            alert('Review submitted successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>

                <h2 className={styles.title}>Write a Review</h2>

                <div className={styles.productScan}>
                    <img src={product.image} alt="" className={styles.thumb} />
                    <span className={styles.productName}>{product.title}</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.ratingSection}>
                        <label>Generic Rating</label>
                        <div className={styles.stars}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    fill={star <= (hoverRating || rating) ? "#f68b1e" : "none"}
                                    color={star <= (hoverRating || rating) ? "#f68b1e" : "#ccc"}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    style={{ cursor: 'pointer', marginRight: '5px' }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Review</label>
                        <textarea
                            rows={4}
                            placeholder="Tell us what you liked or didn't like."
                            className={styles.textarea}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
