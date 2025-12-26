'use client';

import React from 'react';
import styles from './saved.module.css';
import { Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';

export default function SavedPage() {
    const { wishlist, toggleWishlist, addToCart } = useShop();

    if (wishlist.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h2>Your wishlist is empty!</h2>
                <p>Browse categories and save your favorite items.</p>
                <Link href="/" className={styles.shopBtn}>Start Shopping</Link>
            </div>
        );
    }

    const handleAddToCart = (item: any) => {
        addToCart(item);
        alert("Added to cart!");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Saved Items ({wishlist.length})</h1>
            <div className={styles.list}>
                {wishlist.map((item) => (
                    <div key={item.id} className={styles.itemCard}>
                        <div className={styles.imagePlaceholder}>
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span>IMG</span>
                            )}
                        </div>
                        <div className={styles.itemInfo}>
                            <h3 className={styles.itemName}>{item.title}</h3>
                            <div className={styles.priceRow}>
                                <span className={styles.price}>KSh {item.price.toLocaleString()}</span>
                                {item.old_price && <span className={styles.oldPrice}>KSh {item.old_price.toLocaleString()}</span>}
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className={styles.cartBtn} onClick={() => handleAddToCart(item)}>
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                            <button className={styles.removeBtn} onClick={() => toggleWishlist(item)}>
                                <Trash2 size={18} /> Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
