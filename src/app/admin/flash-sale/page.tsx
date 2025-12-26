'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../admin.module.css';
import { supabase } from '@/lib/supabase';
import { Trash, Plus } from 'lucide-react';

// Interfaces
interface Product {
    id: string;
    title: string;
    price: number;
}

interface FlashSaleItem {
    id: string;
    product_id: string;
    start_time: string;
    end_time: string;
    discount_percentage: number;
    products: Product; // Joined data
}

export default function FlashSaleAdminPage() {
    const [flashItems, setFlashItems] = useState<FlashSaleItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedProduct, setSelectedProduct] = useState('');
    const [intervalStart, setIntervalStart] = useState('09:00'); // Example default
    const [discount, setDiscount] = useState('20');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Flash Sale Items
        const { data: items, error: itemsError } = await supabase
            .from('flash_sale_items')
            .select('*, products(id, title, price)')
            .eq('active', true)
            .order('start_time', { ascending: true });

        if (itemsError) console.error('Error fetching flash sales:', itemsError);
        else setFlashItems(items as any || []);

        // Fetch All Products for the dropdown
        const { data: prods, error: prodsError } = await supabase
            .from('products')
            .select('id, title, price')
            .order('title');

        if (prodsError) console.error('Error fetching products:', prodsError);
        else setProducts(prods || []);

        setLoading(false);
    };

    const handleAddFlashSale = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return alert('Select a product');

        setSubmitting(true);

        // Calculate functionality 3-hour blocks based on the selected "start hour"
        // For simplicity, let's say the user picks the start time of the DAY, and we assume it's valid.
        // Or better, we auto-calculate the date to be TODAY.
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const startDateTime = new Date(`${today}T${intervalStart}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 3 * 60 * 60 * 1000); // +3 hours

        const { error } = await supabase
            .from('flash_sale_items')
            .insert([{
                product_id: selectedProduct,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                discount_percentage: parseInt(discount),
                active: true
            }]);

        if (error) {
            alert('Error adding: ' + error.message);
        } else {
            fetchData(); // Refresh
            setSelectedProduct('');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this item from Flash Sale?')) return;

        const { error } = await supabase
            .from('flash_sale_items')
            .delete()
            .eq('id', id);

        if (error) alert('Error deleting: ' + error.message);
        else fetchData();
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Flash Sale Management</h1>

            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 2fr' }}>

                {/* Add New Form */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Add to Flash Sale</h2>
                    <form onSubmit={handleAddFlashSale} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Product</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                                required
                            >
                                <option value="">Select Product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.title} (${p.price})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Time Slot (Today)</label>
                            <select
                                value={intervalStart}
                                onChange={(e) => setIntervalStart(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                            >
                                <option value="00:00">00:00 - 03:00</option>
                                <option value="03:00">03:00 - 06:00</option>
                                <option value="06:00">06:00 - 09:00</option>
                                <option value="09:00">09:00 - 12:00</option>
                                <option value="12:00">12:00 - 15:00</option>
                                <option value="15:00">15:00 - 18:00</option>
                                <option value="18:00">18:00 - 21:00</option>
                                <option value="21:00">21:00 - 24:00</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Discount (%)</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db' }}
                                min="1" max="100" required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                backgroundColor: '#f68b1e', color: 'white', padding: '0.75rem',
                                border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <Plus size={18} /> {submitting ? 'Adding...' : 'Add Item'}
                        </button>
                    </form>
                </div>

                {/* List of active items */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Active Flash Sales</h2>
                    {loading ? <p>Loading...</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {flashItems.length === 0 ? <p style={{ color: '#6b7280' }}>No active flash sales.</p> : (
                                flashItems.map(item => {
                                    const start = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const end = new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    return (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}>
                                            <div>
                                                <p style={{ fontWeight: '600' }}>{item.products?.title || 'Unknown Product'}</p>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{start} - {end} • {item.discount_percentage}% OFF</p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
