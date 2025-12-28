'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

// Import images
import mpesaLogo from '../images/MPESA.jpg';
import mastercardLogo from '../images/Mastercard Logo.jpeg';
import paypalLogo from '../images/Mit PayPal Geld senden -.jpeg';
import airtelLogo from '../images/airtel.jpeg';
import visaLogo from '../images/visa.jpeg';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section: Payment Methods */}
                <div className={styles.paymentMethods}>
                    <Image src={mpesaLogo} alt="M-Pesa" className={styles.paymentImage} height={40} />
                    <Image src={airtelLogo} alt="Airtel Money" className={styles.paymentImage} height={40} />
                    <Image src={visaLogo} alt="Visa" className={styles.paymentImage} height={40} />
                    <Image src={mastercardLogo} alt="Mastercard" className={styles.paymentImage} height={40} />
                    <Image src={paypalLogo} alt="PayPal" className={styles.paymentImage} height={40} />
                </div>

                {/* Bottom Section: Links */}
                <div className={styles.content}>
                    <div>
                        <h4 className={styles.sectionTitle}>About M-Shop</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="#">About Us</Link></li>
                            <li><Link href="#">Terms & Conditions</Link></li>
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Billing Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.sectionTitle}>Customer Service</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="#">Contact Us</Link></li>
                            <li><Link href="#">Refund Policy</Link></li>
                            <li><Link href="/account/orders">My Orders</Link></li>
                            <li><Link href="#">FAQs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.sectionTitle}>My Account</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/login">Login</Link></li>
                            <li><Link href="/register">Register</Link></li>
                            <li><Link href="/messages">Messages</Link></li>
                            <li><Link href="/saved">Saved Items</Link></li>
                            <li><Link href="/cart">My Cart</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.sectionTitle}>Connect With Us</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="#">Facebook</Link></li>
                            <li><Link href="#">Twitter</Link></li>
                            <li><Link href="#">Instagram</Link></li>
                            <li><Link href="#">YouTube</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()} M-Shop. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
