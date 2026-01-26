'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/lib/supabase';
import styles from './checkout.module.css';
import { Plus, Check, Edit2, ChevronDown } from 'lucide-react';

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

import { kenyaLocations } from '@/data/kenyaLocations';

export default function CheckoutPage() {
    const { cart, clearCart } = useShop();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

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
        region: '', // Initialize empty to force selection
        city: '',
        isDefault: false
    });

    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [mounted, setMounted] = useState(false);

    // Get available cities based on selected region
    const availableCities = formData.region ? kenyaLocations[formData.region] || [] : [];

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        checkAuthAndFetchAddresses();
    }, []);

    const checkAuthAndFetchAddresses = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect if not authenticated
                router.push('/login?redirect=/checkout');
                return;
            }

            // Fetch addresses if user exists
            const { data } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (data && data.length > 0) {
                setAddresses(data);
                setSelectedAddressId(data[0].id); // Select default/first
                setShowAddForm(false);
            } else {
                setShowAddForm(true); // No addresses, show form
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingCost = 200;
    const total = subtotal + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let checked = false;
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Reset city if region changes
            if (name === 'region') {
                newData.city = '';
            }

            return newData;
        });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('user_addresses')
                .insert({
                    user_id: user.id,
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
                    is_default: formData.isDefault
                })
                .select()
                .single();

            if (error) throw error;

            // Refresh addresses and select new one
            await checkAuthAndFetchAddresses();
            setSelectedAddressId(data.id);
            setShowAddForm(false);

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                phonePrefix: '+254',
                phoneNumber: '',
                additionalPhonePrefix: '+254',
                additionalPhoneNumber: '',
                address: '',
                additionalInfo: '',
                region: 'Meru',
                city: '',
                isDefault: false
            });

        } catch (error: any) {
            console.error('Error saving address:', error);
            if (error.message === 'Not authenticated') {
                alert('Your session has expired. Please login again.');
                router.push('/login?redirect=/checkout');
            } else {
                alert('Failed to save address.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a shipping address.');
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in.');
                return;
            }

            const selectedAddress = addresses.find(a => a.id === selectedAddressId);

            // Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: 'Pending',
                    shipping_address: selectedAddress,
                    payment_method: paymentMethod
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.qty,
                price: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // Send Email (Mocked)
            await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ORDER_PLACED',
                    to: user.email,
                    order: { ...order, shipping_address: selectedAddress, payment_method: paymentMethod },
                    items: cart
                })
            });

            clearCart();
            router.push('/account/orders');

        } catch (error) {
            console.error('Checkout Error:', error);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    if (cart.length === 0) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Checkout</h1>
                <p>Your cart is empty.</p>
                <button onClick={() => router.push('/')} className={styles.placeOrderBtn} style={{ marginTop: '1rem', width: 'auto' }}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.grid}>
                {/* Left Column */}
                <div className={styles.forms}>

                    {/* 1. Address Section */}
                    <section className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className={styles.sectionTitle}>1. CUSTOMER ADDRESS</h2>
                        </div>

                        {!showAddForm && addresses.length > 0 ? (
                            <>
                                <div className={styles.addressList}>
                                    <h3 className={styles.subTitle}>ADDRESS BOOK ({addresses.length})</h3>
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.id}
                                            className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selected : ''}`}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                        >
                                            <div className={styles.radioWrapper}>
                                                <div className={styles.radioOuter}>
                                                    {selectedAddressId === addr.id && <div className={styles.radioInner} />}
                                                </div>
                                            </div>
                                            <div className={styles.addressDetails}>
                                                <div className={styles.addressHeader}>
                                                    <span className={styles.addressName}>{addr.first_name} {addr.last_name}</span>
                                                    <button className={styles.editBtn}>Edit <Edit2 size={12} /></button>
                                                </div>
                                                <p className={styles.addressText}>{addr.address} | {addr.city} - {addr.region}</p>
                                                <p className={styles.addressPhone}>{addr.phone_prefix} {addr.phone_number}</p>
                                                {addr.is_default && <span className={styles.defaultBadge}>DEFAULT ADDRESS</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className={styles.addAddressBtn} onClick={() => setShowAddForm(true)}>
                                    <Plus size={16} /> Add address
                                </button>
                            </>
                        ) : (
                            <div className={styles.formContainer}>
                                <h3 className={styles.subTitle}>ADD NEW ADDRESS</h3>
                                <form onSubmit={handleSaveAddress} className={styles.form}>
                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>First Name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Last Name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Prefix</label>
                                            <input
                                                type="text"
                                                name="phonePrefix"
                                                value={formData.phonePrefix}
                                                onChange={handleInputChange}
                                                className={styles.input} // Disabled style if needed
                                                readOnly
                                            />
                                        </div>
                                        <div className={styles.inputGroup} style={{ flex: 2 }}>
                                            <label className={styles.label}>Phone Number</label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="700 000000"
                                                className={styles.input}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Prefix</label>
                                            <input
                                                type="text"
                                                name="additionalPhonePrefix"
                                                value={formData.additionalPhonePrefix}
                                                onChange={handleInputChange}
                                                className={styles.input}
                                                readOnly
                                            />
                                        </div>
                                        <div className={styles.inputGroup} style={{ flex: 2 }}>
                                            <label className={styles.label}>Additional Phone Number</label>
                                            <input
                                                type="text"
                                                name="additionalPhoneNumber"
                                                value={formData.additionalPhoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter your Additional Phone Number"
                                                className={styles.input}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your Address"
                                            className={styles.input}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Additional Information</label>
                                        <input
                                            type="text"
                                            name="additionalInfo"
                                            value={formData.additionalInfo}
                                            onChange={handleInputChange}
                                            placeholder="Enter Additional Information"
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>Region</label>
                                            <select
                                                name="region"
                                                value={formData.region}
                                                onChange={handleInputChange}
                                                className={styles.select}
                                            >
                                                <option value="">Select Region</option>
                                                {Object.keys(kenyaLocations).sort().map(region => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.label}>City</label>
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className={styles.select}
                                                required
                                                disabled={!formData.region}
                                            >
                                                <option value="">Select City</option>
                                                {availableCities.sort().map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleInputChange}
                                            id="set-default"
                                        />
                                        <label htmlFor="set-default">Set as Default Address</label>
                                    </div>

                                    <div className={styles.formActions}>
                                        {addresses.length > 0 && (
                                            <button type="button" className={styles.cancelBtn} onClick={() => setShowAddForm(false)}>
                                                Cancel
                                            </button>
                                        )}
                                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </section>

                    {/* 2. Payment Method */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Payment Method</h2>
                        <div className={styles.paymentOptions}>
                            <div className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="payment"
                                    id="mpesa"
                                    value="mpesa"
                                    checked={paymentMethod === 'mpesa'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="mpesa">M-Pesa</label>
                            </div>
                            <div className={styles.paymentOption}>
                                <input
                                    type="radio"
                                    name="payment"
                                    id="cod"
                                    value="cod"
                                    checked={paymentMethod === 'cod'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="cod">Cash on Delivery</label>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <div className={styles.summaryItems}>
                        {cart.map((item) => (
                            <div key={item.id} className={styles.summaryItem}>
                                <span style={{ flex: 1 }}>{item.title} x {item.qty}</span>
                                <span>KSh {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.summaryDivider}></div>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>KSh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Shipping</span>
                        <span>KSh {shippingCost.toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryDivider}></div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>KSh {total.toLocaleString()}</span>
                    </div>

                    <button
                        className={styles.placeOrderBtn}
                        onClick={handlePlaceOrder}
                        disabled={loading || showAddForm || !selectedAddressId}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
