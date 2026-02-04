import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const partnerDoc = await getDoc(doc(db, 'partners', user.uid));

            if (partnerDoc.exists()) {
                navigate('/');
            } else {
                await signOut(auth);
                setError('This account is not registered as a partner.');
            }
        } catch (err: any) {
            setError('Failed to login. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-partner-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-partner-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 relative z-10"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="mx-auto h-20 w-20 bg-gradient-to-tr from-partner-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6 transform rotate-3"
                    >
                        <Truck className="h-10 w-10 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-white tracking-tight">Partner Portal</h2>
                    <p className="mt-2 text-gray-400 text-lg">Sign in to manage deliveries</p>
                </div>

                <form className="mt-8 space-y-6 bg-partner-card border border-white/5 p-8 rounded-3xl shadow-xl backdrop-blur-sm" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                className="input-field bg-zinc-900/50"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="input-field bg-zinc-900/50"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

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
                        className="btn-primary flex items-center justify-center gap-2 group"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">New partner? </span>
                        <Link to="/signup" className="text-partner-primary hover:text-partner-accent font-bold transition-colors">
                            Apply now
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
