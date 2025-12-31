'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star } from 'lucide-react';
import styles from './FilterSidebar.module.css';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [rating, setRating] = useState(searchParams.get('rating') || '');

    // Update state when URL changes (e.g. clear filters)
    useEffect(() => {
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setRating(searchParams.get('rating') || '');
    }, [searchParams]);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        if (rating) params.set('rating', rating);
        else params.delete('rating');

        params.delete('page'); // Reset to page 1 on filter change

        router.push(`?${params.toString()}`);
    };

    const handleRatingChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === rating) {
            // Toggle off if already selected
            params.delete('rating');
            setRating('');
        } else {
            params.set('rating', val);
            setRating(val);
        }
        params.delete('page');
        router.push(`?${params.toString()}`);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.title}>Filters</div>

            {/* Price Range */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Price Range</div>
                <div className={styles.inputGroup}>
                    <input
                        type="number"
                        placeholder="Min"
                        className={styles.input}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        min="0"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className={styles.input}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        min="0"
                    />
                </div>
                <button className={styles.button} onClick={applyFilters}>
                    Apply
                </button>
            </div>

            {/* Rating */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Rating</div>
                <ul className={styles.ratingList}>
                    {[4, 3, 2, 1].map((r) => (
                        <li key={r}
                            className={styles.ratingItem}
                            onClick={() => handleRatingChange(r.toString())}
                        >
                            <input
                                type="radio"
                                name="rating"
                                checked={rating === r.toString()}
                                readOnly
                                className={styles.radio}
                            />
                            <div style={{ display: 'flex', color: '#f68b1e' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={i < r ? '#f68b1e' : 'none'}
                                        color={i < r ? '#f68b1e' : '#ccc'}
                                    />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>& Up</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Clear Filters */}
            {(minPrice || maxPrice || rating) && (
                <button
                    className={styles.button}
                    style={{ backgroundColor: '#fff', color: '#666', border: '1px solid #ddd' }}
                    onClick={() => {
                        router.push(window.location.pathname + (searchParams.get('q') ? `?q=${searchParams.get('q')}` : ''));
                    }}
                >
                    Clear All
                </button>
            )}
        </aside>
    );
}
