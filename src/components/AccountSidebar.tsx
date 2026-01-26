'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Settings, LogOut, LogIn } from 'lucide-react';
import styles from '../app/account/account.module.css';
import { useAuth } from './AuthProvider';

export default function AccountSidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.userInfo}>
                <div className={styles.avatar}>
                    {user?.user_metadata.first_name ? user.user_metadata.first_name[0].toUpperCase() : 'G'}
                </div>
                <div className={styles.userDetails}>
                    <p className={styles.userName}>
                        {user ? `${user.user_metadata.first_name || ''} ${user.user_metadata.last_name || ''}` : 'Guest User'}
                    </p>
                    <p className={styles.userEmail}>{user?.email || 'Please login to manage account'}</p>
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

                {user ? (
                    <button
                        onClick={() => signOut()}
                        className={`${styles.navItem} ${styles.logout}`}
                    >
                        <LogOut size={20} /> Log Out
                    </button>
                ) : (
                    <Link
                        href={`/login?redirect=${encodeURIComponent(pathname)}`}
                        className={`${styles.navItem} ${styles.logout}`} // Reusing logout style for consistency or can add specific login style
                    >
                        <LogIn size={20} /> Login
                    </Link>
                )}
            </nav>
        </aside>
    );
}
