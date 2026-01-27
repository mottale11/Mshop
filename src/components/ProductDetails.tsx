"use client";

import React, { useState } from 'react';
import styles from './ProductDetails.module.css';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { useShop } from '@/context/ShopContext';
import ReviewsTab from './ReviewsTab';
import { supabase } from '@/lib/supabase';

interface ProductDetailsProps {
    product: any; // Define proper interface later
}

export default function ProductDetails({ product }: ProductDetailsProps) {
    const { addToCart, toggleWishlist, isInWishlist } = useShop();
    const isSaved = isInWishlist(product.id);
    const [activeThumb, setActiveThumb] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
    // State for related products
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchRelated = async () => {
            if (!product.category) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', product.category)
                .neq('id', product.id) // Exclude current product
                .limit(10); // Limit to 10 items

            if (!error && data) {
                setRelatedProducts(data);
            }
        };
        fetchRelated();
    }, [product.category, product.id]);

    if (!product) return <div>Loading...</div>;

    const images = (product.images && product.images.length > 0) ? product.images : (product.image_url ? [product.image_url] : []);
    const currentImage = images[activeThumb] || images[0];

    const handleAddToCart = () => {
        addToCart(product);
        alert("Added to cart!"); // Temporary feedback
    };

    return (
        <div className={styles.container}>
            <div className={styles.topSection}>
                <div className={styles.gallery}>
                    <div
                        className={styles.mainImage}
                        onClick={() => setShowLightbox(true)}
                        style={{ cursor: 'zoom-in' }}
                    >
                        {images.length > 0 ? (
                            <img src={currentImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                {/* Tabs Header */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #eee',
                    marginBottom: '1rem',
                    gap: '2rem'
                }}>
                    <button
                        onClick={() => setActiveTab('details')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'details' ? '3px solid #f68b1e' : '3px solid transparent',
                            padding: '0.75rem 0',
                            fontWeight: 600,
                            color: activeTab === 'details' ? '#f68b1e' : '#666',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Product Details
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        style={{
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'reviews' ? '3px solid #f68b1e' : '3px solid transparent',
                            padding: '0.75rem 0',
                            fontWeight: 600,
                            color: activeTab === 'reviews' ? '#f68b1e' : '#666',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reviews
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' ? (
                    <div className={styles.description}>
                        {/* <h3 className={styles.sectionTitle}>Product Details</h3> */}
                        <div
                            dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
                            style={{ lineHeight: '1.6', marginTop: '1rem', fontSize: '0.9rem' }}
                        />
                    </div>
                ) : (
                    <ReviewsTab productId={product.id} />
                )}
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Related Products</h3>
                <ProductGrid products={relatedProducts} layout="horizontal" />
            </div>

            {/* Lightbox Overlay */}
            {showLightbox && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out'
                    }}
                    onClick={() => setShowLightbox(false)}
                >
                    <img
                        src={currentImage}
                        alt={product.title}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowLightbox(false)}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
