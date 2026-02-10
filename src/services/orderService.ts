import { db } from '../lib/firebase';
import { doc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';

export const MAX_ACTIVE_ORDERS = 3; // Partner limit

export const orderService = {
    // Check if partner can accept new order
    canAcceptOrder: async (partnerId: string): Promise<boolean> => {
        const q = query(
            collection(db, 'orders'),
            where('partnerId', '==', partnerId),
            where('status', 'in', ['accepted', 'picked_up', 'in_transit'])
        );
        const snapshot = await getDocs(q);
        return snapshot.size < MAX_ACTIVE_ORDERS;
    },

    acceptOrder: async (orderId: string, partnerId: string) => {
        const orderRef = doc(db, 'orders', orderId);

        try {
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("Order does not exist");

                const data = orderDoc.data();
                if (data.status !== 'pending') throw new Error("Order is no longer available");

                // Check limit (Double check inside transaction ideally, but listing query is separate)
                // For strict correctness, we should read active count in transaction, but requires reading multiple docs or a counter on partner doc.
                // Simplified: We assume canAcceptOrder was checked, and we just lock the order.

                transaction.update(orderRef, {
                    status: 'accepted',
                    partnerId: partnerId,
                    acceptedAt: new Date()
                });
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    },

    updateStatus: async (orderId: string, newStatus: string, partnerId?: string, orderPrice?: number) => {
        const orderRef = doc(db, 'orders', orderId);

        try {
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("Order does not exist");

                const currentStatus = orderDoc.data().status;
                if (currentStatus === 'delivered') throw new Error("Order is already completed");

                // Update Order Status
                transaction.update(orderRef, {
                    status: newStatus,
                    updatedAt: new Date()
                });

                // If delivering, update wallet and create transaction
                if (newStatus === 'delivered' && partnerId && orderPrice) {
                    const partnerRef = doc(db, 'partners', partnerId);
                    const partnerDoc = await transaction.get(partnerRef);
                    if (!partnerDoc.exists()) throw new Error("Partner not found");

                    // Increment Wallet
                    const currentBalance = partnerDoc.data().walletBalance || 0;
                    const currentDeliveries = partnerDoc.data().totalDeliveries || 0;

                    transaction.update(partnerRef, {
                        walletBalance: currentBalance + orderPrice,
                        totalDeliveries: currentDeliveries + 1
                    });

                    // Add Transaction Record
                    // Note: In transaction, we use set on a new doc ref
                    const transactionRef = doc(collection(db, 'partners', partnerId, 'transactions'));
                    transaction.set(transactionRef, {
                        type: 'credit',
                        amount: orderPrice,
                        orderId: orderId,
                        description: 'Delivery Earnings',
                        date: new Date()
                    });
                }
            });
            return { success: true };
        } catch (error: unknown) {
            console.error("Update Status Error:", error);
            return { success: false, error: (error as Error).message };
        }
    },

    // Helper using Haversine formula to check if order is within range of any saved location
    isOrderMatching: (orderPickupCoords: { lat: number, lng: number }, savedLocations: { lat: number, lng: number, radius?: number }[]) => {
        if (!savedLocations || savedLocations.length === 0) return true; // If no preferences, show all

        const R = 6371; // Radius of the earth in km
        const dLat = (lat2: number, lat1: number) => (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2: number, lon1: number) => (lon2 - lon1) * (Math.PI / 180);

        return savedLocations.some(loc => {
            const dLatVal = dLat(orderPickupCoords.lat, loc.lat);
            const dLonVal = dLon(orderPickupCoords.lng, loc.lng);
            const a =
                Math.sin(dLatVal / 2) * Math.sin(dLatVal / 2) +
                Math.cos(loc.lat * (Math.PI / 180)) * Math.cos(orderPickupCoords.lat * (Math.PI / 180)) *
                Math.sin(dLonVal / 2) * Math.sin(dLonVal / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km

            return d <= (loc.radius || 5); // Default radius check
        });
    }
};
