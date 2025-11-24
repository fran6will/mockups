import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Twitter, Instagram, Mail, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative bg-teal text-cream overflow-hidden">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#footer-grid)" />
                </svg>
            </div>

            {/* Abstract Shape */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-cream/10 w-fit p-2 rounded-xl backdrop-blur-sm">
                            <Logo showText={true} />
                        </div>
                        <p className="text-cream/80 leading-relaxed">
                            Professional, AI-powered product mockups for modern sellers. Stop wasting time on photoshoots.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12">
                        <div>
                            <h4 className="font-bold text-lg mb-6 text-white">Product</h4>
                            <ul className="space-y-4 text-cream/70">
                                <li><Link href="/#gallery" className="hover:text-white transition-colors">Gallery</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6 text-white">Resources</h4>
                            <ul className="space-y-4 text-cream/70">
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
                            <ul className="space-y-4 text-cream/70">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">License</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream/60">
                    <p>© {new Date().getFullYear()} Nano Banana Pro. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart size={14} className="text-red-400 fill-red-400" /> for creators
                    </p>
                </div>
            </div>
        </footer>
    );
}
