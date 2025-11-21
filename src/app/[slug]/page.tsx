'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import ImageCompositor from '@/components/customer/ImageCompositor';
import { Lock, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function ProductPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
                setError('Product not found');
            } else {
                setProduct(data);
            }
            setLoading(false);
        };

        fetchProduct();
    }, [slug]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (product && passwordInput === product.password_hash) {
            setIsAuthenticated(true);
        } else {
            setError('Incorrect password');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-teal/60 animate-pulse">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-ink">Product not found</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full glass p-8 rounded-3xl transition-all duration-500 ease-out transform hover:scale-[1.01]">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Lock className="text-teal" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">{product.title}</h1>
                        <p className="text-ink/60">Enter password to access this mockup</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => {
                                    setPasswordInput(e.target.value);
                                    setError('');
                                }}
                                className="w-full bg-white/40 border border-white/60 rounded-xl p-5 text-ink focus:ring-4 focus:ring-teal/10 focus:border-teal/50 outline-none transition-all text-center text-2xl tracking-[0.5em] placeholder:tracking-normal placeholder:text-ink/30"
                                placeholder="••••"
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg animate-shake">
                                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            Unlock <ArrowRight size={20} />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-ink selection:bg-teal/20">
            <header className="glass sticky top-4 z-50 mx-4 rounded-2xl border-white/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo showText={false} />
                        <h1 className="text-xl font-bold text-ink tracking-tight border-l-2 border-teal/20 pl-3 ml-1">{product.title}</h1>
                    </div>
                    <div className="text-xs font-bold text-teal/80 uppercase tracking-widest bg-teal/5 px-3 py-1 rounded-full border border-teal/10">
                        Instant Mockup                     </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 lg:p-8 pt-8">
                <ImageCompositor
                    productId={product.id}
                    baseImageUrl={product.base_image_url}
                />
            </main>
        </div>
    );
}