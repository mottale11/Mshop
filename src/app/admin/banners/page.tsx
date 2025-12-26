'use client';

import Link from 'next/link';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

type Banner = {
    id: string;
    title: string;
    image_url: string;
    active: boolean;
    created_at: string;
};

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setBanners(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            const { error } = await supabase.from('banners').delete().eq('id', id);
            if (!error) {
                setBanners(banners.filter(b => b.id !== id));
            } else {
                alert('Error deleting banner');
            }
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase.from('banners').update({ active: !currentStatus }).eq('id', id);
        if (!error) {
            setBanners(banners.map(b => b.id === id ? { ...b, active: !currentStatus } : b));
        } else {
            alert('Error updating banner status');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading banners...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Hero Banners</h1>
                <Link
                    href="/admin/banners/new"
                    style={{
                        backgroundColor: '#f68b1e',
                        color: 'white',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} /> Add Banner
                </Link>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Banner</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Status</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {banners.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center' }}>No banners found. Add one!</td>
                            </tr>
                        ) : (
                            banners.map((banner) => (
                                <tr key={banner.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '120px', height: '60px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#111827' }}>{banner.title || 'Untitled'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {banner.id.slice(0, 8)}...</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: banner.active ? '#ecfdf5' : '#f3f4f6',
                                            color: banner.active ? '#166534' : '#6b7280'
                                        }}>
                                            {banner.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => toggleActive(banner.id, banner.active)}
                                                title={banner.active ? "Deactivate" : "Activate"}
                                                style={{ padding: '0.25rem', color: banner.active ? '#d97706' : '#166534', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {banner.active ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                title="Delete"
                                                style={{ padding: '0.25rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
