"use client";

import React, { useEffect, useState } from 'react';
import { Home, Grid, MessageSquare, ShoppingCart, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function BottomNav() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('read', false);

                if (!error && count !== null) {
                    setUnreadCount(count);
                }
            }
        };

        fetchUnread();

        // Optional: Realtime subscription could go here
    }, []);

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
            <Link href="/messages" className={styles.navItem} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                    <MessageSquare size={24} />
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </div>
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
