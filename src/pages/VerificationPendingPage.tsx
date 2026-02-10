import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function VerificationPendingPage() {
    const { currentPartner, logout } = useAuth();

    const getStatusInfo = (status: string | undefined) => {
        switch (status) {
            case 'pending_verification':
                return {
                    icon: Clock,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/20',
                    title: 'Verification Pending',
                    description: 'We are currently reviewing your documents. This process usually takes 24-48 hours.'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                    title: 'Application Rejected',
                    description: 'Your application was not approved. Please contact support for more information.'
                };
            case 'suspended':
                return {
                    icon: AlertTriangle,
                    color: 'text-red-500',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20',
                    title: 'Account Suspended',
                    description: 'Your account has been suspended due to policy violations. Please contact support.'
                };
            default:
                return {
                    icon: AlertTriangle,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/20',
                    title: 'Verification Incomplete',
                    description: 'Your account is under review or verification is pending.'
                };
        }
    };

    const statusInfo = getStatusInfo(currentPartner?.status);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-partner-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-partner-card border border-white/10 rounded-3xl p-8 text-center"
            >
                <div className={`mx-auto h-20 w-20 ${statusInfo.bgColor} rounded-full flex items-center justify-center mb-6`}>
                    <StatusIcon className={`h-10 w-10 ${statusInfo.color}`} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{statusInfo.title}</h2>
                <p className="text-gray-400 mb-8">{statusInfo.description}</p>

                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 mb-8 text-left">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Submitted Documents</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Aadhaar Card</span>
                            <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Uploaded
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Driving License</span>
                            <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Uploaded
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Vehicle RC</span>
                            <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Uploaded
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                    Sign Out
                </button>
            </motion.div>
        </div>
    );
}
