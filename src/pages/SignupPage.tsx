import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ChevronDown } from 'lucide-react'; // Using ChevronDown for select
import { motion } from 'framer-motion';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

            await setDoc(doc(db, 'partners', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleType: formData.vehicleType,
                status: 'active',
                walletBalance: 0,
                totalDeliveries: 0,
                joinedAt: serverTimestamp()
            });

            navigate('/');
        } catch (err: any) {
            setError('Failed to create account. ' + err.message);
        } finally {
            setLoading(false);
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

                <form className="mt-8 space-y-4 bg-partner-card/50 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-xl" onSubmit={handleSubmit}>
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
                        type="submit"
                        disabled={loading}
                        className="btn-primary mt-4 py-4 text-base"
                    >
                        {loading ? 'Creating Account...' : 'Register as Partner'}
                    </button>

                    <div className="text-center text-sm mt-6">
                        <span className="text-gray-400">Already a partner? </span>
                        <Link to="/login" className="text-partner-primary hover:text-partner-accent font-bold transition-colors">
                            Sign in
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
