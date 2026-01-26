'use client';

import React, { useState, useEffect } from 'react';
import styles from '../account.module.css';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Address {
    id: string;
    first_name: string;
    last_name: string;
    phone_prefix: string;
    phone_number: string;
    address: string;
    city: string;
    region: string;
    is_default: boolean;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState<Address | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchDefaultAddress();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('first_name, last_name, phone')
                .eq('id', user?.id)
                .single();

            if (data) {
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setPhone(data.phone || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchDefaultAddress = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false })
                    .limit(1)
                    .single();

                if (data) {
                    setAddress(data);
                }
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    email: user?.email // Ensure email is kept/set
                });

            if (error) throw error;

            // Also update auth metadata for faster header access if needed, though profile table is primary
            await supabase.auth.updateUser({
                data: { first_name: firstName, last_name: lastName }
            });

            alert("Settings saved successfully!");
        } catch (error) {
            console.error('Error saving settings:', error);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <form onSubmit={handleSave} className={styles.settingsForm}>
                <div className={styles.nameRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 700 000000"
                        className={styles.input}
                    />
                </div>

                {/* Address Book Card Section */}
                <div className={styles.formGroup}>
                    <div className={styles.addressBookHeader}>
                        <label className={styles.label} style={{ marginBottom: 0 }}>ADDRESS BOOK</label>
                        <Link href="/account/addresses" className={styles.editLink}>
                            <Edit2 size={16} />
                        </Link>
                    </div>

                    <div className={styles.addressCard}>
                        {loadingAddress ? (
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading address...</p>
                        ) : address ? (
                            <>
                                <h3 className={styles.addressTitle}>Your default shipping address:</h3>
                                <p className={styles.addressText}>
                                    {address.first_name} {address.last_name}<br />
                                    {address.address}<br />
                                    {address.city}, {address.region}<br />
                                    {address.phone_prefix} {address.phone_number}
                                </p>
                            </>
                        ) : (
                            <div>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    No default address set.
                                </p>
                                <Link href="/account/addresses" className={styles.addAddressLink}>
                                    + Add New Address
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </section>
    );
}
