'use client';

import React, { useState, useEffect } from 'react';
import styles from '../account.module.css'; // Reusing account styles
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { kenyaLocations } from '@/data/kenyaLocations';

interface Address {
    id: string;
    first_name: string;
    last_name: string;
    phone_prefix: string;
    phone_number: string;
    additional_phone_prefix?: string;
    additional_phone_number?: string;
    address: string;
    additional_info?: string;
    city: string;
    region: string;
    is_default: boolean;
}

export default function AddressesPage() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phonePrefix: '+254',
        phoneNumber: '',
        additionalPhonePrefix: '+254',
        additionalPhoneNumber: '',
        address: '',
        additionalInfo: '',
        region: '',
        city: '',
        isDefault: false
    });

    const availableCities = formData.region ? kenyaLocations[formData.region] || [] : [];

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const { data } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user?.id)
                .order('is_default', { ascending: false });

            if (data) setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let checked = false;
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'region') newData.city = '';
            return newData;
        });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.from('user_addresses').insert({
                user_id: user?.id,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone_prefix: formData.phonePrefix,
                phone_number: formData.phoneNumber,
                additional_phone_prefix: formData.additionalPhonePrefix,
                additional_phone_number: formData.additionalPhoneNumber,
                address: formData.address,
                additional_info: formData.additionalInfo,
                region: formData.region,
                city: formData.city,
                is_default: formData.isDefault || addresses.length === 0 // Make default if it's the first one
            });

            if (error) throw error;

            await fetchAddresses();
            setShowForm(false);
            setFormData({
                firstName: '', lastName: '', phonePrefix: '+254', phoneNumber: '',
                additionalPhonePrefix: '+254', additionalPhoneNumber: '',
                address: '', additionalInfo: '', region: '', city: '', isDefault: false
            });
            alert('Address added successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await supabase.from('user_addresses').delete().eq('id', id);
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            // First set all to false
            await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user?.id);
            // Set selected to true
            await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.headerRow}>
                <h2 className={styles.sectionTitle}>Address Book</h2>
                {!showForm && (
                    <button className={styles.addBtn} onClick={() => setShowForm(true)}>
                        <Plus size={16} /> Add New Address
                    </button>
                )}
            </div>

            {showForm ? (
                <div className={styles.formContainer}>
                    <h3 className={styles.subTitle}>Add New Address</h3>
                    <form onSubmit={handleSaveAddress} className={styles.settingsForm}>
                        {/* Reuse styles from account.module or duplicate structure */}
                        <div className={styles.nameRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} className={styles.input} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Last Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} className={styles.input} required />
                            </div>
                        </div>

                        <div className={styles.nameRow}>
                            <div className={styles.formGroup} style={{ flex: 1 }}>
                                <label className={styles.label}>Prefix</label>
                                <input name="phonePrefix" value={formData.phonePrefix} readOnly className={styles.input} />
                            </div>
                            <div className={styles.formGroup} style={{ flex: 3 }}>
                                <label className={styles.label}>Phone Number</label>
                                <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className={styles.input} required />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Address</label>
                            <input name="address" value={formData.address} onChange={handleInputChange} className={styles.input} required />
                        </div>

                        <div className={styles.nameRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Region</label>
                                <select name="region" value={formData.region} onChange={handleInputChange} className={styles.input}>
                                    <option value="">Select Region</option>
                                    {Object.keys(kenyaLocations).sort().map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>City</label>
                                <select name="city" value={formData.city} onChange={handleInputChange} className={styles.input} required disabled={!formData.region}>
                                    <option value="">Select City</option>
                                    {availableCities.sort().map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ gap: '1rem', display: 'flex', marginTop: '1rem' }}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={styles.submitBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={styles.addressGrid}>
                    {loading ? <p>Loading addresses...</p> : addresses.length === 0 ? (
                        <p>No addresses found.</p>
                    ) : (
                        addresses.map(addr => (
                            <div key={addr.id} className={`${styles.addressCard} ${addr.is_default ? styles.defaultCard : ''}`}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardName}>{addr.first_name} {addr.last_name}</span>
                                    {addr.is_default && <span className={styles.defaultBadge}>Default</span>}
                                </div>
                                <p className={styles.addressText}>
                                    {addr.address}<br />
                                    {addr.city}, {addr.region}<br />
                                    {addr.phone_prefix} {addr.phone_number}
                                </p>
                                <div className={styles.cardActions}>
                                    {!addr.is_default && (
                                        <button className={styles.actionBtn} onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                                    )}
                                    <button className={styles.deleteBtn} onClick={() => handleDelete(addr.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </section>
    );
}
