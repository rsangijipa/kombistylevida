"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginScreen } from "@/components/admin/LoginScreen";
import { LayoutDashboard, ShoppingCart, Calendar, Users, Package, Settings, LogOut, Truck, FileText, MessageSquare, Tag, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { label: "Agenda", href: "/admin/agenda", icon: Calendar },
    { label: "Clientes", href: "/admin/customers", icon: Users },
    { label: "Logística", href: "/admin/delivery", icon: Truck },
    { label: "Estoque", href: "/admin/inventory", icon: Package },
    { label: "Produtos", href: "/admin/products", icon: Tag },
    { label: "Combos", href: "/admin/combos", icon: ShoppingBag },
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
            // 1. If Super Admin (Hardcoded) -> Role = 'admin'
            // 2. If has Admin Claim (via script) -> Role = 'admin'. Skip Firestore.
            // 3. Else -> Fetch Firestore for granular roles (staff, content).

            if (user.email === 'admin@kombucha.com') {
                setRole('admin');
                setRoleLoading(false);
                return;
            }

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
            return ['/admin', '/admin/orders', '/admin/delivery', '/admin/schedule', '/admin/customers', '/admin/inventory'].includes(item.href);
        }

        return false;
    });

    return (
        <div className="flex min-h-screen bg-paper text-ink selection:bg-olive/20">
            {/* Background Texture (Shared with SiteShell) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply bg-[url('/images/paper-texture.png')] bg-repeat" />

            {/* Sidebar (Desktop) */}
            <aside className="fixed left-0 top-0 h-full w-64 border-r border-ink/10 bg-paper/80 backdrop-blur-sm hidden md:flex flex-col z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                <div className="p-8 border-b border-ink/5">
                    <div className="relative h-12 w-full mb-4 opacity-90">
                        {/* Use logo image or text */}
                        <div className="font-serif text-3xl font-bold text-ink hover:text-olive transition-colors cursor-default tracking-tight">Kombucha Arikê</div>
                        <div className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-olive pl-1">Admin Panel</div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-olive text-white shadow-lg shadow-olive/20 translate-x-1"
                                        : "text-ink/60 hover:bg-paper2 hover:text-ink hover:translate-x-1"
                                )}
                            >
                                <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-olive/70")} />
                                <span className={cn("font-sans tracking-wide", isActive ? "font-bold" : "")}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-ink/5 bg-paper2/50">
                    <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-white/50 border border-ink/5 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-olive text-white flex items-center justify-center font-serif font-bold text-lg shadow-inner">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-xs font-bold text-ink uppercase tracking-wider">Admin</p>
                            <p className="truncate text-[10px] text-ink/50 font-mono">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-olive border border-olive/20 hover:bg-olive hover:text-white transition-all duration-300"
                        >
                            <Truck size={14} />
                            Ver Loja
                        </Link>
                        <button
                            onClick={() => logout()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={14} />
                            Sair
                        </button>
                    </div>
                </div>
                {/* Env Fingerprint */}
                <div className="px-6 pb-2 text-center">
                    <p className="text-[9px] font-mono text-ink/20 break-all select-all">
                        PID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '---'}
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-paper/90 backdrop-blur-md border-b border-ink/5 flex items-center justify-between px-6 md:hidden z-30 shadow-sm">
                <span className="font-serif text-xl font-bold text-ink">Kombucha Arikê <span className="text-olive text-sm uppercase tracking-wider ml-1">Ops</span></span>
                <button onClick={() => logout()} className="p-2 text-ink/40 hover:text-red-500 active:scale-95 transition-transform">
                    <LogOut size={20} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="ml-0 md:ml-64 flex-1 p-4 pt-20 md:p-10 md:pt-10 pb-24 md:pb-10 relative z-0">
                <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-lg border-t border-ink/5 flex justify-around p-3 md:hidden z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                {filteredNav.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95",
                                isActive
                                    ? "text-olive bg-olive/10 translate-y-[-2px]"
                                    : "text-ink/40 active:text-ink"
                            )}
                        >
                            <item.icon size={20} className={isActive ? "fill-current" : ""} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
