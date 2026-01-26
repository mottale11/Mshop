'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Shirt, Home, Monitor, Zap, Gift, Baby, Watch, Car, Coffee, Music, Book, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './categories.module.css';

// Helper to map category names to icons
const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('phone') || lowerName.includes('tablet')) return Smartphone;
    if (lowerName.includes('fashion') || lowerName.includes('cloth')) return Shirt;
    if (lowerName.includes('home') || lowerName.includes('office') || lowerName.includes('furniture')) return Home;
    if (lowerName.includes('comput') || lowerName.includes('laptop')) return Monitor;
    if (lowerName.includes('electronic')) return Zap;
    if (lowerName.includes('beauty') || lowerName.includes('health')) return Gift;
    if (lowerName.includes('baby') || lowerName.includes('kid')) return Baby;
    if (lowerName.includes('watch')) return Watch;
    if (lowerName.includes('auto') || lowerName.includes('car')) return Car;
    if (lowerName.includes('supermarket') || lowerName.includes('food')) return Coffee;
    if (lowerName.includes('gam') || lowerName.includes('music')) return Music;
    if (lowerName.includes('book') || lowerName.includes('stationery')) return Book;

    return ShoppingBag; // Default icon
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (error) {
                    console.error('Error fetching categories:', error);
                } else if (data) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Explore Categories</h1>
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading categories...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Explore Categories</h1>

            {categories.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    No categories found.
                </div>
            ) : (
                <div className={styles.grid}>
                    {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat.name);
                        return (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                className={styles.card}
                            >
                                <div className={styles.iconWrapper}>
                                    <Icon size={32} color="#f68b1e" strokeWidth={1.5} />
                                </div>
                                <span className={styles.categoryName}>{cat.name}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
