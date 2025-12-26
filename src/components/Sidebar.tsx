"use client";

import React from 'react';
import { Smartphone, Shirt, Home, Watch, Zap, Gift, Baby, Monitor } from 'lucide-react';
import styles from './Sidebar.module.css';

const categories = [
    { name: 'Phones & Tablets', icon: Smartphone },
    { name: 'Fashion', icon: Shirt },
    { name: 'Home & Office', icon: Home },
    { name: 'Computing', icon: Monitor },
    { name: 'Electronics', icon: Zap },
    { name: 'Health & Beauty', icon: Gift },
    { name: 'Baby Products', icon: Baby },
    { name: 'Watches', icon: Watch },
];

export default function Sidebar() {
    return (
        <div className={styles.sidebar}>
            {categories.map((cat, index) => (
                <div key={index} className={styles.item}>
                    <cat.icon size={18} />
                    <span>{cat.name}</span>
                </div>
            ))}
        </div>
    );
}
