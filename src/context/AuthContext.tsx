import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Partner } from '../types';

interface AuthContextType {
    currentUser: User | null;
    currentPartner: Partner | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: Initializing...");
        let unsubscribePartner: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            console.log("AuthProvider: Auth state changed", user ? user.uid : 'No user');
            setCurrentUser(user);

            // Cleanup previous partner listener if any
            if (unsubscribePartner) {
                console.log("AuthProvider: Unsubscribing from previous partner");
                unsubscribePartner();
                unsubscribePartner = null;
            }

            if (user) {
                // Subscribe to partner profile in real-time
                const docRef = doc(db, 'partners', user.uid);
                console.log("AuthProvider: Subscribing to partner profile...");

                unsubscribePartner = onSnapshot(docRef,
                    (docSnap) => {
                        if (docSnap.exists()) {
                            console.log("AuthProvider: Partner profile update received via Snapshot");
                            const partnerData = docSnap.data() as Partner;
                            setCurrentPartner(partnerData);
                            // Log specific wallet update if debugging
                            console.log("AuthProvider: Wallet Balance:", partnerData.walletBalance);
                        } else {
                            console.warn("User logged in but no partner profile found (Snapshot)");
                            setCurrentPartner(null);
                        }
                        setLoading(false);
                    },
                    (err) => {
                        console.error("Error listening to partner profile:", err);
                        setCurrentPartner(null);
                        setLoading(false);
                    }
                );
            } else {
                setCurrentPartner(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribePartner) unsubscribePartner();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    const value = {
        currentUser,
        currentPartner,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
