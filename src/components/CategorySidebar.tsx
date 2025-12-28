'use client';

import React from 'react';
import Link from 'next/link';
import { Tablet, Shirt, Home as HomeIcon, Monitor, Zap, Gift, Baby, Watch, List, HelpCircle } from 'lucide-react';
import styles from './CategorySidebar.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
}

const ICON_MAP: { [key: string]: any } = {
    'phones-tablets': Tablet,
    'fashion': Shirt,
    'home-office': HomeIcon,
    'computing': Monitor,
    'electronics': Zap,
    'health-beauty': Gift,
    'baby-products': Baby,
    'watches': Watch,
};

export default function CategorySidebar({ categories }: { categories: Category[] }) {
    // Filter for top-level categories only (no parent_id)
    const topLevelCategories = categories.filter(cat => !cat.parent_id);

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.sidebarList}>
                {topLevelCategories.map((cat) => {
                    const Icon = ICON_MAP[cat.slug] || HelpCircle;
                    return (
                        <li key={cat.id}>
                            <Link href={`/category/${cat.slug}`} className={styles.categoryLink}>
                                <Icon size={18} /> {cat.name}
                            </Link>
                        </li>
                    );
                })}
                {topLevelCategories.length === 0 && (
                    <li className={styles.categoryLink} style={{ color: '#888' }}>
                        <List size={18} /> No Categories
                    </li>
                )}
            </ul>
        </aside>
    );
}
