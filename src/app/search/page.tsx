'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import styles from './search.module.css';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            fetchSearchResults();
        } else {
            setLoading(false);
        }
    }, [query, minPrice, maxPrice, rating]);

    const fetchSearchResults = async () => {
        setLoading(true);
        let supabaseQuery = supabase
            .from('products')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

        if (minPrice) supabaseQuery = supabaseQuery.gte('price', minPrice);
        if (maxPrice) supabaseQuery = supabaseQuery.lte('price', maxPrice);
        if (rating) supabaseQuery = supabaseQuery.gte('rating', rating);

        const { data, error } = await supabaseQuery;

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

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <FilterSidebar />

                <div style={{ flex: 1, minWidth: '300px' }}>
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
            </div>
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
