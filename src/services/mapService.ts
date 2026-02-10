
const GRAPHHOPPER_KEY = import.meta.env.VITE_GRAPHHOPPER_API_KEY;
const BASE_URL = 'https://graphhopper.com/api/1';

export interface RouteData {
    paths: {
        distance: number;
        time: number;
        points: string; // encoded polyline
        bbox: number[];
    }[];
}

export interface GeocodeResult {
    point: {
        lat: number;
        lng: number;
    };
    name: string;
    country: string;
    city?: string;
    state?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
}

export const mapService = {
    getRoute: async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
        try {
            const response = await fetch(
                `${BASE_URL}/route?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&vehicle=car&key=${GRAPHHOPPER_KEY}&points_encoded=true`
            );
            if (!response.ok) throw new Error('Failed to fetch route');
            return await response.json();
        } catch (error) {
            console.error("Route error:", error);
            return null;
        }
    },

    geocode: async (query: string): Promise<GeocodeResult[]> => {
        try {
            const response = await fetch(
                `${BASE_URL}/geocode?q=${encodeURIComponent(query)}&key=${GRAPHHOPPER_KEY}&limit=5`
            );
            if (!response.ok) throw new Error('Geocoding failed');
            const data = await response.json();
            return data.hits;
        } catch (error) {
            console.error("Geocode error:", error);
            return [];
        }
    },

    reverseGeocode: async (lat: number, lng: number): Promise<GeocodeResult | null> => {
        try {
            const response = await fetch(
                `${BASE_URL}/geocode?point=${lat},${lng}&reverse=true&key=${GRAPHHOPPER_KEY}`
            );
            if (!response.ok) throw new Error('Reverse geocoding failed');
            const data = await response.json();
            return data.hits[0] || null;
        } catch (error) {
            console.error("Reverse geocode error:", error);
            return null;
        }
    },

    decodePolyline: (encoded: string): [number, number][] => {
        const points: [number, number][] = [];
        let index = 0;
        const len = encoded.length;
        let lat = 0, lng = 0;

        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            points.push([lat / 1e5, lng / 1e5]);
        }
        return points;
    }
};
