'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, RefreshCw, Coins, User } from 'lucide-react';
import Header from '@/components/ui/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = ['francis.w.rheaume@gmail.com'];

            if (!session || !session.user.email || !adminEmails.includes(session.user.email.toLowerCase())) {
                router.push('/');
                return;
            }
            fetchUsers();
        };
        checkAdmin();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_credits')
            .select('*')
            .order('balance', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen font-sans text-ink bg-cream">
            <Header className="mb-8" />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-ink">User Credits</h1>
                            <p className="text-ink/60 text-sm">Monitor user balances and usage.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2 bg-white text-ink rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold text-sm"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-ink/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-bold text-ink/50 uppercase tracking-wider border-b border-ink/10">
                                    <th className="py-4 px-6">User</th>
                                    <th className="py-4 px-6">Balance</th>
                                    <th className="py-4 px-6">Total Used</th>
                                    <th className="py-4 px-6 text-right">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-ink">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-xs text-ink/40 font-mono mt-0.5">
                                                        {user.user_id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Coins size={16} className="text-yellow-500" />
                                                <span className="text-lg font-bold text-ink">{user.balance}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-ink/60">
                                                {user.total_used} credits
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right text-sm text-ink/60">
                                            {formatDate(user.updated_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && !loading && (
                        <div className="p-12 text-center text-ink/40">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No users found with credits.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="p-8 flex justify-center">
                            <Loader2 className="animate-spin text-teal" size={32} />
                        </div>
                    )}
                </div>

                {/* Manual Credit Adjustment */}
                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-ink/5">
                        <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                            <Coins size={24} className="text-teal" />
                            Manual Credit Adjustment
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">User Email</label>
                                <input
                                    type="email"
                                    id="creditEmail"
                                    className="w-full bg-gray-50 border border-ink/10 rounded-xl p-3 text-sm outline-none focus:border-teal transition-all"
                                    placeholder="user@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-ink/70 mb-1 uppercase tracking-wider">Amount to Add</label>
                                <input
                                    type="number"
                                    id="creditAmount"
                                    className="w-full bg-gray-50 border border-ink/10 rounded-xl p-3 text-sm outline-none focus:border-teal transition-all"
                                    placeholder="100"
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    const emailInput = document.getElementById('creditEmail') as HTMLInputElement;
                                    const amountInput = document.getElementById('creditAmount') as HTMLInputElement;
                                    const btn = document.getElementById('addCreditBtn') as HTMLButtonElement;

                                    if (!emailInput.value || !amountInput.value) {
                                        alert('Please fill in both fields');
                                        return;
                                    }

                                    btn.disabled = true;
                                    btn.innerText = 'Processing...';

                                    try {
                                        const { addUserCredits } = await import('../../actions');
                                        const result = await addUserCredits(emailInput.value, parseInt(amountInput.value));

                                        if (result.error) {
                                            alert('Error: ' + result.error);
                                        } else {
                                            alert(`Success! New balance: ${result.newBalance}`);
                                            emailInput.value = '';
                                            amountInput.value = '';
                                            fetchUsers();
                                        }
                                    } catch (e: any) {
                                        alert('Error: ' + e.message);
                                    } finally {
                                        btn.disabled = false;
                                        btn.innerText = 'Add Credits';
                                    }
                                }}
                                id="addCreditBtn"
                                className="w-full bg-teal text-white font-bold py-3 rounded-xl hover:bg-teal/90 transition-all shadow-lg shadow-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Credits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
