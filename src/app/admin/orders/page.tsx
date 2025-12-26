'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    profiles: {
        first_name: string;
        last_name: string;
        email: string;
    } | null;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, total_amount, status, created_at,
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
                                        <td style={{ padding: '1rem 1.5rem' }}>${order.total_amount.toFixed(2)}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button style={{ padding: '0.25rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }} title="View Details">
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
        </div>
    );
}
