
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { mapService, type GeocodeResult } from '../services/mapService';
import type { SavedLocation } from '../types';
import { MapPin, Search, Plus, Trash2, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreferencesPage() {
    const { currentPartner } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);

    // We rely on currentPartner from AuthContext being updated via onSnapshot in AuthContext
    // Ideally AuthContext should listen to partner doc changes.
    // If not, we might need local state for immediate feedback or listen to doc here.
    const savedLocations = currentPartner?.savedLocations || [];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        const results = await mapService.geocode(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleAddLocation = async (result: GeocodeResult) => {
        if (!currentPartner) return;

        // Create a new SavedLocation object
        const newLocation: SavedLocation = {
            id: Date.now().toString(), // Simple ID generation
            name: result.name,
            address: `${result.street || ''} ${result.housenumber || ''}, ${result.city || ''}`.trim() || result.name,
            lat: result.point.lat,
            lng: result.point.lng,
            radius: 5 // Default radius 5km
        };

        try {
            const partnerRef = doc(db, 'partners', currentPartner.uid);
            await updateDoc(partnerRef, {
                savedLocations: arrayUnion(newLocation)
            });
            // Clear search after adding
            setSearchQuery('');
            setSearchResults([]);
            alert("Location added successfully!");
        } catch (error) {
            console.error("Error adding location:", error);
            alert("Failed to add location.");
        }
    };

    const handleRemoveLocation = async (location: SavedLocation) => {
        if (!currentPartner) return;

        try {
            const partnerRef = doc(db, 'partners', currentPartner.uid);
            await updateDoc(partnerRef, {
                savedLocations: arrayRemove(location)
            });
        } catch (error) {
            console.error("Error removing location:", error);
            alert("Failed to remove location.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 max-w-2xl mx-auto pb-24"
        >
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-white tracking-tight">Delivery Preferences</h1>
                <p className="text-gray-400 text-sm">Manage where you want to deliver.</p>
            </header>

            {/* Search Section */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    Add New Location
                </h3>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for area (e.g. Anna Nagar)..."
                        className="flex-1 bg-zinc-950 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {searchResults.map((result, index) => (
                            <div key={index} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                <div className="min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate">{result.name}</h4>
                                    <p className="text-zinc-500 text-xs truncate">
                                        {result.street} {result.city} {result.state} {result.country}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleAddLocation(result)}
                                    className="ml-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-emerald-400 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Saved Locations List */}
            <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4 text-purple-400" />
                    Saved Zones
                </h3>

                {savedLocations.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                        <MapPin className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-500 text-sm">No saved locations yet.</p>
                        <p className="text-zinc-600 text-xs mt-1">Add preferred areas to get matching orders.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {savedLocations.map((loc) => (
                            <div key={loc.id} className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-full border border-purple-500/20 mt-1">
                                        <MapPin className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{loc.name}</h4>
                                        <p className="text-zinc-400 text-xs">{loc.address}</p>
                                        <p className="text-zinc-600 text-[10px] mt-1">Radius: {loc.radius}km</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveLocation(loc)}
                                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Remove Location"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
