"use client";

import React from 'react';
import { Home, Grid, MessageSquare, ShoppingCart, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import Link from 'next/link';

export default function BottomNav() {
    return (
        <nav className={styles.bottomNav}>
            <Link href="/" className={`${styles.navItem} ${styles.active}`}>
                <Home size={24} />
                <span>Home</span>
            </Link>
            <Link href="/categories" className={styles.navItem}>
                <Grid size={24} />
                <span>Categories</span>
            </Link>
            <Link href="/messages" className={styles.navItem}>
                <MessageSquare size={24} />
                <span>Messages</span>
            </Link>
            <Link href="/cart" className={styles.navItem}>
                <ShoppingCart size={24} />
                <span>Cart</span>
            </Link>
            <Link href="/account" className={styles.navItem}>
                <User size={24} />
                <span>Account</span>
            </Link>
        </nav>
    );
}
