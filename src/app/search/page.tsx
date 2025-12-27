'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import styles from './search.module.css';

import { Suspense } from 'react';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchSearchResults(query);
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchSearchResults = async (searchTerm: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

        if (error) {
            console.error('Error fetching search results:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Search Results for "{query || ''}"
                </h1>
                <p className={styles.count}>{products.length} products found</p>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading results...</div>
            ) : products.length > 0 ? (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            image={product.image_url || (product.images ? product.images[0] : '')}
                            title={product.title}
                            price={product.price}
                            oldPrice={product.old_price}
                            rating={product.rating}
                            reviews={product.reviews_count}
                            discount={product.discount}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No products found</h2>
                    <p style={{ color: '#666' }}>Try checking your spelling or use different keywords.</p>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
