
import React from 'react';
import ProductCard from '@/components/ProductCard';
import styles from './flash-sale.module.css';
import { supabase } from '@/lib/supabase';
import FlashSaleBanner from '@/components/FlashSaleBanner';

export const revalidate = 60; // ISR

export default async function FlashSalePage() {
    // Fetch Active Flash Sale Items
    const { data: flashSaleData } = await supabase
        .from('flash_sale_items')
        .select('*, products(*)')
        .eq('active', true);

    // Transform flashSaleData to match ProductCard expectations
    const products = flashSaleData?.map((item: any) => ({
        flash_sale_id: item.id, // Unique ID for key
        id: item.products.id,
        title: item.products.title,
        price: item.products.price * (1 - item.discount_percentage / 100),
        oldPrice: item.products.price,
        rating: item.products.rating || 0,
        reviews: item.products.reviews_count || 0,
        discount: item.discount_percentage,
        image: item.products.image_url,
    })) || [];

    return (
        <div className={styles.container}>
            <FlashSaleBanner />

            <div className={styles.grid}>
                {products.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>No active flash sales at the moment.</div>
                ) : (
                    products.map((product: any) => (
                        <ProductCard key={product.flash_sale_id} {...product} />
                    ))
                )}
            </div>
        </div>
    );
}
