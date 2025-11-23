import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export type AccessLevel = 'guest' | 'pro' | 'none';

export function useAccess(productSlug?: string) {
    const [accessLevel, setAccessLevel] = useState<AccessLevel>('none');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkAccess() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Check for active subscription
                    const { data: subscription } = await supabase
                        .from('subscriptions')
                        .select('status')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (subscription) {
                        setAccessLevel('pro');
                        setIsLoading(false);
                        return;
                    }
                }

                // Check for guest access (password/token)
                // This part depends on how we store guest access. 
                // For now, we'll check a local storage token or a cookie.
                // Assuming we store a list of unlocked slugs in localStorage for simplicity in this MVP.
                if (productSlug) {
                    const unlockedProducts = JSON.parse(localStorage.getItem('unlocked_products') || '[]');
                    if (unlockedProducts.includes(productSlug)) {
                        setAccessLevel('guest');
                        setIsLoading(false);
                        return;
                    }
                }

                setAccessLevel('none');
            } catch (error) {
                console.error('Error checking access:', error);
                setAccessLevel('none');
            } finally {
                setIsLoading(false);
            }
        }

        checkAccess();
    }, [productSlug, supabase]);

    return { accessLevel, isLoading };
}
