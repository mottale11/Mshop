'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, Heart, Package, MessageSquare, LogOut, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from './AuthProvider';
import { useShop } from '@/context/ShopContext';

export default function Header() {
    const { user, signOut } = useAuth();
    const { cart } = useShop();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        await signOut();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className={styles.header}>
            {/* Desktop View */}
            <div className={styles.desktopHeader}>
                <Link href="/" className={styles.logo}>M-Shop</Link>

                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search products, brands and categories"
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className={styles.searchButton}>SEARCH</button>
                </form>

                <div className={styles.actions}>
                    {user ? (
                        <div
                            className={styles.actionItem}
                            style={{ cursor: 'pointer', position: 'relative' }}
                            ref={dropdownRef}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <User size={24} />
                            <span>Hi, {user.user_metadata.first_name || 'User'}</span>
                            <ChevronDown size={16} style={{ marginLeft: '4px' }} />

                            {isDropdownOpen && (
                                <div className={styles.dropdown}>
                                    <Link href="/account" className={styles.dropdownItem}>
                                        <Package size={18} /> Orders
                                    </Link>
                                    <Link href="/messages" className={styles.dropdownItem}>
                                        <MessageSquare size={18} /> Messages
                                    </Link>
                                    <div className={styles.dropdownItem} onClick={handleLogout}>
                                        <LogOut size={18} /> Logout
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={styles.actionItem}>
                            <User size={24} />
                            <span>Login</span>
                        </Link>
                    )}

                    <Link href="/saved" className={styles.actionItem}>
                        <Heart size={24} />
                        <span>Saved</span>
                    </Link>
                    <Link href="/cart" className={styles.actionItem}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={24} />
                            {cart.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    backgroundColor: '#f68b1e',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                }}>
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span>Cart</span>
                    </Link>
                </div>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileHeader}>
                <div className={styles.mobileTopRow}>
                    <Link href="/" className={styles.logo}>M-Shop</Link>
                    <Link href="/cart" style={{ color: 'inherit', position: 'relative' }}>
                        <ShoppingCart size={24} />
                        {cart.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#f68b1e',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                                {cart.length}
                            </span>
                        )}
                    </Link>
                </div>
                <form className={styles.mobileSearchBar} onSubmit={handleSearch}>
                    <Search size={18} className={styles.searchIconOverlay} />
                    <input
                        type="text"
                        placeholder="I am searching for..."
                        className={styles.mobileSearchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>
        </header>
    );
}
