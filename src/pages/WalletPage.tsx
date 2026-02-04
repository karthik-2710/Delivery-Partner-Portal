import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, CreditCard, Banknote } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function WalletPage() {
    const { currentPartner } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentPartner) return;

        const fetchTransactions = async () => {
            const q = query(
                collection(db, 'partners', currentPartner.uid, 'transactions'),
                orderBy('date', 'desc'),
                limit(20)
            );

            const snapshot = await getDocs(q);
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        };

        fetchTransactions();
    }, [currentPartner]);

    // Loading Skeleton
    if (loading) return (
        <div className="p-4 space-y-6 animate-pulse">
            <div className="h-48 bg-zinc-800 rounded-2xl w-full"></div>
            <div className="space-y-3">
                <div className="h-6 w-32 bg-zinc-800 rounded"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl w-full"></div>)}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 pb-24"
        >
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white tracking-tight">Wallet</h1>
                <button className="bg-zinc-800 p-2 rounded-full border border-white/5 hover:bg-zinc-700 transition-colors">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                </button>
            </header>

            {/* Balance Card - Finance Grade */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 rounded-3xl p-6 mb-8 shadow-2xl shadow-indigo-900/30 border border-white/10 overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150 rotate-12">
                    <WalletIcon className="w-40 h-40" />
                </div>

                <div className="relative z-10">
                    <p className="text-indigo-200/80 text-sm font-medium mb-1 tracking-wide uppercase">Total Balance</p>
                    <h2 className="text-5xl font-bold text-white tracking-tight mb-8">₹{currentPartner?.walletBalance || 0}</h2>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.95] border border-white/10 backdrop-blur-md flex items-center justify-center gap-2">
                            <Banknote className="w-4 h-4" />
                            Withdraw
                        </button>
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-[0.95] border border-white/10 backdrop-blur-md flex items-center justify-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Add Bank
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                    <button className="text-xs text-partner-primary font-bold hover:underline">View All</button>
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="text-center py-12 card-glass">
                            <div className="bg-zinc-800 p-4 rounded-full inline-block mb-3">
                                <WalletIcon className="w-6 h-6 text-zinc-500" />
                            </div>
                            <p className="text-zinc-400 font-medium">No transactions yet</p>
                        </div>
                    ) : (
                        transactions.map((tx, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={tx.id}
                                className="bg-partner-card border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "p-3 rounded-xl",
                                        tx.type === 'credit' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                                    )}>
                                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm tracking-tight">{tx.description}</p>
                                        <p className="text-zinc-500 text-xs mt-0.5 font-medium">
                                            {tx.date?.toDate().toLocaleDateString()} • {tx.orderId ? `#${tx.orderId.slice(0, 5)}` : 'Transfer'}
                                        </p>
                                    </div>
                                </div>
                                <span className={clsx(
                                    "font-bold text-sm tracking-tight",
                                    tx.type === 'credit' ? "text-emerald-400" : "text-white"
                                )}>
                                    {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
