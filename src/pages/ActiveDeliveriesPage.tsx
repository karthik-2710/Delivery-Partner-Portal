import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';
import OrderCard from '../components/OrderCard';
import { orderService } from '../services/orderService';
import { Truck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryMap from '../components/Map/DeliveryMap';
import { mapService } from '../services/mapService';

export default function ActiveDeliveriesPage() {
    const { currentPartner } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Map State
    const [riderLocation, setRiderLocation] = useState<[number, number] | undefined>(undefined);
    const [pickupCoords, setPickupCoords] = useState<[number, number] | undefined>(undefined);
    const [dropCoords, setDropCoords] = useState<[number, number] | undefined>(undefined);
    const [routePoints, setRoutePoints] = useState<[number, number][] | undefined>(undefined);

    useEffect(() => {
        if (!currentPartner) return;

        const q = query(
            collection(db, 'orders'),
            where('partnerId', '==', currentPartner.uid),
            where('status', 'in', ['accepted', 'picked_up', 'in_transit'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            setOrders(fetchedOrders);
            setLoading(false);
        });

        // Get Rider Location
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setRiderLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => console.error("Location error:", error),
                { enableHighAccuracy: true }
            );
            return () => {
                unsubscribe();
                navigator.geolocation.clearWatch(watchId);
            };
        } else {
            return unsubscribe;
        }

    }, [currentPartner]);

    // Effect to calculate route for the first active order
    useEffect(() => {
        const fetchRoute = async () => {
            if (orders.length === 0) return;
            const activeOrder = orders[0]; // Focus on the first active order

            // Geocode Pickup
            let start = pickupCoords;
            if (!start) {
                const pickups = await mapService.geocode(activeOrder.pickupLocation);
                if (pickups.length > 0) {
                    start = [pickups[0].point.lat, pickups[0].point.lng];
                    setPickupCoords(start);
                }
            }

            // Geocode Drop
            let end = dropCoords;
            if (!end) {
                const drops = await mapService.geocode(activeOrder.dropLocation);
                if (drops.length > 0) {
                    end = [drops[0].point.lat, drops[0].point.lng];
                    setDropCoords(end);
                }
            }

            // Get Route
            if (start && end) {
                const routeData = await mapService.getRoute(start, end);
                if (routeData && routeData.paths.length > 0) {
                    const points = mapService.decodePolyline(routeData.paths[0].points);
                    setRoutePoints(points);
                }
            }
        };

        fetchRoute();
    }, [orders]); // Re-run if orders change (e.g. status update or new order)

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        if (!currentPartner) return;
        const order = orders.find(o => o.id === orderId);
        const price = order ? order.price : 0;
        const result = await orderService.updateStatus(orderId, newStatus, currentPartner.uid, price);

        if (!result.success) {
            alert("Failed to update status: " + result.error);
        }
    };

    if (loading) return (
        <div className="p-4 space-y-4 animate-pulse">
            <div className="h-20 bg-zinc-900 rounded-xl mb-6"></div>
            {[1, 2].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-2xl w-full"></div>)}
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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Active Deliveries</h1>
                    <p className="text-gray-400 text-xs font-medium">Manage your current tasks</p>
                </div>
                <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
                    <Truck className="w-5 h-5 text-emerald-400" />
                </div>
            </header>

            {/* Map View */}
            {orders.length > 0 && pickupCoords && (
                <div className="mb-6 h-64 w-full rounded-xl overflow-hidden border border-zinc-800 shadow-lg relative">
                    <DeliveryMap
                        start={pickupCoords}
                        end={dropCoords}
                        riderLocation={riderLocation}
                        routePoints={routePoints}
                    />
                    <div className="absolute top-2 right-2 z-[1000] bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-zinc-700 shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>Live Tracking</span>
                    </div>
                </div>
            )}

            <AnimatePresence mode="popLayout">
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="bg-zinc-900 p-6 rounded-full mb-4 border border-zinc-800">
                            <Truck className="w-10 h-10 text-zinc-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg">No active deliveries</h3>
                        <p className="text-zinc-500 text-sm max-w-[200px] mt-2">You are not delivering anything right now.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                variant="active"
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
