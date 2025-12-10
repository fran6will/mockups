import { ShoppingBag, Instagram, Video } from 'lucide-react';

export default function CompatibilityTrustBar() {
    return (
        <section className="py-10 border-y border-ink/5 bg-ink/2 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    <p className="text-sm font-bold text-ink/40 uppercase tracking-widest whitespace-nowrap">
                        Create listing photos for:
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-teal transition-all duration-500">
                        {/* Etsy (Text Fallback for robustness) */}
                        <div className="flex items-center justify-center" title="Etsy">
                            <span className="font-serif font-black text-3xl tracking-tighter">Etsy</span>
                        </div>

                        {/* Shopify */}
                        <div className="flex items-center gap-2" title="Shopify">
                            <ShoppingBag className="w-6 h-6" />
                            <span className="font-black text-xl tracking-tighter">shopify</span>
                        </div>

                        {/* Printful (Text Logo) */}
                        <div className="flex items-center" title="Printful">
                            <span className="font-extrabold text-xl tracking-tight">Printful</span>
                        </div>

                        {/* Printify (Text Logo) */}
                        <div className="flex items-center" title="Printify">
                            <span className="font-extrabold text-xl tracking-tight">Printify</span>
                        </div>

                        {/* Instagram (Icon) */}
                        <div className="flex items-center gap-1.5" title="Instagram">
                            <Instagram className="w-6 h-6" />
                            <span className="font-bold text-lg hidden md:block">Instagram</span>
                        </div>

                        {/* TikTok (Icon) */}
                        <div className="flex items-center gap-1.5" title="TikTok">
                            <div className="relative w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-bold">T</span>
                            </div>
                            <span className="font-bold text-lg hidden md:block">TikTok Shop</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
