'use client';

import React, { useState } from 'react';
import styles from '../account.module.css';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
    const { user } = useAuth();
    const [firstName, setFirstName] = useState(user?.user_metadata.first_name || '');
    const [lastName, setLastName] = useState(user?.user_metadata.last_name || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Settings saved! (This is a mock)");
        // In real app, call supabase.auth.updateUser or update profiles table
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem', maxWidth: '500px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6', color: '#6b7280' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 700 000000"
                        style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Delivery Address</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        rows={3}
                        style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        backgroundColor: '#f68b1e',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    Save Changes
                </button>
            </form>
        </section>
    );
}
