'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { ThumbsUp } from 'lucide-react';

export default function RecommendedProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            // Fetch random products
            // Supabase doesn't have a direct random() function easily accessible via JS SDK without RPC,
            // so we'll fetch a larger set and pick random ones or just fetch a subset.
            // For simplicity/performance, let's fetch the latest 10 and pick 4
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .limit(10);

            if (error) {
                console.error('Error fetching recommendations:', error);
            } else {
                if (data && data.length > 0) {
                    const shuffled = data.sort(() => 0.5 - Math.random());
                    setProducts(shuffled.slice(0, 4));
                }
            }
            setLoading(false);
        };

        fetchRecommendations();
    }, []);

    if (loading || products.length === 0) return null;

    return (
        <div style={{
            marginTop: '2rem',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #eee',
                paddingBottom: '0.5rem'
            }}>
                <div style={{
                    backgroundColor: '#f68b1e',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <ThumbsUp size={16} color="white" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>You May Also Like</h3>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem'
            }}>
                {products.map(product => (
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
        </div>
    );
}
