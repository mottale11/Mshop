'use client';

import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

// Define Product Type
type Product = {
    id: any;
    title: string;
    category: string;
    price: number;
    stock: number;
    image_url: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: any) => {
        if (confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert('Error deleting product');
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading products...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Products</h1>
                <Link
                    href="/admin/products/new"
                    style={{
                        backgroundColor: '#f68b1e',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Product</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Category</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Price</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Stock</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No products found. Add one!</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '1.25rem', overflow: 'hidden' }}>
                                            {/* Helper for image */}
                                            {product.image_url ?
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : '📦'}
                                        </div>
                                        <span style={{ fontWeight: '500', color: '#111827' }}>{product.title}</span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{product.category || 'Uncategorized'}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>${product.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: product.stock < 10 ? '#fee2e2' : '#ecfdf5',
                                            color: product.stock < 10 ? '#991b1b' : '#166534'
                                        }}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link href={`/admin/products/edit/${product.id}`} style={{ padding: '0.25rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                style={{ padding: '0.25rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
