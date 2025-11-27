'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PurchaseTracker() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasFired = useRef(false);

    useEffect(() => {
        // Check for success flag
        const success = searchParams.get('payment_success');
        const valueStr = searchParams.get('value');
        
        if (success === 'true' && !hasFired.current) {
            hasFired.current = true;
            
            const value = valueStr ? parseFloat(valueStr) : 0.00;
            
            // Fire Meta Pixel Event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                    value: value,
                    currency: 'CAD',
                    content_name: 'Credit Pack or Subscription',
                });
                console.log('Purchase event tracked:', value);
            }

            // Optional: Clean up URL after a short delay
            setTimeout(() => {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.delete('payment_success');
                newParams.delete('value');
                
                // Keep other params (like checkout_id if needed for debug)
                router.replace(`/dashboard?${newParams.toString()}`, { scroll: false });
            }, 2000);
        }
    }, [searchParams, router]);

    return null; // Headless component
}
