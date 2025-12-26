"use client";

import React from 'react';
import styles from './FlashSale.module.css';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

import { useFlashTimer } from '@/hooks/useFlashTimer';

interface FlashSaleProps {
    products?: any[]; // Replace 'any' with Product interface if shared
}

export default function FlashSale({ products = [] }: FlashSaleProps) {
    const timeLeft = useFlashTimer();

    // If no products, we can hide the section or show a message. 
    // For now, if empty, we won't render the list but maybe keep the header?
    // Let's render what we have.


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <Zap size={24} fill="yellow" stroke="none" />
                    <span className={styles.title}>Flash Sale</span>
                    <span className={styles.timer}>{timeLeft}</span>
                </div>
                <Link href="/flash-sale" className={styles.seeAll}>SEE ALL &gt;</Link>
            </div>
            <div className={styles.scrollContainer}>
                {products.map((product) => (
                    <div key={product.flash_sale_id || product.id} style={{ minWidth: '160px' }}>
                        <ProductCard {...product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
