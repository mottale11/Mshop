'use client';

import React from 'react';
import styles from './ProductGrid.module.css';
import ProductCard from './ProductCard';

interface Product {
    id: any;
    title: string;
    price: number;
    old_price?: number;
    rating?: number;
    reviews_count?: number;
    discount?: number;
    image_url?: string;
}

interface ProductGridProps {
    products?: Product[];
    layout?: 'grid' | 'horizontal';
}

export default function ProductGrid({ products = [], layout = 'grid' }: ProductGridProps) {
    if (!products || products.length === 0) {
        return <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No products found.</p>;
    }

    return (
        <div className={layout === 'horizontal' ? styles.horizontalContainer : styles.gridContainer}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    oldPrice={product.old_price} // Map DB column to prop
                    rating={product.rating || 0}
                    reviews={product.reviews_count || 0}
                    discount={0} // Calculate if needed or add to DB
                    image={product.image_url || ''}
                />
            ))}
        </div>
    );
}
