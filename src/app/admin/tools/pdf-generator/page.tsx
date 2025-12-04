'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Sparkles, Download, ExternalLink } from 'lucide-react';
import Logo from '@/components/ui/Logo';

function PDFContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const password = searchParams.get('password'); // Optional, if we want to show it
    const title = searchParams.get('title') || 'Product Mockup';

    // Construct the full URL
    // Assuming the app is hosted at the current origin
    const downloadUrl = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`;

    return (
        <div className="w-[210mm] h-[297mm] bg-[#F2F0E9] mx-auto p-12 flex flex-col relative overflow-hidden print:m-0 print:w-full print:h-screen print:rounded-none shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal/10 rounded-full blur-[100px] -mr-32 -mt-32 print:bg-teal/20"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] -ml-32 -mb-32 print:bg-purple-500/10"></div>

            {/* Header */}
            <div className="flex justify-center mb-16 relative z-10">
                <div className="scale-150">
                    <Logo />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10">
                <div className="mb-8 inline-flex items-center justify-center w-20 h-20 bg-teal/10 rounded-full text-teal print:border print:border-teal/20">
                    <Sparkles size={40} />
                </div>

                <h1 className="text-4xl font-bold text-ink mb-6 tracking-tight uppercase">
                    ✨ Thank You For Your Purchase! ✨
                </h1>

                <p className="text-xl text-ink/70 max-w-2xl leading-relaxed mb-12">
                    We're thrilled you chose our mockup to showcase your beautiful designs!
                    Your high-resolution PSD file is ready to download and use right away.
                </p>

                {/* The Big Button / Link */}
                <div className="w-full max-w-md bg-white/50 backdrop-blur-xl p-2 rounded-3xl border border-white/60 shadow-xl mb-12 print:shadow-none print:border-ink/20">
                    <div className="bg-gradient-to-r from-teal to-teal/80 text-white p-8 rounded-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Access Your Files</p>
                        <div className="text-2xl font-bold break-all underline decoration-white/30 underline-offset-4 mb-4">
                            {downloadUrl}
                        </div>
                        {password && (
                            <div className="inline-block bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/30">
                                <span className="text-sm font-bold">Password: {password}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-ink/50 text-sm max-w-lg">
                    <p>
                        <strong>Tip:</strong> You can also try our AI Mockup Generator directly from the download page to create stunning images in seconds without Photoshop.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-ink/30 text-xs relative z-10 mt-auto">
                <p>&copy; {new Date().getFullYear()} Copié-Collé. All rights reserved.</p>
                <p className="mt-1">www.copiecolle.ai</p>
            </div>

            {/* Print Instructions (Hidden when printing) */}
            <div className="fixed bottom-8 right-8 print:hidden z-50 flex flex-col gap-2">
                <button
                    onClick={() => window.print()}
                    className="bg-teal text-white font-bold px-6 py-3 rounded-xl shadow-xl hover:bg-teal/90 transition-all flex items-center gap-2"
                >
                    <Download size={20} />
                    Save as PDF
                </button>
                <div className="bg-white p-4 rounded-xl shadow-xl text-xs text-ink/60 max-w-xs">
                    <p className="font-bold mb-1">Printing Tips:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Destination: <strong>Save as PDF</strong></li>
                        <li>Layout: <strong>Portrait</strong></li>
                        <li>Paper Size: <strong>A4</strong></li>
                        <li>Margins: <strong>None</strong></li>
                        <li>Options: Check <strong>Background graphics</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function PDFGeneratorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PDFContent />
        </Suspense>
    );
}
