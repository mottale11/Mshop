'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/lib/supabase';
import styles from './checkout.module.css';

export default function CheckoutPage() {
    const { cart, clearCart } = useShop();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('mpesa');

    // Handle hydration mismatch by mounting only on client
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingCost = 200; // Consistent with Cart.tsx
    const total = subtotal + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert('You must be logged in to place an order.');
                router.push('/login?redirect=/checkout');
                return;
            }

            if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.phone) {
                alert('Please fill in all shipping details.');
                return;
            }

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: 'Pending',
                    shipping_address: formData,
                    payment_method: paymentMethod
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.qty,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Clear Cart and Redirect
            clearCart();
            router.push('/account/orders');

        } catch (error: any) {
            console.error('Checkout error:', error);
            alert('Failed to place order. Please try again.');
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
                <button onClick={() => router.push('/')} className={styles.placeOrderBtn} style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem' }}>
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.grid}>
                {/* Left Column: Shipping & Payment */}
                <div className={styles.forms}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Shipping Address</h2>
                        <form className={styles.form} onSubmit={handlePlaceOrder}>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        className={styles.input}
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        className={styles.input}
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className={styles.input}
                                    placeholder="123 Main St"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={styles.input}
                                        placeholder="Nairobi"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className={styles.input}
                                        placeholder="+254 7..."
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </section>

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
                                    id="card"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                                <label htmlFor="card">Credit/Debit Card</label>
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
                                <span>{item.title} x {item.qty}</span>
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
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
