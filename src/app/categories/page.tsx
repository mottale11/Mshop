import React from 'react';
import { Smartphone, Shirt, Home, Monitor, Zap, Gift, Baby, Watch, Car, Coffee, Music, Book } from 'lucide-react';
import Link from 'next/link';
import styles from './categories.module.css';

const categories = [
    { name: 'Phones & Tablets', icon: Smartphone, slug: 'phones' },
    { name: 'Fashion', icon: Shirt, slug: 'fashion' },
    { name: 'Home & Office', icon: Home, slug: 'home' },
    { name: 'Computing', icon: Monitor, slug: 'computing' },
    { name: 'Electronics', icon: Zap, slug: 'electronics' },
    { name: 'Health & Beauty', icon: Gift, slug: 'beauty' },
    { name: 'Baby Products', icon: Baby, slug: 'baby' },
    { name: 'Watches', icon: Watch, slug: 'watches' },
    { name: 'Automotive', icon: Car, slug: 'automotive' },
    { name: 'Supermarket', icon: Coffee, slug: 'supermarket' },
    { name: 'Gaming', icon: Music, slug: 'gaming' }, // Using Music as placeholder for now
    { name: 'Books & Stationery', icon: Book, slug: 'books' },
];

export default function CategoriesPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Explore Categories</h1>
            <div className={styles.grid}>
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={`/category/${cat.slug}`}
                        className={styles.card}
                    >
                        <div className={styles.iconWrapper}>
                            <cat.icon size={32} color="#f68b1e" strokeWidth={1.5} />
                        </div>
                        <span className={styles.categoryName}>{cat.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
