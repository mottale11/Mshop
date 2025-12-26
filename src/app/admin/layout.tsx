import type { Metadata } from 'next';
import styles from './admin.module.css';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
    title: 'M-Shop Admin',
    description: 'Admin Dashboard for M-Shop',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
