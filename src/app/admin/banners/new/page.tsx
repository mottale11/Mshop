'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddBannerPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [active, setActive] = useState(true);
    const router = useRouter();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('banner-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload Error Details:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage.from('banner-images').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message || 'Unknown error'}`);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!imageFile) {
            alert('Please select an image for the banner.');
            return;
        }

        const imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return;

        const { error } = await supabase.from('banners').insert([
            {
                title,
                description,
                link,
                image_url: imageUrl,
                active
            }
        ]);

        if (error) {
            alert('Error creating banner: ' + error.message);
        } else {
            alert('Banner created successfully!');
            router.push('/admin/banners');
            router.refresh();
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Banner</h1>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Banner Title (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Big Sale Up To 50% Off"
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Description / Subtitle (Optional)</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Shop Now"
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontFamily: 'inherit' }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Link URL (Optional)</label>
                        <input
                            type="text"
                            placeholder="/flash-sale"
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Banner Image (Required)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Recommended size: 1200x400px or higher resolution.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="active"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            style={{ width: '1rem', height: '1rem' }}
                        />
                        <label htmlFor="active" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Active immediately</label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.375rem', backgroundColor: '#f68b1e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', opacity: uploading ? 0.7 : 1 }}
                        >
                            {uploading ? 'Uploading...' : 'Create Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
