"use client";

import React from 'react';
import styles from './HeroSection.module.css';
import Sidebar from './Sidebar';

export default function HeroSection() {
    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.bannerContainer}>
                {/* Placeholder for Banner Image/Slider */}
                <div className={styles.bannerContent}>
                    <h2 className={styles.bannerTitle}>Big Sale Up To 50% Off</h2>
                    <button className={styles.bannerButton}>Shop Now</button>
                </div>
            </div>
        </div>
    );
}
