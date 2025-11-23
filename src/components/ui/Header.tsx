import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/ui/AuthButton';

export default function Header({ className = "" }: { className?: string }) {
    return (
        <header className={`glass sticky top-4 z-50 mx-4 rounded-2xl border-white/40 mb-8 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/gallery" className="text-ink/60 hover:text-teal font-medium transition-colors">Gallery</Link>
                    </nav>
                </div>
                <AuthButton />
            </div>
        </header>
    );
}
