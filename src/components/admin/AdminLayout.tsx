"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginScreen } from "@/components/admin/LoginScreen";
import { LayoutDashboard, ShoppingCart, Calendar, Users, Package, Settings, LogOut, Truck, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { label: "Agenda", href: "/admin/schedule", icon: Calendar },
    { label: "Clientes", href: "/admin/customers", icon: Users },
    { label: "Estoque", href: "/admin/inventory", icon: Package },
    { label: "Blog & Conteúdo", href: "/admin/content/posts", icon: FileText },
    { label: "Depoimentos", href: "/admin/content/testimonials", icon: MessageSquare },
    { label: "Configs", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const [role, setRole] = useState<string | null>(null);
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/admin");
        }
    }, [user, loading, router]);

    // Fetch Role effect
    useEffect(() => {
        async function determineRole() {
            if (!user) return;

            // Strategy: 
            // 1. If has Admin Claim (via script) -> Role = 'admin'. Skip Firestore.
            // 2. Else -> Fetch Firestore for granular roles (staff, content).

            if (isAdmin) {
                setRole('admin');
                setRoleLoading(false);
                return;
            }

            try {
                const { doc, getDoc, setDoc } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                const ref = doc(db, "memberships", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setRole(snap.data().role);
                } else {
                    // Safe Default: Create as STAFF (pending approval)
                    await setDoc(ref, { role: 'staff', email: user.email });
                    setRole('staff');
                }
            } catch (e) {
                console.error("Error fetching role", e);
            } finally {
                setRoleLoading(false);
            }
        }

        if (user && !loading) determineRole();
    }, [user, loading, isAdmin]);

    if (loading || (user && roleLoading)) {
        return <div className="flex h-screen items-center justify-center bg-paper text-olive">Carregando permissões...</div>;
    }

    if (!user) return <LoginScreen />;

    // If we have user but no role (blocked? or fetch error)
    if (!role) return (
        <div className="flex flex-col h-screen items-center justify-center bg-paper text-ink p-6 text-center">
            <h2 className="text-xl font-bold text-olive mb-2">Acesso Restrito</h2>
            <p className="mb-6 max-w-md text-ink/70">
                Sua conta não possui permissões administrativas ou houve um erro ao carregar seu perfil.
            </p>
            <button
                onClick={() => logout()}
                className="rounded-full bg-olive px-6 py-2 text-white font-bold uppercase tracking-wider hover:bg-olive/90 transition-colors"
            >
                Voltar para Login
            </button>
        </div>
    );

    const filteredNav = NAV_ITEMS.filter(item => {
        if (!role) return false;
        if (role === 'admin') return true;

        // Content Role
        if (role === 'content') {
            return ['/admin', '/admin/content/posts', '/admin/content/testimonials'].includes(item.href);
        }

        // Staff Role
        if (role === 'staff') {
            // Staff sees everything EXCEPT content management (maybe? user request said "content" role exists, implies separation)
            // Or Staff can see Orders, Schedule, Customers, Inventory.
            return ['/admin', '/admin/orders', '/admin/schedule', '/admin/customers', '/admin/inventory'].includes(item.href);
        }

        return false;
    });

    return (
        <div className="flex min-h-screen bg-paper2/50 text-ink">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-ink/10 bg-paper hidden md:flex flex-col">
                <div className="p-6 border-b border-ink/5">
                    <h1 className="font-serif text-xl font-bold text-olive">Kombistyle Ops</h1>
                    <p className="text-xs text-ink/50 mt-1">v1.0.0 (Phase 6)</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-olive/10 text-olive"
                                        : "text-ink/60 hover:bg-black/5 hover:text-ink"
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-ink/5">
                    <div className="mb-3 flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-olive text-paper flex items-center justify-center font-bold text-xs">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-xs font-bold text-ink">{user.email}</p>
                            <p className="text-[10px] text-ink/50">Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
