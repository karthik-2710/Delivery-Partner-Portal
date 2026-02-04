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
    status: 'active' | 'pending' | 'suspended';
    walletBalance: number;
    activeOrderId?: string | null;
    totalDeliveries: number;
    savedLocations?: SavedLocation[];
    joinedAt: any;
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
    createdAt: any;
    updatedAt: any;
}
