import React from 'react';
import { Smartphone, Shirt, Home, Watch, Zap, Gift, Grid } from 'lucide-react';
import styles from './CategoryShortcuts.module.css';
import Link from 'next/link';

const categories = [
    { name: 'Phones & Tablets', icon: Smartphone, slug: 'electronics' },
    { name: 'Fashion', icon: Shirt, slug: 'fashion' },
    { name: 'Home & Office', icon: Home, slug: 'home-appliances' }, // Assuming 'Home Appliances' or similar in DB, or just 'Home'
    { name: 'Computing', icon: Watch, slug: 'computing' },
    { name: 'Deals', icon: Zap, slug: 'flash-sale' },
    { name: 'All', icon: Grid, slug: 'categories' },
];

export default function CategoryShortcuts() {
    return (
        <div className={styles.categoryRow}>
            {categories.map((cat, index) => {
                // Determine link path. If slug is 'categories', go to /categories. Otherwise /category/[slug]
                // Exception for 'flash-sale'
                let href = `/category/${cat.slug}`;
                if (cat.slug === 'categories') href = '/categories';
                if (cat.slug === 'flash-sale') href = '/flash-sale';

                return (
                    <Link key={index} href={href} className={styles.categoryItem}>
                        <div className={styles.iconCircle}>
                            <cat.icon size={24} />
                        </div>
                        <span className={styles.label}>{cat.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
