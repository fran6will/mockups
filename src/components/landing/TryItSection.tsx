import { supabase } from '@/lib/supabase/client';
import ImageCompositor from '@/components/customer/ImageCompositor';
import { Sparkles } from 'lucide-react';

export default async function TryItSection() {
    // Fetch a free product (or fallback to the first product if none marked free for demo)
    // Ideally we filter by is_free=true, but since we just added the column it might be null/false for all.
    // For now, let's just pick the latest product and treat it as free for this section, 
    // OR strictly query is_free. Let's query is_free and if none, show nothing or a placeholder.

    // Actually, for the "magic" to work immediately without user intervention (setting is_free),
    // I might need to pick a specific product ID or just the first one.
    // But to be safe and follow the plan, I'll query for is_free.
    // If the user hasn't set any product to is_free, this section won't show anything useful.
    // So I should probably tell the user to mark a product as free.

    // However, to make it work "out of the box" for the user right now, 
    // I'll fetch the *first* product and force it to be free in this context ONLY IF I can't find a free one?
    // No, that's dangerous. I'll stick to is_free=true.

    const { data: freeProduct } = await supabase
        .from('products')
        .select('*')
        .eq('is_free', true)
        .limit(1)
        .maybeSingle();

    if (!freeProduct) {
        // Fallback: If no free product, don't render the section to avoid errors.
        // Or render a placeholder saying "No free trial available".
        return null;
    }

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal font-bold text-sm mb-6">
                        <Sparkles size={16} />
                        <span>Experience the Magic</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
                        Try it right now, <span className="text-teal">for free.</span>
                    </h2>
                    <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                        Create a free account to try this mockup and see the results instantly.
                    </p>
                </div>

                <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-2xl shadow-teal/5">
                    <ImageCompositor
                        productId={freeProduct.id}
                        productSlug={freeProduct.slug}
                        baseImageUrl={freeProduct.base_image_url}
                        passwordHash={freeProduct.password_hash} // Not used for free, but required prop
                        isFree={true}
                    />
                </div>
            </div>
        </section>
    );
}
