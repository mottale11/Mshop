import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import { ShoppingBag, Tablet, Shirt, Home as HomeIcon, Monitor, Zap, Gift, Baby, Watch } from 'lucide-react';
import Link from 'next/link';
import FlashSale from '@/components/FlashSale';
import ProductCard from '@/components/ProductCard';
import HeroCarousel from '@/components/HeroCarousel';

import styles from './home.module.css';

export const revalidate = 60; // Revalidate every minute for new banners

export default async function Home() {
    // Fetch Products (Daily Picks)
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch Active Flash Sale Items
    const { data: flashSaleData } = await supabase
        .from('flash_sale_items')
        .select('*, products(*)')
        .eq('active', true);
    // Ideally checking time too: .lte('start_time', new Date().toISOString()).gte('end_time', ...)
    // For simplicity, let's just show all active ones for now.

    // Fetch Active Banners for Hero Carousel
    const { data: banners } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

    // Transform flashSaleData to match ProductCard expectations
    const flashSaleProducts = flashSaleData?.map((item: any) => ({
        flash_sale_id: item.id, // Unique ID for key
        ...item.products, // spread product details
        image: item.products.image_url, // Map image_url to image prop expected by ProductCard
        price: item.products.price * (1 - item.discount_percentage / 100), // Calculate discounted price
        oldPrice: item.products.price,
        discount: item.discount_percentage,
    })) || [];


    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>

            <div className={styles.mainGrid}>
                {/* Sidebar Navigation */}
                <aside className={styles.sidebar}>
                    <ul className={styles.sidebarList}>
                        <li><Link href="/category/phones-tablets" className={styles.categoryLink}><Tablet size={18} /> Phones & Tablets</Link></li>
                        <li><Link href="/category/fashion" className={styles.categoryLink}><Shirt size={18} /> Fashion</Link></li>
                        <li><Link href="/category/home-office" className={styles.categoryLink}><HomeIcon size={18} /> Home & Office</Link></li>
                        <li><Link href="/category/computing" className={styles.categoryLink}><Monitor size={18} /> Computing</Link></li>
                        <li><Link href="/category/electronics" className={styles.categoryLink}><Zap size={18} /> Electronics</Link></li>
                        <li><Link href="/category/health-beauty" className={styles.categoryLink}><Gift size={18} /> Health & Beauty</Link></li>
                        <li><Link href="/category/baby-products" className={styles.categoryLink}><Baby size={18} /> Baby Products</Link></li>
                        <li><Link href="/category/watches" className={styles.categoryLink}><Watch size={18} /> Watches</Link></li>
                    </ul>
                </aside>

                {/* Hero Carousel Section */}
                <div className={styles.heroWrapper}>
                    {banners && banners.length > 0 ? (
                        <HeroCarousel banners={banners} />
                    ) : (
                        // Fallback static hero if no banners
                        <div style={{
                            backgroundColor: 'linear-gradient(to right, #ea580c, #1e3a8a)', // Fallback gradient
                            backgroundImage: 'linear-gradient(to right, #ea580c, #2563eb)',
                            height: '400px',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Big Sale Up To 50% Off</h1>
                            <button style={{ backgroundColor: 'white', color: '#ea580c', padding: '0.75rem 2rem', borderRadius: '0.25rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Shop Now</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Flash Sale Section */}
            {flashSaleProducts.length > 0 && (
                <FlashSale products={flashSaleProducts} />
            )}

            {/* Daily Picks Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Daily Picks</h2>
                <ProductGrid products={products || []} />
            </div>
        </main>
    );
}
