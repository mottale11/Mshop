'use client';

import styles from '../../admin.module.css';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

export default function AddProductPage() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    // Image Upload State
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, name').order('name');
            if (data) {
                setCategories(data);
                if (data.length > 0) setCategory(data[0].name);
            }
        };
        fetchCategories();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Convert FileList to Array and append to existing files
            const newFiles = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        const imageUrls: string[] = [];

        try {
            // Upload all images
            for (const file of imageFiles) {
                const url = await uploadImage(file);
                if (url) {
                    imageUrls.push(url);
                }
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Some images failed to upload");
        } finally {
            setUploading(false);
        }

        // Use the first image as the main image_url for backward compatibility
        const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : '';

        // Ensure category is set (fallback to first available if empty)
        const finalCategory = category || (categories.length > 0 ? categories[0].name : 'Uncategorized');

        const { error } = await supabase.from('products').insert([
            {
                title,
                category: finalCategory,
                description,
                short_description: shortDescription,
                brand,
                color,
                size,
                price: parseFloat(price),
                stock: parseInt(stock),
                image_url: mainImageUrl, // Backward compatibility
                images: imageUrls, // New array column
            }
        ]);

        if (error) {
            alert('Error creating product: ' + error.message);
            setLoading(false);
        } else {
            alert('Product created successfully!');
            router.push('/admin/products');
            router.refresh();
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Add New Product</h1>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Product Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Wireless Headphones"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Category</label>
                            <select
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                                {categories.length === 0 && <option>Loading...</option>}
                            </select>
                        </div>
                    </div>

                    {/* New Specs Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Brand</label>
                            <input
                                type="text"
                                placeholder="e.g. Sony"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color</label>
                            <input
                                type="text"
                                placeholder="e.g. Black"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Size</label>
                            <input
                                type="text"
                                placeholder="e.g. Medium"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Short Description</label>
                        <textarea
                            rows={2}
                            placeholder="Brief summary..."
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontFamily: 'inherit' }}
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Full Description</label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Product description..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Price ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Stock Quantity</label>
                            <input
                                type="number"
                                placeholder="0"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Image Upload Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Product Images (Select Multiple)</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                        {/* Image Previews */}
                        {imageFiles.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {imageFiles.map((file, index) => (
                                    <div key={index} style={{ position: 'relative', border: '1px solid #ddd', padding: '0.25rem', borderRadius: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem' }}>{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            style={{
                                                marginLeft: '0.5rem',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '16px',
                                                height: '16px',
                                                fontSize: '10px',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading images...</p>}
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>* You can select multiple images. The first one will be the main image.</p>
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
                            disabled={loading || uploading}
                            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.375rem', backgroundColor: '#f68b1e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', opacity: (loading || uploading) ? 0.7 : 1 }}
                        >
                            {loading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
