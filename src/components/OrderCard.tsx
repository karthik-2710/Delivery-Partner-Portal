import { Navigation, Package, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '../types';

interface OrderCardProps {
    order: Order;
    onAccept?: (id: string) => void;
    onUpdateStatus?: (id: string, status: string) => void;
    showActions?: boolean;
    variant?: 'pool' | 'active';
}

export default function OrderCard({ order, onAccept, onUpdateStatus, showActions = true, variant = 'pool' }: OrderCardProps) {

    const getStatusColor = (status: string) => {
        // Normalize status to lowercase for styling check, or just map Title Case
        const normalize = status.toLowerCase().replace(' ', '_');
        const colors: Record<string, string> = {
            pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            accepted: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            picked_up: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            in_transit: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            cancelled: 'text-red-400 bg-red-500/10 border-red-500/20'
        };
        return colors[normalize] || 'text-gray-400 bg-gray-500/10';
    };

    const renderActionBtn = () => {
        if (variant === 'pool' && onAccept) {
            return (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="py-3 px-4 rounded-xl border border-white/10 text-gray-400 font-medium text-sm hover:bg-white/5 transition-colors">
                        Ignore
                    </button>
                    <button
                        onClick={() => onAccept(order.id)}
                        className="btn-primary py-3 text-sm shadow-blue-500/20"
                    >
                        Accept Order
                    </button>
                </div>
            );
        }

        if (variant === 'active' && onUpdateStatus) {
            const btnProps = "w-full py-3 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]";
            // Statuses are now Title Case from backend: Pending, Accepted, Picked Up, In Transit, Delivered
            switch (order.status) {
                case 'Accepted':
                    return <button onClick={() => onUpdateStatus(order.id, 'Picked Up')} className={`${btnProps} bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20`}>Confirm Pickup</button>;
                case 'Picked Up':
                    return <button onClick={() => onUpdateStatus(order.id, 'In Transit')} className={`${btnProps} bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20`}>Start Delivery</button>;
                case 'In Transit':
                    return <button onClick={() => onUpdateStatus(order.id, 'Delivered')} className={`${btnProps} bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20`}>Complete Delivery</button>;
                case 'Delivered':
                    return <div className="w-full bg-emerald-500/10 text-emerald-400 text-center py-3 rounded-xl font-bold border border-emerald-500/20">Delivered Successfully</div>;
                default:
                    return null;
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card group hover:border-partner-primary/50 hover:shadow-partner-primary/10 transition-all duration-300 relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-partner-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                            {order.trackingId || order.id.slice(0, 8)}
                        </span>
                        {variant === 'active' && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-zinc-500 uppercase font-bold">Earn</span>
                            <IndianRupee className="w-4 h-4 text-emerald-400" />
                            <span className="text-xl font-bold text-white tracking-tight">{order.commission}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500">Order Value: ₹{order.price}</div>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:bg-partner-primary/10 group-hover:text-partner-primary transition-colors">
                    <Package className="w-5 h-5 text-zinc-400 group-hover:text-partner-primary transition-colors" />
                </div>
            </div>

            {/* Route Timeline */}
            <div className="relative pl-4 space-y-8 my-6">
                <div className="absolute left-[21px] top-3 bottom-8 w-0.5 bg-gradient-to-b from-zinc-700 to-zinc-800" />

                {/* Pickup */}
                <div className="relative">
                    <div className="absolute -left-4 top-1 w-3 h-3 bg-zinc-900 rounded-full ring-2 ring-zinc-600 group-hover:ring-partner-primary transition-all" />
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Pickup</p>
                    <p className="text-gray-200 text-sm font-medium leading-tight">{order.fromLocation}</p>
                </div>

                {/* Drop */}
                <div className="relative">
                    <div className="absolute -left-4 top-1 w-3 h-3 bg-zinc-900 rounded-full ring-2 ring-partner-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">Dropoff</p>
                    <p className="text-gray-200 text-sm font-medium leading-tight">{order.toLocation}</p>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs text-zinc-300 font-medium">{order.distance} km</span>
                </div>
                <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-xs text-zinc-300 font-medium">{order.weight} kg</span>
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className="mt-2">
                    {renderActionBtn()}
                </div>
            )}
        </motion.div>
    );
}
