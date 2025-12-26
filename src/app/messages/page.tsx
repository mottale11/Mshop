'use client';

import React from 'react';
import styles from './messages.module.css';
import { Bell, Package, Tag, Info } from 'lucide-react';

export default function MessagesPage() {
    // Mock messages
    const messages = [
        {
            id: 1,
            type: 'order',
            title: 'Order Delivered',
            message: 'Your order #12345 has been successfully delivered. Enjoy your purchase!',
            date: '2 hours ago',
            read: false,
        },
        {
            id: 2,
            type: 'promo',
            title: 'Flash Sale Alert!',
            message: 'Don\'t miss out on our 50% off flash sale starting in 1 hour.',
            date: 'Yesterday',
            read: true,
        },
        {
            id: 3,
            type: 'system',
            title: 'Account Update',
            message: 'Your password was successfully changed.',
            date: '2 days ago',
            read: true,
        },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package size={20} className={styles.iconOrder} />;
            case 'promo': return <Tag size={20} className={styles.iconPromo} />;
            default: return <Info size={20} className={styles.iconSystem} />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Messages & Notifications</h1>
                <span className={styles.badge}>
                    {messages.filter(m => !m.read).length} new
                </span>
            </div>

            <div className={styles.list}>
                {messages.length === 0 ? (
                    <div className={styles.empty}>
                        <Bell size={48} color="#9ca3af" />
                        <p>No new messages</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`${styles.messageCard} ${!msg.read ? styles.unread : ''}`}>
                            <div className={styles.iconWrapper}>
                                {getIcon(msg.type)}
                            </div>
                            <div className={styles.content}>
                                <div className={styles.row}>
                                    <h3 className={styles.msgTitle}>{msg.title}</h3>
                                    <span className={styles.date}>{msg.date}</span>
                                </div>
                                <p className={styles.msgBody}>{msg.message}</p>
                            </div>
                            {!msg.read && <div className={styles.dot}></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
