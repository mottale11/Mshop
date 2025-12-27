'use client';

import { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    shipping_address: any;
    payment_method: string;
    profiles: {
        first_name: string;
        last_name: string;
        email: string;
    } | null;
}

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

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, total_amount, status, created_at, shipping_address, payment_method,
                profiles:user_id (first_name, last_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', JSON.stringify(error, null, 2));
            alert('Error fetching orders. Check console for details.');
        } else {
            setOrders(data as any || []);
        }
        setLoading(false);
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            alert('Failed to update status');
        } else {
            fetchOrders(); // Refresh list
        }
    };

    const handleViewOrder = async (order: Order) => {
        setSelectedOrder(order);
        setLoadingDetails(true);

        const { data, error } = await supabase
            .from('order_items')
            .select(`
                id, product_id, quantity, price,
                products (title, image_url)
            `)
            .eq('order_id', order.id);

        if (error) {
            console.error('Error fetching details:', error);
            alert('Failed to load order details');
        } else {
            setOrderItems(data as any || []);
        }
        setLoadingDetails(false);
    };

    const closeOrderDetails = () => {
        setSelectedOrder(null);
        setOrderItems([]);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Delivered': return { bg: '#dcfce7', color: '#166534' };
            case 'Processing': return { bg: '#fef9c3', color: '#854d0e' };
            case 'Pending': return { bg: '#fee2e2', color: '#991b1b' };
            case 'Cancelled': return { bg: '#f3f4f6', color: '#6b7280' };
            default: return { bg: '#e5e7eb', color: '#374151' };
        }
    };

    // Format date properly
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }

    // Get customer name safely
    const getCustomerName = (order: Order) => {
        if (order.profiles?.first_name) {
            return `${order.profiles.first_name} ${order.profiles.last_name || ''}`;
        }
        return order.profiles?.email || 'Unknown User';
    }

    if (loading) return <div style={{ padding: '2rem' }}>Loading orders...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Orders Management</h1>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Order ID</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Customer</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Date</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Status</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Total</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {orders.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No orders found</td></tr>
                        ) : (
                            orders.map((order) => {
                                const statusStyle = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500', fontFamily: 'monospace' }}>{order.id.slice(0, 8)}...</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{getCustomerName(order)}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>{formatDate(order.created_at)}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                    {order.status}
                                                </span>
                                                {/* Status Changer */}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    style={{ fontSize: '0.8rem', padding: '0.2rem', borderColor: '#e5e7eb' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>KSh {order.total_amount.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button
                                                style={{ padding: '0.25rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
                                                title="View Details"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '90%', maxWidth: '800px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }}>
                        <button
                            onClick={closeOrderDetails}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="#6b7280" />
                        </button>

                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', paddingRight: '2rem' }}>
                            Order Details #{selectedOrder.id.slice(0, 8).toUpperCase()}
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111' }}>Customer & Order Info</h3>
                                <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Name:</span> <strong>{getCustomerName(selectedOrder)}</strong></div>
                                <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Date:</span> <strong>{formatDate(selectedOrder.created_at)}</strong></div>
                                <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Status:</span> <strong>{selectedOrder.status}</strong></div>
                                <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Payment:</span> <strong style={{ textTransform: 'uppercase' }}>{selectedOrder.payment_method || 'N/A'}</strong>
                                    {selectedOrder.payment_method !== 'cod' ? <span style={{ color: 'green', marginLeft: '0.5rem', fontSize: '0.8em', border: '1px solid green', padding: '0 0.3rem', borderRadius: '4px' }}>PAID</span> : <span style={{ color: 'orange', marginLeft: '0.5rem', fontSize: '0.8em', border: '1px solid orange', padding: '0 0.3rem', borderRadius: '4px' }}>PENDING PAYMENT</span>}
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#111' }}>Delivery Details</h3>
                                {selectedOrder.shipping_address ? (
                                    <>
                                        <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Contact Name:</span> <strong>{selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}</strong></div>
                                        <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Phone:</span> <strong>{selectedOrder.shipping_address.phone}</strong></div>
                                        <div style={{ marginBottom: '0.5rem' }}><span style={{ color: '#6b7280' }}>Address:</span> <strong>{selectedOrder.shipping_address.address}, {selectedOrder.shipping_address.city}</strong></div>
                                    </>
                                ) : (
                                    <div style={{ color: '#9ca3af' }}>No shipping details available</div>
                                )}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Items</h3>

                        {loadingDetails ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading details...</div>
                        ) : (
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: '#f9fafb' }}>
                                        <tr>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Product</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Price</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Qty</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{ width: '50px', height: '50px', borderRadius: '4px', backgroundColor: '#f3f4f6', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: '1px solid #eee' }}
                                                        onClick={() => item.products?.image_url && setPreviewImage(item.products.image_url)}
                                                        title="Click to enlarge"
                                                    >
                                                        {item.products?.image_url ? (
                                                            <img
                                                                src={item.products.image_url}
                                                                alt={item.products.title}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.7rem' }}>No Img</div>
                                                        )}
                                                    </div>
                                                    <span>{item.products?.title || 'Unknown Product'}</span>
                                                </td>
                                                <td style={{ padding: '0.75rem 1rem' }}>KSh {item.price.toLocaleString()}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{item.quantity}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>KSh {(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot style={{ backgroundColor: '#f9fafb', fontWeight: '600' }}>
                                        <tr>
                                            <td colSpan={3} style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total Amount:</td>
                                            <td style={{ padding: '0.75rem 1rem' }}>KSh {selectedOrder.total_amount.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button
                                onClick={closeOrderDetails}
                                style={{ padding: '0.5rem 1.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Lightbox */}
            {previewImage && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
                    onClick={() => setPreviewImage(null)}
                >
                    <img
                        src={previewImage}
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                        alt="Preview"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        onClick={() => setPreviewImage(null)}
                    >
                        <X size={32} />
                    </button>
                </div>
            )}
        </div>
    );
}
