import { supabase } from "@/lib/supabase";
import ProductGrid from "@/components/ProductGrid";
import FilterSidebar from "@/components/FilterSidebar";

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const sp = await searchParams;

    const minPrice = sp.minPrice ? Number(sp.minPrice) : null;
    const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : null;
    const rating = sp.rating ? Number(sp.rating) : null;

    // Convert slug to potential category name format (e.g. 'electronics' -> 'Electronics')
    const categoryName = slug.replace(/-/g, ' ');

    let query = supabase
        .from('products')
        .select('*')
        .ilike('category', `%${categoryName}%`);

    if (minPrice !== null) query = query.gte('price', minPrice);
    if (maxPrice !== null) query = query.lte('price', maxPrice);
    if (rating !== null) query = query.gte('rating', rating);

    const { data: products } = await query.order('created_at', { ascending: false });

    return (
        <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>
                {categoryName}
            </h1>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <FilterSidebar />
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <ProductGrid products={products || []} />
                </div>
            </div>
        </div>
    );
}
