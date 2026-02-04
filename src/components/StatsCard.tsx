import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: 'purple' | 'blue' | 'green' | 'orange';
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'purple' }: StatsCardProps) {
    const colorStyles = {
        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', ring: 'group-hover:ring-purple-500/30' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', ring: 'group-hover:ring-blue-500/30' },
        green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', ring: 'group-hover:ring-emerald-500/30' },
        orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', ring: 'group-hover:ring-orange-500/30' },
    };

    const style = colorStyles[color];

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card group cursor-default transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={clsx(
                    "p-3 rounded-xl border transition-all duration-300",
                    style.bg, style.text, style.border,
                    "ring-1 ring-transparent", style.ring
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            </div>

            {/* Decorative background glow */}
            <div className={clsx(
                "absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                style.bg.replace('/10', '')
            )} />
        </motion.div>
    );
}
