'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use() for Next.js 15+ compatibility or standard promise handling
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [color, setColor] = useState('');
    const [size, setSize] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            alert('Error fetching product details');
            router.push('/admin/products');
            return;
        }

        if (data) {
            setTitle(data.title || '');
            setCategory(data.category || 'Electronics');
            setDescription(data.description || '');
            setShortDescription(data.short_description || '');
            setBrand(data.brand || '');
            setColor(data.color || '');
            setSize(data.size || '');
            setPrice(data.price?.toString() || '');
            setStock(data.stock?.toString() || '');

            // Prioritize 'images' array, fallback to 'image_url'
            if (data.images && data.images.length > 0) {
                setCurrentImageUrls(data.images);
            } else if (data.image_url) {
                setCurrentImageUrls([data.image_url]);
            } else {
                setCurrentImageUrls([]);
            }
        }
        setLoading(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setNewImageFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeCurrentImage = (urlToRemove: string) => {
        setCurrentImageUrls(prev => prev.filter(url => url !== urlToRemove));
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
        setSaving(true);
        setUploading(true);

        const uploadedUrls: string[] = [];

        try {
            for (const file of newImageFiles) {
                const url = await uploadImage(file);
                if (url) {
                    uploadedUrls.push(url);
                }
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Some images failed to upload");
        } finally {
            setUploading(false);
        }

        // Combine existing (kept) images with newly uploaded ones
        const finalImages = [...currentImageUrls, ...uploadedUrls];
        const mainImageUrl = finalImages.length > 0 ? finalImages[0] : '';

        const { error } = await supabase.from('products').update({
            title,
            category,
            description,
            short_description: shortDescription,
            brand,
            color,
            size,
            price: parseFloat(price),
            stock: parseInt(stock),
            image_url: mainImageUrl, // Backward compatibility
            images: finalImages, // Update array column
        }).eq('id', id);

        if (error) {
            alert('Error updating product: ' + error.message);
            setSaving(false);
        } else {
            alert('Product updated successfully!');
            router.push('/admin/products');
            router.refresh();
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading product details...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Product</h1>

            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Product Name</label>
                            <input
                                type="text"
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
                                <option>Electronics</option>
                                <option>Fashion</option>
                                <option>Home & Garden</option>
                                <option>Sports</option>
                                <option>Automotive</option>
                                <option>Health & Beauty</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Brand</label>
                            <input
                                type="text"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Color</label>
                            <input
                                type="text"
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Size</label>
                            <input
                                type="text"
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
                                style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Product Images</label>

                        {/* Current Images */}
                        {currentImageUrls.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                {currentImageUrls.map((url, index) => (
                                    <div key={index} style={{ position: 'relative', border: '1px solid #ddd', padding: '0.25rem', borderRadius: '0.25rem' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt={`Product ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeCurrentImage(url)}
                                            style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '20px',
                                                height: '20px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                display: 'flex',
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

                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Add New Images</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            style={{ padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                        />
                        {/* New Image Previews */}
                        {newImageFiles.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {newImageFiles.map((file, index) => (
                                    <div key={index} style={{ position: 'relative', border: '1px solid #ddd', padding: '0.25rem', borderRadius: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem' }}>{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
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
                        {uploading && <p style={{ fontSize: '0.8rem', color: '#666' }}>Uploading...</p>}
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
                            disabled={saving || uploading}
                            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.375rem', backgroundColor: '#f68b1e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500', opacity: (saving || uploading) ? 0.7 : 1 }}
                        >
                            {saving ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
