'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
    productId: string;
    initialIsFavorited: boolean;
    className?: string;
}

export default function FavoriteButton({ productId, initialIsFavorited, className = '' }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a card
        e.stopPropagation();

        // Optimistic update
        setIsFavorited(!isFavorited);

        startTransition(async () => {
            const result = await toggleFavorite(productId);
            if (result.error) {
                // Revert if error (e.g., not logged in)
                setIsFavorited(initialIsFavorited);
                if (result.error === 'Unauthorized') {
                    router.push('/login'); // Or show a toast
                }
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${className} ${isFavorited
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-white/80 text-ink/40 hover:text-red-400 hover:bg-white'
                }`}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart
                size={20}
                className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
            />
        </button>
    );
}
