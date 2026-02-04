
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { mapService } from '../services/mapService';
import { motion } from 'framer-motion';
import { Package, MapPin, DollarSign, Truck } from 'lucide-react';

export default function ManualOrderPage() {
    const [formData, setFormData] = useState({
        pickupLocation: '',
        dropLocation: '',
        packageName: '',
        price: '',
        distance: '',
        weight: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Validate & Get Distance if empty (simple mockup)
            let distanceVal = parseFloat(formData.distance);
            if (!distanceVal || isNaN(distanceVal)) {
                // Try to calc distance via GraphHopper if possible, else default
                // For manual entry flexible:
                distanceVal = 5.0;
            }

            await addDoc(collection(db, 'orders'), {
                pickupLocation: formData.pickupLocation,
                dropLocation: formData.dropLocation,
                packageName: formData.packageName || 'Package',
                price: parseFloat(formData.price) || 100,
                weight: parseFloat(formData.weight) || 1.0,
                distance: distanceVal,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                customerId: 'manual_test_customer'
            });

            setMessage('Order created successfully! Go to "Available Orders" to accept it.');
            setFormData({
                pickupLocation: '',
                dropLocation: '',
                packageName: '',
                price: '',
                distance: '',
                weight: ''
            });
        } catch (error: any) {
            console.error("Error creating order:", error);
            setMessage("Failed to create order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 pb-24 max-w-lg mx-auto"
        >
            <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-white">Create Test Order</h1>
                <p className="text-zinc-400 text-sm">Manually add an order to the pool</p>
            </header>

            <form onSubmit={handleCreateOrder} className="space-y-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">

                {/* Pickup */}
                <div>
                    <label className="block text-zinc-400 text-xs mb-1">Pickup Location (Address/Area)</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                        <input
                            name="pickupLocation"
                            type="text"
                            required
                            placeholder="e.g. Phoenix Mall, Chennai"
                            value={formData.pickupLocation}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-emerald-500 outline-none"
                        />
                    </div>
                </div>

                {/* Drop */}
                <div>
                    <label className="block text-zinc-400 text-xs mb-1">Drop Location (Address/Area)</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-red-400" />
                        <input
                            name="dropLocation"
                            type="text"
                            required
                            placeholder="e.g. Central Station, Chennai"
                            value={formData.dropLocation}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:border-red-500 outline-none"
                        />
                    </div>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-zinc-400 text-xs mb-1">Package Name</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                            <input
                                name="packageName"
                                type="text"
                                placeholder="Documents"
                                value={formData.packageName}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-xs mb-1">Price (₹)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-yellow-400" />
                            <input
                                name="price"
                                type="number"
                                placeholder="150"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-zinc-400 text-xs mb-1">Weight (kg)</label>
                        <input
                            name="weight"
                            type="number"
                            step="0.1"
                            placeholder="2.5"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-4 text-white text-sm outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-xs mb-1">Distance (km)</label>
                        <input
                            name="distance"
                            type="number"
                            step="0.1"
                            placeholder="5.0"
                            value={formData.distance}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2 px-4 text-white text-sm outline-none"
                        />
                    </div>
                </div>

                {message && (
                    <div className={`text-sm text-center p-2 rounded-lg ${message.includes('success') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Creating...' : (
                        <>
                            <Truck className="w-4 h-4" /> Create Order
                        </>
                    )}
                </button>
            </form>
        </motion.div>
    );
}
