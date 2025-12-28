'use client';

import React, { useEffect, useState } from 'react';
import styles from '../account.module.css';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: {
        title: string;
        image_url: string;
    } | null;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    shipping_address: any;
    payment_method: string;
    order_items: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
                    shipping_address,
                    payment_method,
                    order_items (
                        id,
                        product_id,
                        quantity,
                        price,
                        products (
                            title,
                            image_url
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

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleRefund = async (orderId: string) => {
        const confirm = window.confirm('Are you sure you want to request a refund for this order?');
        if (!confirm) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'Refund Requested' })
                .eq('id', orderId);

            if (error) throw error;

            alert('Refund request submitted successfully.');
            setSelectedOrder(null);
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error('Error requesting refund:', error);
            alert('Failed to submit refund request.');
        }
    };

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
                    <div
                        key={order.id}
                        className={styles.orderCard}
                        onClick={() => setSelectedOrder(order)}
                        style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    >
                        <div className={styles.orderHeader}>
                            <div>
                                <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                <span className={styles.orderDate}>
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <span className={`${styles.status} ${styles[order.status.toLowerCase().replace(' ', '')] || ''}`}>
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

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Order Details</h3>
                                <span className={styles.orderId}>#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <button className={styles.closeButton} onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalSection}>
                            <label className={styles.sectionLabel}>Items</label>
                            {selectedOrder.order_items.map(item => (
                                <div key={item.id} className={styles.productRow}>
                                    <img
                                        src={item.products?.image_url || '/placeholder.png'}
                                        alt={item.products?.title}
                                        className={styles.productImage}
                                    />
                                    <div className={styles.productInfo}>
                                        <div className={styles.productName}>{item.products?.title}</div>
                                        <div>Qty: {item.quantity} x KSh {item.price.toLocaleString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        KSh {(item.quantity * item.price).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.modalSection}>
                            <label className={styles.sectionLabel}>Shipping Address</label>
                            <div className={styles.detailItem}>
                                {selectedOrder.shipping_address ? (
                                    <>
                                        {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}<br />
                                        {selectedOrder.shipping_address.address}<br />
                                        {selectedOrder.shipping_address.city}<br />
                                        {selectedOrder.shipping_address.phone}
                                    </>
                                ) : 'N/A'}
                            </div>
                        </div>

                        <div className={styles.modalSection}>
                            <label className={styles.sectionLabel}>Payment Method</label>
                            <div className={styles.detailItem} style={{ textTransform: 'capitalize' }}>
                                {selectedOrder.payment_method || 'N/A'}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold' }}>Total Amount</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f68b1e' }}>
                                KSh {selectedOrder.total_amount.toLocaleString()}
                            </span>
                        </div>

                        {selectedOrder.status === 'Delivered' ? (
                            <button className={styles.refundBtn} onClick={() => handleRefund(selectedOrder.id)}>
                                Request Refund
                            </button>
                        ) : selectedOrder.status === 'Refund Requested' ? (
                            <div className={styles.refundedStatus}>
                                Refund Requested
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </section>
    );
}
