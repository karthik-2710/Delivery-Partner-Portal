import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import OrderCard from '../components/OrderCard';
import { orderService } from '../services/orderService';
import { mapService } from '../services/mapService';
import { PackageX, Archive, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersPage() {
    const { currentPartner } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMatchingOnly, setShowMatchingOnly] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'orders'),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(fetchedOrders);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Filter Logic
    useEffect(() => {
        const filterOrders = async () => {
            if (!currentPartner || !showMatchingOnly || !currentPartner.savedLocations || currentPartner.savedLocations.length === 0) {
                setFilteredOrders(orders);
                return;
            }

            // For each order, we need to check if it matches. 
            // Ideally coordinates should be stored on order creation to avoid geocoding repeatedly.
            // We will do client-side geocoding here CAUTIOUSLY (not recommended for production @ scale)
            const matching: Order[] = [];

            for (const order of orders) {
                // Try to get coords (Mocking or fetching if not present)
                // Note: In a real app, order.pickupCoords should exist.
                // We'll fallback to geocoding if needed, but throttle it.
                const results = await mapService.geocode(order.pickupLocation);
                if (results.length > 0) {
                    const pickupCoords = { lat: results[0].point.lat, lng: results[0].point.lng };
                    if (orderService.isOrderMatching(pickupCoords, currentPartner.savedLocations)) {
                        matching.push(order);
                    }
                } else {
                    // If can't geocode, maybe include it or exclude it? Excluding for strictness.
                }
            }
            setFilteredOrders(matching);
        };

        if (showMatchingOnly) {
            filterOrders();
        } else {
            setFilteredOrders(orders);
        }
    }, [orders, showMatchingOnly, currentPartner]);

    const handleAccept = async (orderId: string) => {
        if (!currentPartner) return;
        try {
            const canAccept = await orderService.canAcceptOrder(currentPartner.uid);
            if (!canAccept) {
                alert("You have reached your active order limit. Please deliver your current orders first.");
                return;
            }

            const result = await orderService.acceptOrder(orderId, currentPartner.uid);
            if (result.success) {
                alert("Order Accepted! Head to Active Deliveries to manage it.");
            } else {
                alert("Failed to accept order: " + result.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <div className="p-4 space-y-4 animate-pulse">
            <div className="h-20 bg-zinc-900 rounded-xl mb-6"></div>
            {[1, 2, 3].map(i => <div key={i} className="h-56 bg-zinc-900 rounded-2xl w-full"></div>)}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 pb-24"
        >
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Available Orders</h1>
                    <p className="text-gray-400 text-xs font-medium">Pick your next delivery</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMatchingOnly(!showMatchingOnly)}
                        className={`p-2 rounded-full border transition-colors ${showMatchingOnly ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}
                        title={showMatchingOnly ? "Show All Orders" : "Show Matching Only"}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <div className="bg-purple-500/10 p-2 rounded-full border border-purple-500/20">
                        <Archive className="w-5 h-5 text-purple-400" />
                    </div>
                </div>
            </header>

            {showMatchingOnly && (
                <div className="mb-4 px-3 py-2 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs">
                    Showing orders within your preferred zones.
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="bg-zinc-900 p-6 rounded-full mb-4 border border-zinc-800">
                            <PackageX className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg">No orders available</h3>
                        <p className="text-zinc-500 text-sm max-w-[200px] mt-2">
                            {showMatchingOnly ? "No orders match your preferences." : "Check back later for new delivery requests."}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAccept={handleAccept}
                                variant="pool"
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
