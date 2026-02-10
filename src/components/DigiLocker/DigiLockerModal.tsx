import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import type { DigiLockerResponse } from '../../types';

interface DigiLockerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: DigiLockerResponse) => void;
}

export default function DigiLockerModal({ isOpen, onClose, onSuccess }: DigiLockerModalProps) {
    const [step, setStep] = useState<'aadhaar' | 'otp' | 'consent' | 'success'>('aadhaar');
    const [aadhaar, setAadhaar] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAadhaarSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('consent');
        }, 1500);
    };

    const handleConsent = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('success');
            setTimeout(() => {
                console.log("DigiLocker Demo: Sending success data...");
                onSuccess({
                    verified: true,
                    aadharNumber: "XXXX-XXXX-" + aadhaar.slice(-4), // Masked
                    name: "Demo User",
                    dob: "01-01-2000",
                    gender: "M",
                    documents: [
                        { type: "aadhaar", status: "verified_demo", id: "DEMO-UID-123" },
                        { type: "driving_license", status: "verified_demo", id: "DEMO-DL-123" },
                        { type: "vehicle_rc", status: "verified_demo", id: "DEMO-RC-123" }
                    ]
                });
                onClose();
            }, 1000);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-orange-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/2/25/DigiLocker_logo.png" alt="DigiLocker" className="h-8 brightness-0 invert" />
                                <span className="text-white font-bold text-lg">Verification (DEMO)</span>
                            </div>
                            {step !== 'success' && !loading && (
                                <button onClick={onClose} className="text-white/80 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {step === 'aadhaar' && (
                                <form onSubmit={handleAadhaarSubmit} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <ShieldCheck className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                                        <h3 className="text-xl font-bold text-gray-800">Demo Identity Check</h3>
                                        <p className="text-sm text-gray-500">Enter any 12-digit number for demo verification</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Aadhaar Number (Demo)</label>
                                        <input
                                            type="text"
                                            value={aadhaar}
                                            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                            placeholder="0000 0000 0000"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none text-lg tracking-widest text-center"
                                            required
                                            minLength={12}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || aadhaar.length !== 12}
                                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Next (Demo)'}
                                    </button>
                                </form>
                            )}

                            {step === 'otp' && (
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Enter Demo OTP</h3>
                                        <p className="text-sm text-gray-500">Any 6-digit code will work</p>
                                    </div>

                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="123456"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none text-2xl tracking-[1em] text-center"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP (Demo)'}
                                    </button>
                                </form>
                            )}

                            {step === 'consent' && (
                                <div className="space-y-6 text-center">
                                    <ShieldCheck className="w-16 h-16 text-orange-500 mx-auto" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Demo Consent</h3>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Allow access to demo documents? <br />
                                            <span className="text-xs text-orange-600">(No real data will be shared)</span>
                                        </p>
                                        <ul className="text-left text-sm text-gray-600 mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" /> Demo Aadhaar
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500" /> Demo Driving License
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Deny
                                        </button>
                                        <button
                                            onClick={handleConsent}
                                            disabled={loading}
                                            className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Allow (Demo)'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Demo Verification Complete</h3>
                                    <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Branding */}
                        <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                            <p className="text-xs text-gray-400">Secured by DigiLocker • Government of India</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
