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
                        .select('status, ends_at')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (subscription) {
                        console.log("DEBUG: Found subscription:", subscription);
                        const status = subscription.status?.toLowerCase();
                        const isActive = status === 'active' || status === 'on_trial' || status === 'trialing';

                        // Check if cancelled but still within the billing period
                        const isCancelledButValid = status === 'cancelled' &&
                            subscription.ends_at &&
                            new Date(subscription.ends_at) > new Date();

                        console.log("DEBUG: Subscription Status Check:", { isActive, isCancelledButValid, status: subscription.status, endsAt: subscription.ends_at });

                        if (isActive || isCancelledButValid) {
                            setAccessLevel('pro');
                            setIsLoading(false);
                            return;
                        }
                    } else {
                        console.log("DEBUG: No subscription found for user", user.id);
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
