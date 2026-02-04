import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { Partner } from '../types';

interface AuthContextType {
    currentUser: User | null;
    currentPartner: Partner | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("AuthProvider: Loading timed out (5s). Force releasing.");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("AuthProvider: Auth state changed", user ? user.uid : 'No user');
            setCurrentUser(user);
            if (user) {
                // Fetch partner profile
                try {
                    const docRef = doc(db, 'partners', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        console.log("AuthProvider: Partner profile found");
                        setCurrentPartner(docSnap.data() as Partner);
                    } else {
                        console.warn("User logged in but no partner profile found");
                        setCurrentPartner(null);
                    }
                } catch (err) {
                    console.error("Error fetching partner profile:", err);
                    setCurrentPartner(null);
                }
            } else {
                setCurrentPartner(null);
            }
            clearTimeout(timer);
            setLoading(false);
        }, (error) => {
            console.error("Auth Listener Error:", error);
            clearTimeout(timer);
            setLoading(false);
        });

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, []);

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
