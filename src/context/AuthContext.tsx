"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean; // For future RBAC
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Hardcoded Super Admin
                if (currentUser.email === 'admin@kombucha.com') {
                    setIsAdmin(true);
                    setLoading(false);
                    return;
                }

                // Here we will eventually check custom claims or a user document
                // For now, assume false or check a hardcoded email
                try {
                    const token = await currentUser.getIdTokenResult();
                    // Script sets { role: 'admin' }, so we check that.
                    // Also supporting legacy { admin: true } if exists.
                    setIsAdmin(token.claims.role === 'admin' || !!token.claims.admin);
                } catch (e) {
                    console.error("Error checking admin claim", e);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
