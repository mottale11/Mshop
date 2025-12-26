'use client';

import React from 'react';
import { Zap, Clock } from 'lucide-react';
import { useFlashTimer } from '@/hooks/useFlashTimer';
import styles from '@/app/flash-sale/flash-sale.module.css';

export default function FlashSaleBanner() {
    const timeLeft = useFlashTimer();

    return (
        <div className={styles.banner}>
            <div className={styles.bannerContent}>
                <div className={styles.titleRow}>
                    <Zap size={32} fill="yellow" stroke="none" />
                    <h1 className={styles.title}>Flash Sale</h1>
                </div>
                <p className={styles.subtitle}>Limited time offers! Grab them before they're gone.</p>
            </div>
            <div className={styles.timerBlock}>
                <span className={styles.timerLabel}>Ends in:</span>
                <div className={styles.timer}>
                    <Clock size={20} className={styles.timerIcon} />
                    <span>{timeLeft}</span>
                </div>
            </div>
        </div>
    );
}
