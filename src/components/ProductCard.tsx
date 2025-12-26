"use client";

import React from 'react';
import { Star } from 'lucide-react';
import styles from './ProductCard.module.css';
import Link from 'next/link';

interface ProductCardProps {
    id: number | string;
    image: string;
    title: string;
    price: number;
    oldPrice?: number;
    rating?: number;
    reviews?: number;
    discount?: number;
}

export default function ProductCard({ id, image, title, price, oldPrice, rating, reviews, discount }: ProductCardProps) {
    return (
        <Link href={`/product/${id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {image ? (
                    <img src={image} alt={title} className={styles.image} />
                ) : (
                    <div className={styles.image} style={{ backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span>Image</span>
                    </div>
                )}
                {discount && <span className={styles.discountBadge}>-{discount}%</span>}
            </div>
            <div className={styles.details}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.priceRow}>
                    <span className={styles.price}>KSh {price.toLocaleString()}</span>
                    {oldPrice && <span className={styles.oldPrice}>KSh {oldPrice.toLocaleString()}</span>}
                </div>
                <div className={styles.rating}>
                    <Star size={12} fill="#f68b1e" strokeWidth={0} />
                    <span>{rating || 0} ({reviews || 0})</span>
                </div>
            </div>
        </Link>
    );
}
