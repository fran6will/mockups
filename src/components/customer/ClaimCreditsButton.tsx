'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ClaimCreditsButtonProps {
    productId: string;
    productSlug: string;
    passwordHash: string;
}

export default function ClaimCreditsButton({ productId, productSlug, passwordHash }: ClaimCreditsButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Auto-resume claim after login
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('resume_claim') === 'true') {
            // Clear the param
            window.history.replaceState({}, '', window.location.pathname);
            // Run claim
            handleClaim();
        }
    }, []);

    const handleClaim = async () => {
        setLoading(true);
        try {
            // 1. Check if logged in
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Redirect to Google Sign In
                // Add resume_claim param so we know to continue when we get back
                const returnUrl = new URL(window.location.href);
                returnUrl.searchParams.set('resume_claim', 'true');

                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl.toString())}`
                    }
                });
                return;
            }

            // 2. Call API to claim credits
            const response = await fetch('/api/claim-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    password: passwordHash,
                    email: user.email
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // If already claimed, that's fine, proceed to unlock
                if (!data.error?.includes('already claimed')) {
                    throw new Error(data.error || 'Failed to claim credits');
                }
            }

            // 3. Unlock locally
            const unlockedProducts = JSON.parse(localStorage.getItem('unlocked_products') || '[]');
            if (!unlockedProducts.includes(productSlug)) {
                unlockedProducts.push(productSlug);
                localStorage.setItem('unlocked_products', JSON.stringify(unlockedProducts));
            }

            // 4. Redirect to Product Page
            router.push(`/${productSlug}?unlock=true`);

        } catch (error: any) {
            console.error('Claim error:', error);
            // alert('Error claiming credits: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClaim}
            disabled={loading}
            className="block w-full bg-teal text-white font-bold text-center py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            Claim 10 Free Credits & Unlock
        </button>
    );
}
