'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import styles from './admin.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        checkAuth();
    }, [pathname]);

    const checkAuth = async () => {
        // If we are already on the login page, we just need to stop loading
        if (isLoginPage) {
            setLoading(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/admin/login');
                return;
            }

            // Check profile role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role !== 'admin') {
                router.push('/admin/login');
                return;
            }

            setAuthorized(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
            }}>
                Loading admin...
            </div>
        );
    }

    // If it's the login page, render it full screen without sidebar/header
    if (isLoginPage) {
        return <>{children}</>;
    }

    // If authorized (and not login page), render the full admin layout
    if (authorized) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.mainWrapper}>
                    <AdminHeader />
                    <main className={styles.content}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Fallback (shouldn't be reached ideally due to redirects)
    return null;
}
