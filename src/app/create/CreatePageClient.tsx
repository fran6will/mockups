'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface CreatePageClientProps {
    children: React.ReactNode;
}

export default function CreatePageClient({ children }: CreatePageClientProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                setIsAuthenticated(true);
            } else {
                // Not logged in - redirect to home
                router.replace('/');
                return;
            }

            setIsLoading(false);
        };

        checkAuth();

        // Also listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.replace('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-grid-pattern bg-grain">
                <div className="text-center">
                    <Loader2 className="animate-spin text-teal mx-auto mb-4" size={48} />
                    <p className="text-ink/60 font-medium">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
