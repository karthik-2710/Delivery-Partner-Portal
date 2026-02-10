export interface SavedLocation {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    radius: number; // in km
}

export interface Partner {
    uid: string;
    name: string;
    email: string;
    phone: string;
    vehicleType: string;
    status: 'active' | 'pending' | 'suspended' | 'pending_verification' | 'rejected';
    walletBalance: number;
    activeOrderId?: string | null;
    totalDeliveries: number;
    savedLocations?: SavedLocation[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    joinedAt: any; // Using any to avoid complex Date/Timestamp type issues for now, TODO: strict type
}

export interface Order {
    id: string;
    pickupLocation: string;
    dropLocation: string;
    distance: number;
    weight: number;
    price: number;
    status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    customerId: string;
    partnerId?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createdAt: any; // Using any to avoid complex Date/Timestamp type issues for now, TODO: strict type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: any; // Using any to avoid complex Date/Timestamp type issues for now, TODO: strict type
}
