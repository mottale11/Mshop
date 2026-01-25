'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, Folder, FolderOpen, Tablet, Shirt, Home as HomeIcon, Monitor, Zap, Gift, Baby, Watch, List, HelpCircle, Gamepad2, ShoppingBag, Camera, Heart, Briefcase, Coffee, Headphones } from 'lucide-react';
import styles from '../admin.module.css';

// Map of available icons for selection
const AVAILABLE_ICONS: { [key: string]: any } = {
    'Tablet': Tablet,
    'Shirt': Shirt,
    'Home': HomeIcon,
    'Monitor': Monitor,
    'Zap': Zap,
    'Gift': Gift,
    'Baby': Baby,
    'Watch': Watch,
    'Gamepad': Gamepad2,
    'ShoppingBag': ShoppingBag,
    'Camera': Camera,
    'Heart': Heart,
    'Briefcase': Briefcase,
    'Coffee': Coffee,
    'Headphones': Headphones,
    'HelpCircle': HelpCircle
};

interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
    icon?: string;
    children?: Category[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', slug: '', parent_id: '', icon: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
        } else {
            // Organize into tree
            const cats = data as Category[];
            const tree = buildCategoryTree(cats);
            setCategories(tree);
        }
        setLoading(false);
    }

    function buildCategoryTree(items: Category[]) {
        const rootItems: Category[] = [];
        const lookup: { [key: string]: Category } = {};

        // Initialize lookup and children array
        items.forEach(item => {
            lookup[item.id] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.parent_id) {
                if (lookup[item.parent_id]) {
                    lookup[item.parent_id].children?.push(lookup[item.id]);
                }
            } else {
                rootItems.push(lookup[item.id]);
            }
        });

        return rootItems;
    }

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || !newItem.slug) return;
        setIsSubmitting(true);

        const payload: any = {
            name: newItem.name,
            slug: newItem.slug.toLowerCase().replace(/\s+/g, '-'),
            icon: newItem.icon || null,
        };
        if (newItem.parent_id) payload.parent_id = newItem.parent_id;

        const { error } = await supabase.from('categories').insert(payload);

        if (error) {
            alert('Error adding category: ' + error.message);
        } else {
            setNewItem({ name: '', slug: '', parent_id: '', icon: '' });
            fetchCategories();
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this category? Subcategories might also be affected.')) return;

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            fetchCategories();
        }
    };

    // Helper to flatten tree for semantic select options
    const getAllCategoriesFlat = (nodes: Category[], depth = 0): { id: string, name: string, depth: number }[] => {
        let result: { id: string, name: string, depth: number }[] = [];
        nodes.forEach(node => {
            result.push({ id: node.id, name: node.name, depth });
            if (node.children) {
                result = result.concat(getAllCategoriesFlat(node.children, depth + 1));
            }
        });
        return result;
    }

    // Flatten categories for the dropdown
    const flatCategories = getAllCategoriesFlat(categories);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Categories</h1>
            </div>

            <div className={styles.gridContainer} style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                {/* Categories List */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Category Structure</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <CategoryTree nodes={categories} onDelete={handleDelete} />
                    )}
                </div>

                {/* Add New Form */}
                <div className={styles.card} style={{ position: 'sticky', top: '7rem' }}>
                    <h2 className={styles.cardTitle}>Add Category</h2>
                    <form onSubmit={handleAddCategory}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Shoes"
                                className={styles.input}
                                value={newItem.name}
                                onChange={e => {
                                    const name = e.target.value;
                                    const slug = name.toLowerCase().replace(/\s+/g, '-');
                                    setNewItem({ ...newItem, name, slug });
                                }}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Slug</label>
                            <input
                                type="text"
                                placeholder="e.g. shoes"
                                className={styles.input}
                                value={newItem.slug}
                                onChange={e => setNewItem({ ...newItem, slug: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Start Icon (Optional)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
                                {Object.keys(AVAILABLE_ICONS).map(iconName => {
                                    const Icon = AVAILABLE_ICONS[iconName];
                                    const isSelected = newItem.icon === iconName;
                                    return (
                                        <div
                                            key={iconName}
                                            onClick={() => setNewItem({ ...newItem, icon: iconName })}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '4px',
                                                backgroundColor: isSelected ? '#f68b1e' : 'transparent',
                                                color: isSelected ? 'white' : '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: isSelected ? 'none' : '1px solid transparent'
                                            }}
                                            title={iconName}
                                        >
                                            <Icon size={20} />
                                        </div>
                                    );
                                })}
                            </div>
                            {newItem.icon && <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#666' }}>Selected: {newItem.icon}</div>}
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Parent Category (Optional)</label>
                            <select
                                className={styles.select}
                                value={newItem.parent_id}
                                onChange={e => setNewItem({ ...newItem, parent_id: e.target.value })}
                            >
                                <option value="">-- None (Top Level) --</option>
                                {flatCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {'- '.repeat(cat.depth)} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className={styles.primaryBtn}
                            disabled={isSubmitting}
                        >
                            <Plus size={20} /> Add Category
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function CategoryTree({ nodes, onDelete }: { nodes: Category[], onDelete: (id: string) => void }) {
    if (!nodes || nodes.length === 0) return <div style={{ color: '#888', fontStyle: 'italic' }}>No categories yet.</div>;
    return (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {nodes.map(node => {
                const Icon = node.icon && AVAILABLE_ICONS[node.icon] ? AVAILABLE_ICONS[node.icon] : Folder;

                return (
                    <li key={node.id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #eee'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {/* Display Icon if set, else generic folder */}
                                <Icon size={16} color={node.icon ? "#f68b1e" : "#9ca3af"} />
                                <span style={{ fontWeight: 500 }}>{node.name}</span>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginLeft: '0.5rem' }}>/{node.slug}</span>
                            </div>
                            <button
                                onClick={() => onDelete(node.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {node.children && node.children.length > 0 && (
                            <div style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', borderLeft: '1px solid #eee' }}>
                                <CategoryTree nodes={node.children} onDelete={onDelete} />
                            </div>
                        )}
                    </li>
                )
            })}
        </ul>
    );
}
