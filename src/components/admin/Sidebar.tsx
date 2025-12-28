'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Settings, LogOut, Zap, Image as ImageIcon, List } from 'lucide-react';
import styles from '@/app/admin/admin.module.css';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: List },
    { name: 'Flash Sales', href: '/admin/flash-sale', icon: Zap },
    { name: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoArea}>
                <div className={styles.logo}>M-Shop Admin</div>
            </div>
            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                        >
                            <Icon className={styles.navIcon} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            {/* Footer / Logout area could go here */}
            <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <Link href="/" className={styles.navLink}>
                    <LogOut className={styles.navIcon} />
                    Back to Store
                </Link>
            </div>
        </aside>
    );
}
