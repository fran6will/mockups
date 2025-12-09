import { supabaseAdmin } from '@/lib/supabase/admin';
import TryItPlayground from '@/components/landing/TryItPlayground';
import { Sparkles, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

// Force dynamic rendering so products are always fresh
export const dynamic = 'force-dynamic';

export default async function TryItSection() {
    const { data: freeProducts } = await supabaseAdmin
        .from('products')
        .select('id, slug, title, base_image_url, gallery_image_url, password_hash')
        .eq('is_free', true)
        .limit(5);

    if (!freeProducts || freeProducts.length === 0) {
        return null;
    }

    return (
        <section id="tryout" className="pt-0 pb-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal/5 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal font-bold text-sm mb-6">
                        <Sparkles size={16} />
                        <span>Experience the Magic</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
                        See your design on a product. <span className="text-teal">Right now.</span>
                    </h2>
                    <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                        No credit card. No Photoshop. Just pure magic. (And yes, it's actually free to try).
                    </p>
                </div>

                <Suspense fallback={
                    <div className="h-[600px] flex items-center justify-center">
                        <Loader2 className="animate-spin text-teal" size={32} />
                    </div>
                }>
                    <TryItPlayground products={freeProducts} />
                </Suspense>
            </div>
        </section>
    );
}
