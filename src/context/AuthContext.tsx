"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean; // For future RBAC
    role: "admin" | "staff" | "content" | null;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    role: null,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState<"admin" | "staff" | "content" | null>(null);
    const devAdminUid = process.env.NEXT_PUBLIC_ADMIN_DEV_UID || "LLYbhjGPmTZL3N3FbgpuaDa1Agh2";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const token = await currentUser.getIdTokenResult();
                    const claimRole = token.claims.role;

                    let resolvedRole: "admin" | "staff" | "content" | null = null;
                    if (claimRole === 'admin' || claimRole === 'staff' || claimRole === 'content') {
                        resolvedRole = claimRole;
                    } else if (token.claims.admin) {
                        resolvedRole = 'admin';
                    } else if (process.env.NODE_ENV !== 'production' && currentUser.uid === devAdminUid) {
                        resolvedRole = 'admin';
                    }

                    setRole(resolvedRole);
                    setIsAdmin(resolvedRole === 'admin');
                } catch (e) {
                    console.error("Error checking admin claim", e);
                    setIsAdmin(false);
                    setRole(null);
                }
            } else {
                setIsAdmin(false);
                setRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, role, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
