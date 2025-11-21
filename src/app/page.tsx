import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 font-sans">
      <main className="glass max-w-2xl w-full rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative background blur element inside the card */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cream/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <Logo showText={false} className="scale-150" />
          </div>

          <h1 className="text-5xl font-bold text-ink mb-6 tracking-tight">
            CopiéCollé
          </h1>

          <p className="text-xl text-ink/70 mb-10 max-w-lg leading-relaxed">
            Create stunning, realistic product mockups in seconds using the power of Gemini AI.
            Upload your logo, choose your style, and let the engine do the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link
              href="/admin"
              className="flex-1 flex items-center justify-center gap-2 bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:scale-[1.02] transition-all shadow-lg shadow-teal/20"
            >
              <Sparkles size={20} />
              Admin Panel
            </Link>
            <div className="flex-1 flex items-center justify-center gap-2 bg-white/50 text-ink font-bold py-4 rounded-xl border border-white/60 hover:bg-white/80 transition-all cursor-not-allowed opacity-60" title="Coming Soon">
              View Gallery <ArrowRight size={20} />
            </div>
          </div>

          <div className="mt-12 text-sm text-ink/40 font-medium">
            v2.0 • Glassmorphism Edition
          </div>
        </div>
      </main>
    </div>
  );
}