'use client';

import React from 'react';
import styles from './account.module.css';
import AccountSidebar from '@/components/AccountSidebar';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                <AccountSidebar />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
