import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ChevronDown, Upload, X, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'bike'
    });

    // KYC State
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        aadhaar: null,
        license: null,
        rcBook: null
    });
    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
        aadhaar: null,
        license: null,
        rcBook: null
    });

    const [error, setError] = useState('');
    const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validation: Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                setError(`${type.toUpperCase()} file size must be less than 5MB`);
                return;
            }

            // Validation: Image types
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError(`${type.toUpperCase()} must be a JPG or PNG image`);
                return;
            }

            setFiles(prev => ({ ...prev, [type]: file }));
            setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
            setError('');
        }
    };

    const removeFile = (type: string) => {
        setFiles(prev => ({ ...prev, [type]: null }));
        if (previews[type]) {
            URL.revokeObjectURL(previews[type]!);
            setPreviews(prev => ({ ...prev, [type]: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingStatus('Initializing...');
        setError('');

        console.log("Starting signup process...");

        try {
            // 1. Validation
            if (!files.aadhaar || !files.license || !files.rcBook) {
                throw new Error("All KYC documents (Aadhaar, License, RC Book) are required.");
            }

            // 2. Create Auth User
            setLoadingStatus('Creating User Account...');
            console.log("Creating user with email:", formData.email);
            const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            console.log("User created:", user.uid);

            // 3. Upload Documents
            const uploadFile = async (file: File, path: string, docName: string) => {
                setLoadingStatus(`Uploading ${docName}...`);
                console.log(`Uploading ${docName} to ${path}`);
                const storageRef = ref(storage, path);
                const snapshot = await uploadBytes(storageRef, file);
                console.log(`${docName} uploaded, getting URL...`);
                return await getDownloadURL(snapshot.ref);
            };

            const documents = {
                aadhaar: await uploadFile(files.aadhaar, `partners/${user.uid}/documents/aadhaar_${Date.now()}`, 'Aadhaar Card'),
                license: await uploadFile(files.license, `partners/${user.uid}/documents/license_${Date.now()}`, 'Driving License'),
                rcBook: await uploadFile(files.rcBook, `partners/${user.uid}/documents/rcBook_${Date.now()}`, 'Vehicle RC')
            };
            console.log("All documents uploaded.");

            // 4. Create Firestore Document
            setLoadingStatus('Finalizing Registration...');
            console.log("Creating Firestore document...");
            await setDoc(doc(db, 'partners', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleType: formData.vehicleType,
                status: 'pending_verification', // Initial status
                documents, // Store URLs
                walletBalance: 0,
                totalDeliveries: 0,
                joinedAt: serverTimestamp()
            });

            navigate('/');
        } catch (err) {
            console.error("Signup Error:", err);
            setError('Failed to create account. ' + (err as Error).message);
            // In a real app, we might want to delete the auth user if firestore/storage fails
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

                    {/* KYC Document Upload Section */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-partner-primary" />
                            KYC Documents
                        </h3>

                        {['aadhaar', 'license', 'rcBook'].map((docType) => (
                            <div key={docType} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-gray-300 capitalize text-sm font-medium">
                                        {docType === 'rcBook' ? 'Vehicle RC Book' : docType === 'aadhaar' ? 'Aadhaar Card (Front)' : 'Driving License'}
                                    </label>
                                    {files[docType] ? (
                                        <button
                                            type="button"
                                            onClick={() => removeFile(docType)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-500">*Required</span>
                                    )}
                                </div>

                                {previews[docType] ? (
                                    <div className="relative w-full h-32 bg-black/50 rounded-lg overflow-hidden border border-partner-primary/30">
                                        <img
                                            src={previews[docType]!}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <CheckCircle className="w-8 h-8 text-green-500 drop-shadow-md" />
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-partner-primary hover:bg-partner-primary/5 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-partner-primary transition-colors" />
                                            <p className="text-xs text-gray-500">
                                                <span className="font-semibold text-gray-300">Click to upload</span>
                                            </p>
                                            <p className="text-[10px] text-gray-600 mt-1">JPG, PNG (Max 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={(e) => handleFileChange(e, docType)}
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
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
                        disabled={!!loadingStatus}
                        className="btn-primary mt-4 py-4 text-base"
                    >
                        {loadingStatus ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {loadingStatus}
                            </span>
                        ) : 'Register as Partner'}
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
