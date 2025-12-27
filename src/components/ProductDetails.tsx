"use client";

import React, { useState } from 'react';
import styles from './ProductDetails.module.css';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { useShop } from '@/context/ShopContext';

interface ProductDetailsProps {
    product: any; // Define proper interface later
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { addToCart, toggleWishlist, isInWishlist } = useShop();
    const isSaved = isInWishlist(product.id);
    const [activeThumb, setActiveThumb] = useState(0);

    if (!product) return <div>Loading...</div>;

    const images = (product.images && product.images.length > 0) ? product.images : (product.image_url ? [product.image_url] : []);

    const handleAddToCart = () => {
        addToCart(product);
        alert("Added to cart!"); // Temporary feedback
    };

    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.gallery}>
                    <div className={styles.mainImage}>
                        {images.length > 0 ? (
                            <img src={images[activeThumb] || images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className={styles.thumbnails}>
                            {images.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`${styles.thumb} ${activeThumb === idx ? styles.active : ''}`}
                                    onClick={() => setActiveThumb(idx)}
                                >
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.info}>
                    <span className={styles.brand}>
                        {product.brand ? `${product.brand} | ` : ''}
                        {product.category || 'Brand'}
                    </span>
                    <h1 className={styles.title}>{product.title}</h1>
                    <div className={styles.rating}>
                        <Star size={16} fill="#f68b1e" strokeWidth={0} />
                        <span>({product.reviews_count || 0} reviews)</span>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.currentPrice}>KSh {product.price.toLocaleString()}</span>
                        {product.old_price && <span className={styles.oldPrice}>KSh {product.old_price.toLocaleString()}</span>}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem' }}>
                        {product.short_description && <p style={{ marginBottom: '0.5rem' }}>{product.short_description}</p>}

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
                            {product.color && (
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>Color: </span> {product.color}
                                </div>
                            )}
                            {product.size && (
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>Size: </span> {product.size}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                            <ShoppingCart size={20} />
                            ADD TO CART
                        </button>
                        <button className={styles.secondaryBtn} onClick={() => toggleWishlist(product)}>
                            <Heart size={20} fill={isSaved ? "red" : "none"} color={isSaved ? "red" : "currentColor"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.description}>
                    <h3 className={styles.sectionTitle}>Product Details</h3>
                    <div
                        dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
                        style={{ lineHeight: '1.6', marginTop: '1rem', fontSize: '0.9rem' }}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Related Products</h3>
                <ProductGrid />
            </div>
        </div>
    );
}
