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
    status: 'active' | 'pending' | 'suspended' | 'pending_verification' | 'rejected' | 'verified';
    walletBalance: number;
    activeOrderId?: string | null;
    totalDeliveries: number;
    savedLocations?: SavedLocation[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    joinedAt: any; // Using any to avoid complex Date/Timestamp type issues for now, TODO: strict type

    // KYC & Verification
    kyc?: {
        verified: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        verifiedAt?: any; // Firestore Timestamp
        method: 'digilocker' | 'manual' | 'digilocker_demo';
        aadharNumber?: string;
        documents: Array<{
            type: string;
            status: string;
            id?: string;
            url?: string;
        }>;
    };
}

export interface Order {
    id: string;
    trackingId: string;
    fromLocation: string; // Was pickupLocation
    toLocation: string;   // Was dropLocation
    distance: number;
    weight: number;
    price: number;
    commission: number;
    serviceName: string;
    status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    customerId: string; // userId in User Portal
    partnerId?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatedAt: any;
    createdAt?: any; // Add createdAt
}

export interface DigiLockerResponse {
    verified: boolean;
    aadharNumber: string;
    name: string;
    dob: string;
    gender: string;
    documents: Array<{
        type: string;
        status: string;
        id: string;
        url?: string;
    }>;
}
