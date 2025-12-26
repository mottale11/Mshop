'use client';

import { Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    orders: number;
    spent: number;
    joinDate: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // 2. Fetch All Orders (for aggregation)
            // Note: For a large app, this should be done via a SQL View or RPC to avoid fetching all orders.
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('user_id, total_amount');

            if (ordersError) throw ordersError;

            // 3. Aggregate Data
            const customersData = profiles.map((profile: any) => {
                const userOrders = orders?.filter((o: any) => o.user_id === profile.id) || [];
                const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (Number(order.total_amount) || 0), 0);

                return {
                    id: profile.id,
                    name: (profile.first_name || profile.last_name)
                        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                        : 'Unknown User',
                    email: profile.email || 'No Email',
                    phone: 'N/A', // Phone not currently in profiles table
                    orders: userOrders.length,
                    spent: totalSpent,
                    joinDate: new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                };
            });

            setCustomers(customersData);

        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Customers</h1>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Customer</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Contact</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Total Orders</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Total Spent</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Join Date</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Loading customers...</td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No customers found.</td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                                                {customer.name.charAt(0) || '?'}
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#111827' }}>{customer.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                                <Mail size={14} color="#9ca3af" />
                                                <span>{customer.email}</span>
                                            </div>
                                            {/* Phone is N/A for now */}
                                            {/* <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                                                <Phone size={14} color="#9ca3af" />
                                                <span>{customer.phone}</span>
                                            </div> */}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{customer.orders}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>KSh {customer.spent.toLocaleString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{customer.joinDate}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
