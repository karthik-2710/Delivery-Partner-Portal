import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StatsCard from '../components/StatsCard';
import { Wallet, Package, Clock, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const { currentPartner } = useAuth();
    const [stats, setStats] = useState({
        earnings: 0,
        activeOrders: 0,
        completedOrders: 0,
        availableOrders: 0
    });

    useEffect(() => {
        if (!currentPartner) return;

        // Listen to Active Orders count
        const qActive = query(
            collection(db, 'orders'),
            where('partnerId', '==', currentPartner.uid),
            where('status', 'in', ['accepted', 'picked_up', 'in_transit'])
        );

        // Listen to Available Orders (status == pending)
        const qAvailable = query(collection(db, 'orders'), where('status', '==', 'pending'));

        // Listen to Completed Orders and Earnings
        const qCompleted = query(
            collection(db, 'orders'),
            where('partnerId', '==', currentPartner.uid),
            where('status', '==', 'delivered')
        );

        const unsubActive = onSnapshot(qActive, (snap) => {
            setStats(prev => ({ ...prev, activeOrders: snap.size }));
        });

        const unsubAvailable = onSnapshot(qAvailable, (snap) => {
            setStats(prev => ({ ...prev, availableOrders: snap.size }));
        });

        const unsubCompleted = onSnapshot(qCompleted, (snap) => {
            const totalEarned = snap.docs.reduce((acc, doc) => acc + (doc.data().price || 0), 0);
            setStats(prev => ({ ...prev, completedOrders: snap.size, earnings: totalEarned }));
        });

        return () => {
            unsubActive();
            unsubAvailable();
            unsubCompleted();
        };
    }, [currentPartner]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-6 pb-24"
        >
            {/* Header Section */}
            <header className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 text-sm mt-1">Hello, {currentPartner?.name?.split(' ')[0]}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-partner-primary to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/40 border border-white/10">
                    {currentPartner?.name?.charAt(0)}
                </div>
            </header>

            {/* Quick Actions / Status */}
            {stats.activeOrders > 0 ? (
                <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                Active Delivery
                            </h3>
                            <p className="text-emerald-200/70 text-sm">You have orders in progress.</p>
                        </div>
                        <Link to="/active" className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]">
                            View
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-partner-primary/20 to-blue-900/20 border border-partner-primary/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">Ready to earn?</h3>
                        <p className="text-blue-200/70 text-sm mb-5 max-w-[70%]">There are <span className="text-white font-bold">{stats.availableOrders} orders</span> waiting for pickup in your area.</p>
                        <Link to="/orders" className="bg-white text-partner-primary hover:bg-gray-100 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 inline-flex items-center gap-2 transition-all active:scale-[0.98]">
                            <MapPin className="w-4 h-4" />
                            Find Orders
                        </Link>
                    </div>
                    {/* Decor */}
                    <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12">
                        <Package className="w-40 h-40 text-partner-primary" />
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="Earnings"
                    value={`₹${stats.earnings}`}
                    icon={Wallet}
                    color="green"
                    trend="+12%"
                    className="bg-zinc-900/50 border-emerald-500/20"
                />
                <StatsCard
                    title="Active"
                    value={stats.activeOrders}
                    icon={Clock}
                    color="blue"
                    className="bg-zinc-900/50 border-blue-500/20"
                />
                <StatsCard
                    title="Completed"
                    value={stats.completedOrders}
                    icon={CheckCircle2}
                    color="blue"
                    className="bg-zinc-900/50 border-blue-500/20"
                />
                <StatsCard
                    title="Available"
                    value={stats.availableOrders}
                    icon={Package}
                    color="orange"
                    className="bg-zinc-900/50 border-orange-500/20"
                />
            </div>

            {/* Manual Order Creation (For Test) */}
            <Link to="/create-order" className="block bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Create Manual Order</h4>
                        <p className="text-zinc-500 text-xs">For testing purposes</p>
                    </div>
                </div>
                <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
            </Link>

            {/* Recent Activity Teaser (Placeholder for visual fullness) */}
            <div className="bg-partner-card border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-bold text-lg mb-4">Weekly Goal</h3>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-partner-primary bg-partner-primary/10">
                                Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-partner-primary">
                                {Math.min(100, Math.round((stats.completedOrders / 20) * 100))}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-zinc-800">
                        <div style={{ width: `${Math.min(100, Math.round((stats.completedOrders / 20) * 100))}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-partner-primary"></div>
                    </div>
                    <p className="text-zinc-500 text-xs">Complete 20 orders to unlock bonus.</p>
                </div>
            </div>
        </motion.div>
    );
}
