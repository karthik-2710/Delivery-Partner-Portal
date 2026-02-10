import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ChevronDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import DigiLockerButton from '../components/DigiLocker/DigiLockerButton';
import type { DigiLockerResponse } from '../types';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike'
    });

    // KYC State
    const [kycData, setKycData] = useState<DigiLockerResponse | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    const [error, setError] = useState('');
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDigiLockerSuccess = (data: DigiLockerResponse) => {
        console.log("DigiLocker data received:", data);
        setKycData(data);
        setIsVerified(true);

        // Auto-fill available data
        if (data.name && !formData.name) {
            setFormData(prev => ({ ...prev, name: data.name }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isVerified || !kycData) {
            setError("Please complete DigiLocker verification to proceed.");
            return;
        }

        setLoadingStatus('Initializing...');
        setError('');

        try {
            // 1. Create Auth User
            setLoadingStatus('Creating User Account...');
            const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            // 2. Create Firestore Document
            setLoadingStatus('Finalizing Registration...');
            await setDoc(doc(db, 'partners', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleType: formData.vehicleType,
                status: 'verified', // Auto-verified via DigiLocker
                walletBalance: 0,
                totalDeliveries: 0,
                joinedAt: serverTimestamp(),
                kyc: {
                    verified: true,
                    verifiedAt: serverTimestamp(),
                    method: 'digilocker_demo',
                    aadharNumber: kycData.aadharNumber,
                    documents: kycData.documents
                }
            });

            navigate('/');
        } catch (err) {
            console.error("Signup Error:", err);
            setError('Failed to create account. ' + (err as Error).message);
        } finally {
            setLoadingStatus(null);
        }
    };

    return (
        <div className="min-h-screen bg-partner-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-partner-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 relative z-10"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ rotate: -10, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        className="mx-auto h-20 w-20 bg-partner-card border border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                    >
                        <Truck className="h-10 w-10 text-partner-primary" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Become a Partner</h2>
                    <p className="mt-2 text-gray-400">Join our delivery fleet today</p>
                </div>

                <div className="mt-8 space-y-4 bg-partner-card/50 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-xl">
                    <input
                        name="name"
                        type="text"
                        required
                        className="input-field bg-zinc-900/50"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        name="email"
                        type="email"
                        required
                        className="input-field bg-zinc-900/50"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                        name="phone"
                        type="tel"
                        required
                        className="input-field bg-zinc-900/50"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <div className="relative">
                        <select
                            name="vehicleType"
                            className="input-field appearance-none bg-zinc-900/50"
                            value={formData.vehicleType}
                            onChange={handleChange}
                        >
                            <option value="bike">Motorcycle</option>
                            <option value="scooter">Scooter</option>
                            <option value="car">Car/Van</option>
                            <option value="truck">Truck</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>

                    {/* KYC Section */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-partner-primary" />
                            Identity Verification
                        </h3>

                        <p className="text-xs text-gray-400 mb-2">
                            To ensure safety and trust, we require government-issued identity verification via DigiLocker.
                        </p>

                        <DigiLockerButton
                            isVerified={isVerified}
                            onVerified={handleDigiLockerSuccess}
                        />
                    </div>

                    <input
                        name="password"
                        type="password"
                        required
                        className="input-field bg-zinc-900/50"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!!loadingStatus || !isVerified}
                        className="btn-primary mt-4 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed group w-full"
                    >
                        {loadingStatus ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {loadingStatus}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                Register as Partner
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>

                    <div className="text-center text-sm mt-6">
                        <span className="text-gray-400">Already a partner? </span>
                        <Link to="/login" className="text-partner-primary hover:text-partner-accent font-bold transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
