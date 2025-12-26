'use client';

import styles from './checkout.module.css';

export default function CheckoutPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.grid}>
                {/* Left Column: Shipping & Payment */}
                <div className={styles.forms}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Shipping Address</h2>
                        <form className={styles.form}>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>First Name</label>
                                    <input type="text" className={styles.input} placeholder="John" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Last Name</label>
                                    <input type="text" className={styles.input} placeholder="Doe" />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Address</label>
                                <input type="text" className={styles.input} placeholder="123 Main St" />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>City</label>
                                    <input type="text" className={styles.input} placeholder="Nairobi" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Phone</label>
                                    <input type="text" className={styles.input} placeholder="+254 7..." />
                                </div>
                            </div>
                        </form>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Payment Method</h2>
                        <div className={styles.paymentOptions}>
                            <div className={styles.paymentOption}>
                                <input type="radio" name="payment" id="mpesa" defaultChecked />
                                <label htmlFor="mpesa">M-Pesa</label>
                            </div>
                            <div className={styles.paymentOption}>
                                <input type="radio" name="payment" id="card" />
                                <label htmlFor="card">Credit/Debit Card</label>
                            </div>
                            <div className={styles.paymentOption}>
                                <input type="radio" name="payment" id="cod" />
                                <label htmlFor="cod">Cash on Delivery</label>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className={styles.summaryCard}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <div className={styles.summaryItems}>
                        <div className={styles.summaryItem}>
                            <span>Wireless Headphones x 1</span>
                            <span>$120.00</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Smart Watch x 1</span>
                            <span>$199.50</span>
                        </div>
                    </div>
                    <div className={styles.summaryDivider}></div>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>$319.50</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Shipping</span>
                        <span>$10.00</span>
                    </div>
                    <div className={styles.summaryDivider}></div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>$329.50</span>
                    </div>

                    <button className={styles.placeOrderBtn}>Place Order</button>
                </div>
            </div>
        </div>
    );
}
