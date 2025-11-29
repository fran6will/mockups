import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import AuthButton from '@/components/ui/AuthButton';

export default function Header({ className = "" }: { className?: string }) {
    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${className}`}>
            {/* Magic Gradient Border */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal/20 to-transparent"></div>

            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="hover:opacity-80 transition-opacity group">
                        <Logo showText={true} />
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/animate" className="relative px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all group flex items-center gap-2">
                            Animate
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm group-hover:shadow-md transition-shadow">NEW</span>
                        </Link>
                        <Link href="/custom" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Custom</Link>
                        <Link href="/#gallery" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Gallery</Link>
                        <Link href="/pricing" className="px-4 py-2 rounded-full text-ink/60 hover:text-teal hover:bg-teal/5 font-medium transition-all">Pricing</Link>
                    </nav>
                </div>
                <AuthButton />
            </div>
        </header>
    );
}
