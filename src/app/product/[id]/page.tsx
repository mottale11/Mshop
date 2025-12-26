import { supabase } from "@/lib/supabase";
import ProductDetails from "@/components/ProductDetails";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (!product) {
        return <div>Product not found</div>;
    }

    return <ProductDetails product={product} />;
}
