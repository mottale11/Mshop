import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Convert slug to potential category name format (e.g. 'electronics' -> 'Electronics')
    // We'll use ILIKE so casing doesn't strictly matter, but replacing dashes is good
    const categoryName = slug.replace(/-/g, ' ');

    const { data: products } = await supabase
        .from('products')
        // Use ilike for case-insensitive matching. Verify your DB column naming!
        .select('*')
        .ilike('category', `%${categoryName}%`)
        .order('created_at', { ascending: false });

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>
                {categoryName}
            </h1>

            {/* Placeholder for Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: 'white' }}>Price</button>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: 'white' }}>Brand</button>
                <button style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: 'white' }}>Rating</button>
            </div>

            <ProductGrid products={products || []} />
        </div>
    );
}
