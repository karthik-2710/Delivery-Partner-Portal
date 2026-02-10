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
        console.log(`[OrderService] Attempting to accept order: ${orderId} by ${partnerId}`);
        const orderRef = doc(db, 'orders', orderId);

        try {
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("Order does not exist");

                const data = orderDoc.data();
                console.log(`[OrderService] Order State: Status=${data.status}, Available=${data.isAvailable}, Partner=${data.partnerId}`);

                // VALIDATION: Check if order is truly available
                // 1. Status must be 'Pending' (Title Case from BookingCalculator)
                // 2. isAvailable must be true (if field exists - supporting legacy orders without it by fallback)
                // 3. partnerId must be null

                const isPending = data.status === 'Pending' || data.status === 'pending'; // Handle both for safety
                const isAvailable = data.isAvailable !== false; // Default to true if missing (legacy)
                const noPartner = !data.partnerId;

                if (!isPending || !isAvailable || !noPartner) {
                    throw new Error("Order is no longer available");
                }

                // ATOMIC UPDATE
                transaction.update(orderRef, {
                    status: 'Accepted', // Title Case
                    partnerId: partnerId,
                    isAvailable: false, // Lock the order
                    acceptedAt: new Date()
                });
            });
            console.log(`[OrderService] Successfully accepted order: ${orderId}`);
            return { success: true };
        } catch (error) {
            console.error("Accept Order Error:", error);
            return { success: false, error: (error as Error).message };
        }
    },

    updateStatus: async (orderId: string, newStatus: string, partnerId?: string) => {
        console.log(`[OrderService] UpdateStatus: ${orderId} -> ${newStatus} (Partner: ${partnerId})`);
        const orderRef = doc(db, 'orders', orderId);

        try {
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw new Error("Order does not exist");

                const currentStatus = orderDoc.data().status;
                console.log(`[OrderService] Current Status: ${currentStatus}`);

                if (currentStatus === 'Delivered' || currentStatus === 'delivered') throw new Error("Order is already completed");

                // PREPARE READS
                let partnerDoc = null;
                let partnerRef = null; // Declare partnerRef here
                const isDelivering = (newStatus === 'Delivered' || newStatus === 'delivered') && partnerId;

                if (isDelivering) {
                    partnerRef = doc(db, 'partners', partnerId!);
                    partnerDoc = await transaction.get(partnerRef);
                    if (!partnerDoc.exists()) throw new Error("Partner not found");
                }

                // ALL READS DONE. NOW WRITES.

                // 1. Update Order Status
                transaction.update(orderRef, {
                    status: newStatus,
                    updatedAt: new Date()
                });

                // 2. If delivering, update wallet and create transaction
                if (isDelivering && partnerDoc && partnerRef) {
                    console.log(`[OrderService] Processing Wallet Update for ${partnerId}`);
                    const commission = orderDoc.data().commission || 0;

                    // Increment Wallet
                    const currentBalance = partnerDoc.data().walletBalance || 0;
                    const currentDeliveries = partnerDoc.data().totalDeliveries || 0;

                    const newBalance = currentBalance + commission;
                    console.log(`[OrderService] Wallet: ${currentBalance} + ${commission} = ${newBalance}`);

                    transaction.update(partnerRef, {
                        walletBalance: newBalance,
                        totalDeliveries: currentDeliveries + 1
                    });

                    // Add Transaction Record
                    const transactionRef = doc(collection(db, 'partners', partnerId!, 'transactions'));
                    transaction.set(transactionRef, {
                        type: 'credit',
                        amount: commission,
                        orderId: orderId,
                        description: 'Delivery Commission',
                        date: new Date()
                    });
                }
            });
            console.log("[OrderService] Transaction Successful");
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
