
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryMapProps {
    start: [number, number]; // [lat, lng]
    end?: [number, number];
    riderLocation?: [number, number];
    routePoints?: [number, number][]; // Decoded polyline
    className?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom || map.getZoom());
    }, [center, zoom, map]);
    return null;
}

function RouteFitter({ points }: { points: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

export default function DeliveryMap({ start, end, riderLocation, routePoints, className }: DeliveryMapProps) {
    // Default to Chennai, India if no start/rider location
    const defaultCenter: [number, number] = [13.0827, 80.2707];
    const center = riderLocation || start || defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            className={`w-full h-full rounded-xl z-0 ${className}`}
            style={{ minHeight: '300px' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Rider Location */}
            {riderLocation && (
                <Marker position={riderLocation}>
                    <Popup>You are here</Popup>
                </Marker>
            )}

            {/* Pickup Location */}
            <Marker position={start}>
                <Popup>Pickup Location</Popup>
            </Marker>

            {/* Drop Location */}
            {end && (
                <Marker position={end}>
                    <Popup>Drop Location</Popup>
                </Marker>
            )}

            {/* Route Polyline */}
            {routePoints && routePoints.length > 0 && (
                <Polyline positions={routePoints} color="blue" />
            )}

            <MapUpdater center={center} />
            {routePoints && <RouteFitter points={routePoints} />}
        </MapContainer>
    );
}
