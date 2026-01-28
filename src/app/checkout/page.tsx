'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/lib/supabase';
import styles from './checkout.module.css';
import { Plus, Check, Edit2, ChevronDown, Smartphone } from 'lucide-react';
import mpesaLogo from '@/images/mpesa.png';
import visaLogo from '@/images/visa.jpeg';
import mastercardLogo from '@/images/Mastercard Logo.jpeg';

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
    const [processingMessage, setProcessingMessage] = useState('');
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

    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvc: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('mpesa'); // mpesa, cod, card
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
    const [mounted, setMounted] = useState(false);

    // Get available cities based on selected region
    const availableCities = formData.region ? kenyaLocations[formData.region] || [] : [];

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        checkAuthAndFetchAddresses();
    }, []);

    // Sync M-Pesa number with selected address
    useEffect(() => {
        if (selectedAddressId) {
            const address = addresses.find(a => a.id === selectedAddressId);
            if (address) {
                // Assuming address.phone_number is the local number (e.g. 712345678)
                setMpesaPhoneNumber(address.phone_number);
            }
        }
    }, [selectedAddressId, addresses]);

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

    // Calculate Shipping
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const shippingCost = cart.reduce((total, item) => {
        if (!selectedAddress) return total + 0; // No address selected = 0 or maintain fallback logic

        // Check for item-specific shipping rules
        if (item.shipping_fees && item.shipping_fees.length > 0) {
            // 1. Exact match (Region + City)
            const exactMatch = item.shipping_fees.find((r: any) =>
                r.county === selectedAddress.region &&
                r.town === selectedAddress.city
            );
            if (exactMatch) return total + Number(exactMatch.fee);

            // 2. Region match (Town is 'All' or empty)
            const regionMatch = item.shipping_fees.find((r: any) =>
                r.county === selectedAddress.region &&
                (!r.town || r.town === 'All')
            );
            if (regionMatch) return total + Number(regionMatch.fee);
        }

        // Fallback per item if no rule matches (e.g. 200 base)
        // Or 0 if you only want to charge for specific items.
        // Assuming strict "shipping fee for EACH product"
        return total + 0;
    }, 0);

    // If calculated shipping is 0 and we have items, maybe apply a global fallback?
    // For now, let's respect the rules. If no rule returns 0.

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

    const pollPaymentStatus = async (reference: string) => {
        const maxAttempts = 20; // 20 * 3s = 60s timeout
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const res = await fetch(`/api/payments/status?reference=${reference}`);
                const data = await res.json();

                if (data.success && data.data) {
                    const status = data.data.response.Status;
                    console.log('Payment Status:', status);

                    if (status === 'SUCCESS') {
                        return true;
                    } else if (status === 'FAILED') {
                        throw new Error(data.data.response.ResultDesc || 'Payment failed');
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        throw new Error('Payment timed out. Please try again.');
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select a shipping address.');
            return;
        }

        if (paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
                alert('Please enter your card details.');
                return;
            }
        }

        setLoading(true);
        setProcessingMessage('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in.');
                return;
            }

            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
            if (!selectedAddress) throw new Error("Address not found");

            // MPesa Flow
            if (paymentMethod === 'mpesa') {
                if (!mpesaPhoneNumber) {
                    alert('Please enter an M-Pesa phone number.');
                    setLoading(false);
                    return;
                }
                setProcessingMessage('Initiating M-Pesa payment... Check your phone.');

                // 1. Initiate STK Push
                const stkRes = await fetch('/api/payments/stk-push', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Combine prefix + number. Assuming prefix is +254.
                        phone_number: `254${mpesaPhoneNumber.replace(/^0|^254|\+/g, '')}`,
                        amount: Math.ceil(total),
                        order_id: `ORDER-${Date.now()}`
                    })
                });

                const stkData = await stkRes.json();
                if (!stkData.success) {
                    throw new Error(stkData.message || 'Failed to initiate payment');
                }

                setProcessingMessage('Payment initiated. Please enter your PIN on your phone...');

                // 2. Poll for status
                await pollPaymentStatus(stkData.data.TransactionReference);

                setProcessingMessage('Payment Successful! Creating order...');
            } else if (paymentMethod === 'card') {
                setProcessingMessage('Initiating Card Payment...');

                const cardRes = await fetch('/api/payments/payhero/card', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: Math.ceil(total),
                        reference: `ORDER-${Date.now()}`,
                        customer: {
                            firstName: user.user_metadata?.first_name || 'Guest',
                            lastName: user.user_metadata?.last_name || 'User',
                            email: user.email,
                            phone: `${selectedAddress.phone_prefix}${selectedAddress.phone_number}`,
                            address: selectedAddress.address,
                            city: selectedAddress.city,
                            state: selectedAddress.region,
                            country: 'KE'
                        }
                    })
                });

                const cardData = await cardRes.json();

                if (!cardData.success) {
                    throw new Error(cardData.message || 'Failed to initiate card payment');
                }

                // Inspect response to see if we need to redirect
                console.log('Card Payment Data:', cardData);

                if (cardData.data.response && cardData.data.response.payment_url) {
                    window.location.href = cardData.data.response.payment_url;
                    return; // specific return to stop further execution until callback
                } else if (cardData.data.redirect_url) {
                    window.location.href = cardData.data.redirect_url;
                    return;
                } else {
                    // If no redirect, assume success or instruction? 
                    // For now, let's proceed to order creation, but usually Cards need 3DS.
                    // If it's pure API without redirect, it might be pending.
                    setProcessingMessage('Payment initiated. Please check your email/phone for instructions if not redirected.');
                }
            }

            // Create Order (Database)
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: paymentMethod === 'mpesa' ? 'Paid' : 'Pending', // Mark as Paid if MPesa success
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

        } catch (error: any) {
            console.error('Checkout Error:', error);
            alert(error.message || 'Failed to place order.');
        } finally {
            setLoading(false);
            setProcessingMessage('');
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
                            <div className={styles.paymentOption} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        id="mpesa"
                                        value="mpesa"
                                        checked={paymentMethod === 'mpesa'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label htmlFor="mpesa" style={{ cursor: 'pointer', fontWeight: 500, marginLeft: '0.5rem' }}>M-Pesa</label>
                                </div>
                                <img src={mpesaLogo.src} alt="M-Pesa" style={{ height: '35px', objectFit: 'contain' }} />
                            </div>

                            {paymentMethod === 'mpesa' && (
                                <div style={{
                                    marginLeft: '1.5rem',
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#fff',
                                    maxWidth: '300px'
                                }}>
                                    <Smartphone size={20} color="#6b7280" style={{ marginRight: '0.5rem' }} />
                                    <span style={{ color: '#374151', marginRight: '0.5rem', fontWeight: 500 }}>+254</span>
                                    <input
                                        type="text"
                                        placeholder="712345678"
                                        value={mpesaPhoneNumber}
                                        onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                                        style={{
                                            border: 'none',
                                            outline: 'none',
                                            fontSize: '1rem',
                                            color: '#1f2937',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            )}
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
                            <div className={styles.paymentOption} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        id="card"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <label htmlFor="card" style={{ cursor: 'pointer', fontWeight: 500 }}>Pay with Card</label>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <img src={visaLogo.src} alt="Visa" style={{ height: '25px', objectFit: 'contain' }} />
                                    <img src={mastercardLogo.src} alt="Mastercard" style={{ height: '25px', objectFit: 'contain' }} />
                                </div>
                            </div>

                            {paymentMethod === 'card' && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    backgroundColor: '#f9fafb'
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '0.375rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>Expiry Date</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '0.375rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>CVV</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                value={cardDetails.cvc}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '0.375rem',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
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

            {/* Simple Loading Overlay */}
            {
                loading && processingMessage && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        color: 'white',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #f68b1e',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            marginBottom: '1rem'
                        }}></div>
                        <style jsx>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Processing Payment</h2>
                        <p style={{ fontSize: '1.1rem' }}>{processingMessage}</p>
                    </div>
                )
            }
        </div >
    );
}
