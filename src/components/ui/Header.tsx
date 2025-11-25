import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/ui/AuthButton';

export default function Header({ className = "" }: { className?: string }) {
    return (
        <header className={`sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-ink/5 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/animate" className="text-ink/60 hover:text-teal font-medium transition-colors">Animate</Link>
                        <Link href="/#gallery" className="text-ink/60 hover:text-teal font-medium transition-colors">Gallery</Link>
                        <Link href="/pricing" className="text-ink/60 hover:text-teal font-medium transition-colors">Pricing</Link>
                    </nav>
                </div>
                <AuthButton />
            </div>
        </header>
    );
}
