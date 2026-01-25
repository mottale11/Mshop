'use client';

import React, { useEffect, useState } from 'react';
import styles from './messages.module.css';
import { Bell, Package, Tag, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Notification = {
    id: number;
    type: 'order' | 'promo' | 'system';
    title: string;
    message: string;
    created_at: string;
    read: boolean;
};

export default function MessagesPage() {
    const [messages, setMessages] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data, error } = await supabase
                        .from('notifications')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    if (data) setMessages(data as Notification[]);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package size={20} className={styles.iconOrder} />;
            case 'promo': return <Tag size={20} className={styles.iconPromo} />;
            default: return <Info size={20} className={styles.iconSystem} />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 172800) return 'Yesterday';
        return date.toLocaleDateString();
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
                {loading ? (
                    <div className={styles.loading}>Loading messages...</div>
                ) : messages.length === 0 ? (
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
                                    <span className={styles.date}>{formatDate(msg.created_at)}</span>
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
