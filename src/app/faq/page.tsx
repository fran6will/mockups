import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Layers, Image as ImageIcon, CreditCard, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'FAQ & How-to | CopiéCollé',
    description: 'Learn how to use CopiéCollé, understand the difference between Scenes and Mockups, and find answers to common questions about credits and billing.',
    keywords: 'faq, how to, help, support, scenes, mockups, credits, billing, copiecolle',
};

export default function FAQPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-6">
                        Frequently Asked <span className="text-teal">Questions</span>
                    </h1>
                    <p className="text-lg text-ink/70 max-w-2xl mx-auto">
                        Everything you need to know about creating stunning product visuals with CopiéCollé.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Definitions */}
                    <section className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 md:p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                                <HelpCircle size={20} />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-ink">Terminology</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-blue-600 font-bold">
                                    <Layers size={18} />
                                    <h3>Mockup</h3>
                                </div>
                                <p className="text-ink/70 leading-relaxed">
                                    A <strong>Mockup</strong> is a product template (like a t-shirt, mug, or tote bag) where you place your design <strong>ON</strong> the product.
                                </p>
                                <ul className="list-disc list-inside text-sm text-ink/60 space-y-1 ml-2">
                                    <li>Best for: Selling specific merchandise.</li>
                                    <li>Input: Your logo or artwork file.</li>
                                    <li>Result: Your design realistically applied to the product surface.</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-purple-600 font-bold">
                                    <ImageIcon size={18} />
                                    <h3>Scene</h3>
                                </div>
                                <p className="text-ink/70 leading-relaxed">
                                    A <strong>Scene</strong> is a background environment (like a wooden desk, a cozy living room, or a nature setting) where you place a product <strong>INTO</strong> the environment.
                                </p>
                                <ul className="list-disc list-inside text-sm text-ink/60 space-y-1 ml-2">
                                    <li>Best for: Lifestyle shots and branding.</li>
                                    <li>Input: A product image (e.g., a bottle, a box).</li>
                                    <li>Result: Your product realistically integrated into the scene with shadows and lighting.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-ink/5">
                            <h3 className="font-bold text-ink mb-2">Custom Template</h3>
                            <p className="text-ink/70 leading-relaxed">
                                A <strong>Custom Template</strong> allows you to upload your own base image (either a product photo or a scene) and use our AI to composite your designs or products onto it. This gives you complete control over your visual assets.
                            </p>
                        </div>

                        <div className="mt-8 pt-8 border-t border-ink/5">
                            <h3 className="font-bold text-ink mb-2">Remixing & Privacy</h3>
                            <p className="text-ink/70 leading-relaxed">
                                <strong>Remixing</strong> allows you to take an existing scene or upload your own, and customize it with your product.
                            </p>
                            <div className="mt-4 bg-teal/5 p-4 rounded-xl border border-teal/10">
                                <p className="text-sm text-ink/80 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-teal"></span>
                                    <strong>Privacy Guarantee:</strong> All custom remixes and scenes you create are <strong>PRIVATE</strong> by default. They will appear in your personal dashboard but will never be shown in the public community gallery.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Credits & Billing */}
                    <section className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 md:p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-ink">Credits & Usage</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-lg text-ink mb-2">How are credits used?</h3>
                                <p className="text-ink/70 leading-relaxed">
                                    Each successful generation costs <strong>1 Credit</strong>. This includes generating a mockup with your design or placing a product into a scene.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-ink mb-2">Do you offer refunds for failed generations?</h3>
                                <div className="flex gap-4 items-start bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                    <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
                                    <div className="space-y-2">
                                        <p className="text-ink/80 text-sm leading-relaxed">
                                            <strong>System Errors:</strong> If the generation fails due to a technical error on our end (e.g., server timeout, AI service unavailable), your credit will not be deducted, or it will be automatically refunded.
                                        </p>
                                        <p className="text-ink/80 text-sm leading-relaxed">
                                            <strong>User Satisfaction:</strong> We do <strong>not</strong> offer reimbursement for generations that complete successfully but do not meet your aesthetic preference. We recommend using the preview tools and following our best practices guides to ensure the best results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: How it Works */}
                    <section className="bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 md:p-10 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                                <Layers size={20} />
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-ink">How to Use CopiéCollé</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 text-6xl font-heading font-bold text-teal/5 select-none">1</div>
                                <h3 className="font-bold text-lg text-ink mb-2 relative z-10">Choose a Template</h3>
                                <p className="text-ink/70 text-sm">Browse our Gallery or Fresh Drops to find the perfect Mockup or Scene for your needs.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 text-6xl font-heading font-bold text-teal/5 select-none">2</div>
                                <h3 className="font-bold text-lg text-ink mb-2 relative z-10">Upload & Customize</h3>
                                <p className="text-ink/70 text-sm">Upload your design (for Mockups) or product image (for Scenes). Adjust the placement and settings.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 text-6xl font-heading font-bold text-teal/5 select-none">3</div>
                                <h3 className="font-bold text-lg text-ink mb-2 relative z-10">Generate & Download</h3>
                                <p className="text-ink/70 text-sm">Hit generate and watch the AI work its magic. Download your high-resolution image instantly.</p>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <Link href="/gallery" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-teal text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                Start Creating Now
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
