'use client';

import { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, X, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface UnlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: (credits: number) => void;
    productId: string;
    productSlug: string;
    isFree: boolean;
    user: any;
    passwordInput: string;
    setPasswordInput: (val: string) => void;
    emailInput: string;
    setEmailInput: (val: string) => void;
}

export default function UnlockModal({
    isOpen,
    onClose,
    onUnlock,
    productId,
    productSlug,
    isFree,
    user,
    passwordInput,
    setPasswordInput,
    emailInput,
    setEmailInput
}: UnlockModalProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const [unlockError, setUnlockError] = useState('');
    const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);

    if (!isOpen) return null;

    const handleUnlockAndClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsClaiming(true);
        setUnlockError('');

        try {
            const response = await fetch('/api/claim-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    password: passwordInput,
                    email: emailInput
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unlock');
            }

            // Success
            onUnlock(data.balance);

            if (!user) {
                localStorage.setItem('user_email', emailInput);
            }

            // Persist unlocked state for this product
            const unlockedProducts = JSON.parse(localStorage.getItem('unlocked_products') || '[]');
            if (!unlockedProducts.includes(productSlug)) {
                unlockedProducts.push(productSlug);
                localStorage.setItem('unlocked_products', JSON.stringify(unlockedProducts));
            }

            onClose();

        } catch (err: any) {
            setUnlockError(err.message);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                <div className="p-6 border-b border-ink/5 flex justify-between items-center bg-cream/50">
                    <div>
                        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                            <Lock size={20} className="text-teal" /> Unlock Template
                        </h2>
                        <p className="text-xs text-ink/50 mt-1">
                            {isFree
                                ? "Create a free account to get 5 free credits."
                                : "Enter your Etsy access code to unlock."
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-ink/5 rounded-full text-ink/50 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-ink/70 mb-4">
                            You need to unlock this premium template before generating the high-res mockup.
                        </p>

                        {user && (
                            <div className="p-3 bg-teal/5 rounded-xl flex items-center gap-3 border border-teal/10 mb-6">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-teal font-bold text-xs border border-teal/10">
                                    <CheckCircle size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-ink/50 uppercase">Logged in as</p>
                                    <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        {showAccessCodeInput || isFree ? (
                            <form onSubmit={handleUnlockAndClaim} className="space-y-4">
                                {!user && (
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                                        <input
                                            type="email"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-sans placeholder:font-sans"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                )}

                                {!isFree && (
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={16} />
                                        <input
                                            type="text"
                                            value={passwordInput}
                                            onChange={(e) => {
                                                setPasswordInput(e.target.value);
                                                setUnlockError('');
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-teal/20 focus:border-teal outline-none transition-all font-mono placeholder:font-sans"
                                            placeholder="Enter Access Code"
                                            required
                                        />
                                    </div>
                                )}

                                {unlockError && (
                                    <p className="text-red-500 text-xs font-bold ml-1">{unlockError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isClaiming}
                                    className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isClaiming ? <Loader2 className="animate-spin" /> : <>Unlock & Generate <ArrowRight size={18} /></>}
                                </button>

                                {!user && (
                                    <p className="text-xs text-ink/40 text-center">
                                        We'll link your credits to this email.
                                    </p>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <a
                                    href="/pricing"
                                    className="w-full bg-teal text-cream font-bold py-4 rounded-xl hover:bg-teal/90 hover:shadow-lg hover:shadow-teal/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} /> Get Unlimited Access
                                </a>
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-ink/5" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-ink/40 font-bold">Or</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAccessCodeInput(true)}
                                    className="w-full bg-white border border-ink/10 text-ink font-bold py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Enter Etsy Access Code
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
