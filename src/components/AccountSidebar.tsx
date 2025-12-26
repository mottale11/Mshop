'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Settings, LogOut } from 'lucide-react';
import styles from '../app/account/account.module.css';
import { useAuth } from './AuthProvider';

export default function AccountSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.userInfo}>
                <div className={styles.avatar}>
                    {user?.user_metadata.first_name ? user.user_metadata.first_name[0].toUpperCase() : 'U'}
                </div>
                <div className={styles.userDetails}>
                    <p className={styles.userName}>{user?.user_metadata.first_name} {user?.user_metadata.last_name}</p>
                    <p className={styles.userEmail}>{user?.email}</p>
                </div>
            </div>
            <nav className={styles.nav}>
                <Link
                    href="/account/orders"
                    className={`${styles.navItem} ${pathname === '/account/orders' || pathname === '/account' ? styles.active : ''}`}
                >
                    <Package size={20} /> Orders
                </Link>
                <Link
                    href="/account/settings"
                    className={`${styles.navItem} ${pathname === '/account/settings' ? styles.active : ''}`}
                >
                    <Settings size={20} /> Settings
                </Link>
                <button
                    onClick={() => signOut()}
                    className={`${styles.navItem} ${styles.logout}`}
                >
                    <LogOut size={20} /> Log Out
                </button>
            </nav>
        </aside>
    );
}
