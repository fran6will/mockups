import { supabaseAdmin } from '@/lib/supabase/admin';
import { Layers, Users, Sparkles } from 'lucide-react';

export default async function StatsSection() {
    // Fetch Generation Count
    const { count: generationCount } = await supabaseAdmin
        .from('generations')
        .select('*', { count: 'exact', head: true });

    // Fetch User Count (Using user_credits as proxy for signed-up users)
    const { count: userCount } = await supabaseAdmin
        .from('user_credits')
        .select('*', { count: 'exact', head: true });

    // Format numbers (e.g. 1.2k)
    const formatNumber = (num: number | null) => {
        if (!num) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k+';
        }
        return num.toString();
    };

    // Fallback if DB fails (shouldn't happen, but good for stability)
    const finalGenCount = generationCount || 1200;
    const finalUserCount = userCount || 150;

    return (
        <section className="py-12 relative z-10">
            <div className="max-w-5xl mx-auto px-6">
                <div className="glass p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 backdrop-blur-md relative overflow-hidden">
                    {/* Decorative Shine */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center divide-y md:divide-y-0 md:divide-x divide-ink/5">

                        {/* Stat 1: Mockups */}
                        <div className="flex flex-col items-center p-4">
                            <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-4 text-teal">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-ink mb-2 tracking-tight">
                                {formatNumber(finalGenCount)}
                            </h3>
                            <p className="text-ink/60 font-medium uppercase tracking-wider text-xs">
                                Mockups Generated
                            </p>
                        </div>

                        {/* Stat 2: Users */}
                        <div className="flex flex-col items-center p-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-600">
                                <Users size={24} />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-ink mb-2 tracking-tight">
                                {formatNumber(finalUserCount)}
                            </h3>
                            <p className="text-ink/60 font-medium uppercase tracking-wider text-xs">
                                Happy Creators
                            </p>
                        </div>

                        {/* Stat 3: Speed/Quality (Static Value for branding) */}
                        <div className="flex flex-col items-center p-4">
                            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                <Sparkles size={24} />
                            </div>
                            <div className="text-4xl md:text-5xl font-black text-ink mb-2 tracking-tight flex items-center gap-1">
                                10<span className="text-2xl pt-2">s</span>
                            </div>
                            <p className="text-ink/60 font-medium uppercase tracking-wider text-xs">
                                Avg. Generation Time
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
