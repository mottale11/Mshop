'use client';

import React, { useEffect, useState } from 'react';
import styles from '../account.module.css';
import { supabase } from '@/lib/supabase';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
        title: string;
    } | null;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    order_items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        total_amount,
                        status,
                        order_items (
                            id,
                            product_id,
                            quantity,
                            price,
                            products (
                                title
                            )
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                } else {
                    setOrders(data as any);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>My Orders</h2>
                <p>You haven't placed any orders yet.</p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>My Orders</h2>
            <div className={styles.ordersList}>
                {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                            <div>
                                <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                <span className={styles.orderDate}>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <span className={`${styles.status} ${styles[order.status.toLowerCase()] || ''}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className={styles.orderItems}>
                            {order.order_items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    <span>{item.products?.title || 'Unknown Product'} x {item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.orderFooter}>
                            <span className={styles.totalLabel}>Total:</span>
                            <span className={styles.totalValue}>KSh {order.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
