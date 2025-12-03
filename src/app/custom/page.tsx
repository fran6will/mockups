import { Suspense } from 'react';
import CustomMockupContent from './CustomMockupContent';
import Header from '@/components/ui/Header';
import { Loader2 } from 'lucide-react';

export default function CustomMockupPage() {
    return (
        <div className="min-h-screen bg-cream font-sans text-ink">
            <Header />
            <main className="max-w-5xl mx-auto px-6 py-12">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="animate-spin text-teal" size={48} />
                    </div>
                }>
                    <CustomMockupContent />
                </Suspense>
            </main>
        </div>
    );
}
