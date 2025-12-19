'use client';

import { Star, Store, Quote } from 'lucide-react';
import Image from 'next/image';

const TESTIMONIALS = [
    {
        id: 1,
        name: "Elena R.",
        role: "Grocery Store Owner",
        quote: "I use Remix Mode for all my social content now. It's so much faster than setting up a photoshoot for every new product arrival.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
        highlight: "Remix Mode"
    },
    {
        id: 2,
        name: "Sarah M.",
        role: "Candle Maker",
        quote: "Usually AI loses the small details, but this is consistent. It looks exactly like my products without losing any of the texture or labels.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
        highlight: "Studio Quality"
    },
    {
        id: 3,
        name: "Mark T.",
        role: "Etsy POD Seller",
        quote: "It gives me a lot of product images in a fast way. Faster than Photoshop.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
        highlight: "Faster than Photoshop"
    }
];

export default function Testimonials() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
                        Loved by Creators
                    </h2>
                    <p className="text-lg text-ink/60 max-w-2xl mx-auto">
                        From Etsy power-sellers to boutique brands, see why they switched.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div
                            key={t.id}
                            className="bg-teal/5 backdrop-blur-xl border border-teal/10 rounded-3xl p-8 hover:border-teal/20 transition-all duration-500 hover:-translate-y-1 group"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                                    <Image
                                        src={t.avatar}
                                        alt={t.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-ink">{t.name}</h4>
                                    <p className="text-xs font-bold text-teal tracking-wide uppercase">{t.role}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <Quote className="text-teal/20 w-8 h-8 mb-2 rotate-180" />
                                <p className="text-ink/80 leading-relaxed font-medium">
                                    "{t.quote}"
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} size={14} className="fill-orange-400 text-orange-400" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
