"use client";

import React from 'react';
import styles from './Cart.module.css';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity } = useShop();

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>Shopping Cart ({cart.length})</h2>
            <div className={styles.content}>
                <div className={styles.cartItems}>
                    <div className={styles.cartHeader}>Cart Items</div>
                    {cart.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Your cart is empty.</div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemImage}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}></div>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                    <span className={styles.itemPrice}>KSh {item.price.toLocaleString()}</span>
                                    <div className={styles.itemActions}>
                                        <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                                            <Trash2 size={16} /> REMOVE
                                        </button>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.qty - 1)}><Minus size={16} /></button>
                                            <span>{item.qty}</span>
                                            <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.qty + 1)}><Plus size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.summary}>
                    <h3 className={styles.summaryTitle}>Cart Summary</h3>
                    <div className={styles.row}>
                        <span>Subtotal</span>
                        <span>KSh {subtotal.toLocaleString()}</span>
                    </div>
                    {cart.length > 0 && (
                        <div className={styles.row}>
                            <span>Delivery estimated</span>
                            <span>KSh 200</span>
                        </div>
                    )}
                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>KSh {(subtotal + (cart.length > 0 ? 200 : 0)).toLocaleString()}</span>
                    </div>
                    <button className={styles.checkoutBtn} disabled={cart.length === 0} style={{ opacity: cart.length === 0 ? 0.5 : 1 }}>
                        CHECKOUT (KSh {(subtotal + (cart.length > 0 ? 200 : 0)).toLocaleString()})
                    </button>
                </div>
            </div>
        </div>
    );
}
