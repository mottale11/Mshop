'use client';

import React from 'react';
import styles from '../account.module.css';

export default function OrdersPage() {
    const orders = [
        { id: '#ORD-3921', date: 'Dec 12, 2024', status: 'Delivered', total: 120.00, items: ['Wireless Headphones'] },
        { id: '#ORD-3110', date: 'Nov 28, 2024', status: 'Processing', total: 45.00, items: ['Phone Case', 'Screen Protector'] },
    ];

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>My Orders</h2>
            <div className={styles.ordersList}>
                {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <div>
                                <span className={styles.orderId}>{order.id}</span>
                                <span className={styles.orderDate}>{order.date}</span>
                            </div>
                            <span className={`${styles.status} ${styles[order.status.toLowerCase()]}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className={styles.orderItems}>
                            {order.items.join(', ')}
                        </div>
                        <div className={styles.orderFooter}>
                            <span className={styles.totalLabel}>Total:</span>
                            <span className={styles.totalValue}>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
