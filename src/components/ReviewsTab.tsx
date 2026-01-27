'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './ReviewsTab.module.css';

interface ReviewsTabProps {
    productId: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    full_name: string;
    created_at: string;
}

export default function ReviewsTab({ productId }: ReviewsTabProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        average: 0,
        distribution: [0, 0, 0, 0, 0] // 5, 4, 3, 2, 1 stars
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const fetchReviews = async () => {
        setLoading(true);
        // Fetch specific reviews for this product
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            setLoading(false);
            return;
        }

        const fetchedReviews = data as Review[];
        setReviews(fetchedReviews);
        calculateStats(fetchedReviews);
        setLoading(false);
    };

    const calculateStats = (items: Review[]) => {
        const total = items.length;
        if (total === 0) {
            setStats({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
            return;
        }

        const sum = items.reduce((acc, item) => acc + item.rating, 0);
        const average = parseFloat((sum / total).toFixed(1));

        const dist = [0, 0, 0, 0, 0]; // Index 0 = 5 stars, Index 4 = 1 star
        items.forEach(item => {
            const stars = Math.round(item.rating);
            if (stars >= 1 && stars <= 5) {
                // Map 5 -> index 0, 1 -> index 4
                dist[5 - stars]++;
            }
        });

        setStats({ total, average, distribution: dist });
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading reviews...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.heading}>
                <span>Customer Feedback</span>
                {/* <a href="#" style={{ color: '#f68b1e', fontSize: '0.9rem', textDecoration: 'none' }}>See All &gt;</a> */}
            </div>

            <div className={styles.grid}>
                {/* Left: Summary */}
                <div className={styles.summaryCard}>
                    <div className={styles.averageSection}>
                        <div className={styles.verifiedText}>VERIFIED RATINGS ({stats.total})</div>
                        <div className={styles.scoreBox}>
                            <div className={styles.bigScore}>{stats.average}/5</div>
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={20}
                                        fill={i < Math.round(stats.average) ? "#f68b1e" : "#e0e0e0"}
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                            <div className={styles.totalRatings}>{stats.total} verified ratings</div>
                        </div>
                    </div>

                    <div className={styles.barList}>
                        {[5, 4, 3, 2, 1].map((stars, idx) => {
                            const count = stats.distribution[idx];
                            const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={stars} className={styles.barRow}>
                                    <span className={styles.starLabel}>{stars} <Star size={10} fill="#f68b1e" strokeWidth={0} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
                                    <div className={styles.progressTrack}>
                                        <div className={styles.progressBar} style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <span className={styles.countLabel}>({count})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: List */}
                <div className={styles.reviewsList}>
                    <div className={styles.verifiedText}>PRODUCT REVIEWS ({stats.total})</div>
                    {reviews.map(review => (
                        <div key={review.id} className={styles.reviewItem}>
                            <div className={styles.reviewStars}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < review.rating ? "#f68b1e" : "#e0e0e0"}
                                        strokeWidth={0}
                                    />
                                ))}
                            </div>
                            {/* <div className={styles.reviewTitle}>{review.comment.substring(0, 30)}...</div> */}
                            <div className={styles.reviewTitle}>{review.comment.split(' ').slice(0, 4).join(' ')}</div>
                            <div className={styles.reviewBody}>{review.comment}</div>
                            <div className={styles.reviewMeta}>
                                {new Date(review.created_at).toLocaleDateString('en-GB').replace(/\//g, '-')} by <span className={styles.author}>{review.full_name || 'Anonymous'}</span>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && <p>No reviews yet.</p>}
                </div>
            </div>
        </div>
    );
}
