'use client';

import React from 'react';
import Link from 'next/link';
import { Tablet, Shirt, Home as HomeIcon, Monitor, Zap, Gift, Baby, Watch, List, HelpCircle, Gamepad2, ShoppingBag, Camera, Heart, Briefcase, Coffee, Headphones } from 'lucide-react';
import styles from './CategorySidebar.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    icon?: string;
}

// Map of available icons (sync with Admin)
const ICON_MAP: { [key: string]: any } = {
    'Tablet': Tablet,
    'Shirt': Shirt,
    'Home': HomeIcon,
    'Monitor': Monitor,
    'Zap': Zap,
    'Gift': Gift,
    'Baby': Baby,
    'Watch': Watch,
    'Gamepad': Gamepad2,
    'ShoppingBag': ShoppingBag,
    'Camera': Camera,
    'Heart': Heart,
    'Briefcase': Briefcase,
    'Coffee': Coffee,
    'Headphones': Headphones,
    'HelpCircle': HelpCircle
};

export default function CategorySidebar({ categories }: { categories: Category[] }) {
    // Filter for top-level categories only (no parent_id)
    const topLevelCategories = categories.filter(cat => !cat.parent_id);

    return (
        <aside className={styles.sidebar}>
            <ul className={styles.sidebarList}>
                {topLevelCategories.map((cat) => {
                    // Try to find icon by explicit 'icon' field, else fallback to slug mapping (legacy), else HelpCircle
                    const Icon = (cat.icon && ICON_MAP[cat.icon]) || ICON_MAP[getLegacyIconName(cat.slug)] || HelpCircle;

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

// Helper for backward compatibility with old hardcoded slug-based icons
function getLegacyIconName(slug: string): string {
    const map: { [key: string]: string } = {
        'phones-tablets': 'Tablet',
        'fashion': 'Shirt',
        'home-office': 'Home',
        'computing': 'Monitor',
        'electronics': 'Zap',
        'health-beauty': 'Gift',
        'baby-products': 'Baby',
        'watches': 'Watch',
    };
    return map[slug] || '';
}
