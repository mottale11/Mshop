'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Check session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // router.push('/login'); // Optional: redirect if not logged in
            }

            // Parallel Data Fetching
            const salesPromise = supabase.from('orders').select('total_amount').neq('status', 'Cancelled');
            const ordersCountPromise = supabase.from('orders').select('*', { count: 'exact', head: true });
            // For customers, counting unique users in orders or profiles with generic query
            const customersCountPromise = supabase.from('profiles').select('*', { count: 'exact', head: true }); // Removed .eq('role', 'customer') incase role is missing

            const recentOrdersPromise = supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (first_name, last_name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(5);

            const [salesResult, ordersCountResult, customersCountResult, recentOrdersResult] = await Promise.all([
                salesPromise,
                ordersCountPromise,
                customersCountPromise,
                recentOrdersPromise
            ]);

            // Calculate Total Sales (Sum of non-cancelled orders)
            const totalSales = salesResult.data?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
            const totalOrders = ordersCountResult.count || 0;
            const totalCustomers = customersCountResult.count || 0;
            const recentOrdersData = recentOrdersResult.data || [];

            setStats({
                totalSales,
                totalOrders,
                totalCustomers
            });
            setRecentOrders(recentOrdersData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Dashboard Overview</h1>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Card 1: Total Sales */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total Sales</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>
                                KSh {stats.totalSales.toLocaleString()}
                            </h3>
                        </div>
                        <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', borderRadius: '0.375rem', color: '#10b981' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                {/* Card 2: Total Orders */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total Orders</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>
                                {stats.totalOrders}
                            </h3>
                        </div>
                        <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem', color: '#3b82f6' }}>
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                </div>

                {/* Card 3: Total Customers */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>Total Customers</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '0.25rem' }}>
                                {stats.totalCustomers}
                            </h3>
                        </div>
                        <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', borderRadius: '0.375rem', color: '#d97706' }}>
                            <Users size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <section style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Recent Orders</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Order ID</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Customer</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Date</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                            {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {/* Handle joined profiles data safely */}
                                        {order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || order.profiles.email : 'Unknown'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: order.status === 'Delivered' ? '#dcfce7' :
                                                order.status === 'Pending' ? '#fee2e2' : '#eff6ff',
                                            color: order.status === 'Delivered' ? '#166534' :
                                                order.status === 'Pending' ? '#991b1b' : '#3b82f6'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>KSh {order.total_amount.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No recent orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
