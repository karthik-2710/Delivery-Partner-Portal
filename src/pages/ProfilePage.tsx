
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Truck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { currentPartner } = useAuth();

    if (!currentPartner) {
        return <div className="p-8 text-center text-zinc-500">Loading profile...</div>;
    }

    const infoItems = [
        { icon: User, label: "Full Name", value: currentPartner.name },
        { icon: Mail, label: "Email Address", value: currentPartner.email },
        { icon: Phone, label: "Phone Number", value: currentPartner.phone },
        { icon: Truck, label: "Vehicle Type", value: currentPartner.vehicleType.toUpperCase() },
        { icon: CreditCard, label: "Wallet Balance", value: `₹${currentPartner.walletBalance}` },
        { icon: Calendar, label: "Joined", value: new Date(currentPartner.joinedAt?.toDate()).toLocaleDateString() }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 pb-24 max-w-lg mx-auto"
        >
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-2xl font-bold text-white">{currentPartner.name.charAt(0)}</span>
                </div>
                <h1 className="text-2xl font-bold text-white">{currentPartner.name}</h1>
                <p className="text-zinc-400 text-sm">active partner</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                {infoItems.map((item, index) => (
                    <div
                        key={index}
                        className={`p-4 flex items-center gap-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors ${index % 2 === 0 ? 'bg-zinc-900/30' : ''}`}
                    >
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                            <p className="text-white font-medium">{item.value || 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button className="text-zinc-500 text-sm hover:text-white transition-colors underline decoration-zinc-700">
                    Edit Profile
                </button>
            </div>
        </motion.div>
    );
}
