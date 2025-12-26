'use client';

import { Bell, Search, Menu } from 'lucide-react';
import styles from '@/app/admin/admin.module.css';

export default function AdminHeader() {
    return (
        <header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Mobile Menu Button - functional implementation would require context or props */}
                <button className={styles.mobileMenuBtn} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}>
                    <Menu size={24} />
                </button>
                <span className={styles.pageTitle}>Overview</span>
            </div>

            <div className={styles.headerRight}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    <Search size={20} />
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', position: 'relative' }}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%'
                    }}></span>
                </button>
                <div className={styles.userProfile}>
                    <div className={styles.avatar}>A</div>
                    <span className={styles.userName}>Admin User</span>
                </div>
            </div>
        </header>
    );
}
