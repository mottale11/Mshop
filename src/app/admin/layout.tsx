import type { Metadata } from 'next';
import AuthLayout from './AuthLayout';

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
        <AuthLayout>
            {children}
        </AuthLayout>
    );
}
