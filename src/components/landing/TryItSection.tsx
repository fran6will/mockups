import { supabase } from '@/lib/supabase/client';
import TryItPlayground from '@/components/landing/TryItPlayground';
import { Sparkles } from 'lucide-react';

export default async function TryItSection() {
    const { data: freeProducts } = await supabase
        .from('products')
        .select('id, slug, title, base_image_url, password_hash')
        .eq('is_free', true)
        .limit(5);

    if (!freeProducts || freeProducts.length === 0) {
        return null;
    }

    return (
        <section id="try-it" className="py-24 relative overflow-hidden">
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

                <TryItPlayground products={freeProducts} />
            </div>
        </section>
    );
}
