"use client";

import React, { useEffect, useState } from "react";
import { useAuth, AuthProvider } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Customer, Order } from "@/types/firestore";
import { Search, Plus, Minus, User as UserIcon, RefreshCw, Star, ShoppingBag, Calendar, MapPin, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";

import { useCustomersRealtime } from "@/hooks/useCustomersRealtime";
import type { User as FirebaseUser } from "firebase/auth";

export default function CustomersPage() {
    return (
        <AuthProvider>
            <CustomersContent />
        </AuthProvider>
    );
}

function CustomersContent() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { customers, loading, error, refresh, hasMore, loadMore, loadingMore } = useCustomersRealtime(50, debouncedSearch);
    const [selectedPhones, setSelectedPhones] = useState<string[]>([]);
    const [bulkPoints, setBulkPoints] = useState(1);
    const [bulkReason, setBulkReason] = useState("");
    const [bulkBusy, setBulkBusy] = useState(false);

    // Detail Modal State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [viewMode, setViewMode] = useState<'DETAILS' | 'ADJUST'>('DETAILS'); // DETAILS shows history/info, ADJUST shows points


    const handleToggleVip = async (customer: Customer) => {
        if (!user) return;
        const newState = !customer.isSubscriber;
        if (confirm(`Confirmar: ${newState ? "Tornar" : "Remover"} VIP para ${customer.name}?`)) {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'TOGGLE_SUBSCRIPTION',
                    phone: customer.phone,
                    isSubscriber: newState,
                    adminUid: user.uid
                })
            });

            if (res.ok) {
                // Realtime listener will update UI
                if (selectedCustomer?.phone === customer.phone) {
                    setSelectedCustomer(prev => prev ? { ...prev, isSubscriber: newState } : null);
                }
            }
        }
    };

    useEffect(() => {
        const t = window.setTimeout(() => setDebouncedSearch(searchTerm), 250);
        return () => window.clearTimeout(t);
    }, [searchTerm]);

    const filteredCustomers = customers;

    const allVisibleSelected = filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedPhones.includes(c.phone));

    const toggleSelectCustomer = (phone: string, checked: boolean) => {
        setSelectedPhones((prev) => {
            if (checked) return Array.from(new Set([...prev, phone]));
            return prev.filter((item) => item !== phone);
        });
    };

    const toggleSelectAllVisible = (checked: boolean) => {
        if (checked) {
            setSelectedPhones((prev) => Array.from(new Set([...prev, ...filteredCustomers.map((customer) => customer.phone)])));
            return;
        }
        const visibleSet = new Set(filteredCustomers.map((customer) => customer.phone));
        setSelectedPhones((prev) => prev.filter((phone) => !visibleSet.has(phone)));
    };

    const handleBulkVip = async (isSubscriber: boolean) => {
        if (!user || selectedPhones.length === 0) return;
        if (!confirm(`${isSubscriber ? 'Ativar' : 'Remover'} VIP para ${selectedPhones.length} cliente(s)?`)) return;

        setBulkBusy(true);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'BULK_SET_SUBSCRIPTION',
                    phones: selectedPhones,
                    isSubscriber,
                })
            });

            if (!res.ok) throw new Error(await res.text());

            setSelectedPhones([]);
            refresh();
        } catch {
            alert('Falha no ajuste em lote de VIP.');
        } finally {
            setBulkBusy(false);
        }
    };

    const handleBulkPoints = async (direction: 'ADD' | 'REMOVE') => {
        if (!user || selectedPhones.length === 0) return;

        const delta = direction === 'ADD' ? bulkPoints : -bulkPoints;
        if (delta === 0) return;
        if (!confirm(`Aplicar ${delta} ponto(s) para ${selectedPhones.length} cliente(s)?`)) return;

        setBulkBusy(true);
        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'BULK_ADJUST_CREDITS',
                    phones: selectedPhones,
                    delta,
                    reason: bulkReason || 'Ajuste manual em lote',
                })
            });

            if (!res.ok) throw new Error(await res.text());

            setSelectedPhones([]);
            setBulkReason('');
            refresh();
        } catch {
            alert('Falha no ajuste em lote de pontos.');
        } finally {
            setBulkBusy(false);
        }
    };

    return (
            <AdminLayout>
                <div className="space-y-6 animate-in fade-in">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-olive font-serif">Gestão de Clientes</h1>
                        <button
                            onClick={refresh}
                            className="rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink/60 hover:bg-paper2"
                        >
                            Atualizar
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-paper focus:border-olive/50 outline-none transition-all"
                        />
                    </div>

                    {filteredCustomers.length > 0 && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => toggleSelectAllVisible(!allVisibleSelected)}
                                className="text-[10px] font-bold uppercase tracking-wider text-ink/50 hover:text-ink/80"
                            >
                                {allVisibleSelected ? 'Desmarcar clientes visiveis' : 'Selecionar clientes visiveis'}
                            </button>
                        </div>
                    )}

                    {/* List */}
                    {error && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                            Falha ao atualizar clientes ({error}). Tentando novamente automaticamente.
                        </div>
                    )}

                    {selectedPhones.length > 0 && (
                        <div className="rounded-xl border border-olive/20 bg-olive/5 p-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-olive">{selectedPhones.length} selecionado(s)</span>
                                <button
                                    onClick={() => setSelectedPhones([])}
                                    className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/60"
                                >
                                    Limpar
                                </button>
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                <button
                                    disabled={bulkBusy}
                                    onClick={() => handleBulkVip(true)}
                                    className="rounded-lg bg-amber px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                                >
                                    Ativar VIP em lote
                                </button>
                                <button
                                    disabled={bulkBusy}
                                    onClick={() => handleBulkVip(false)}
                                    className="rounded-lg border border-amber/40 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber"
                                >
                                    Remover VIP em lote
                                </button>
                                <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-2 py-2">
                                    <button
                                        disabled={bulkBusy}
                                        onClick={() => setBulkPoints((prev) => Math.max(1, prev - 1))}
                                        className="h-7 w-7 rounded border border-ink/10 text-ink/60"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={bulkPoints}
                                        onChange={(e) => setBulkPoints(Math.max(1, Number(e.target.value) || 1))}
                                        className="w-14 rounded border border-ink/10 px-2 py-1 text-center text-sm font-bold"
                                    />
                                    <button
                                        disabled={bulkBusy}
                                        onClick={() => setBulkPoints((prev) => prev + 1)}
                                        className="h-7 w-7 rounded border border-ink/10 text-ink/60"
                                    >
                                        +
                                    </button>
                                    <button
                                        disabled={bulkBusy}
                                        onClick={() => handleBulkPoints('ADD')}
                                        className="ml-auto rounded bg-olive px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                                    >
                                        + pontos
                                    </button>
                                    <button
                                        disabled={bulkBusy}
                                        onClick={() => handleBulkPoints('REMOVE')}
                                        className="rounded border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700"
                                    >
                                        - pontos
                                    </button>
                                </div>
                            </div>

                            <input
                                type="text"
                                value={bulkReason}
                                onChange={(e) => setBulkReason(e.target.value)}
                                placeholder="Motivo do ajuste em lote (opcional)"
                                className="mt-3 w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs"
                            />
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12 text-ink/40">Carregando clientes...</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredCustomers.map(customer => (
                                <div key={customer.phone} className="bg-paper border border-ink/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink/50">
                                            <input
                                                type="checkbox"
                                                checked={selectedPhones.includes(customer.phone)}
                                                onChange={(e) => toggleSelectCustomer(customer.phone, e.target.checked)}
                                            />
                                            Selecionar
                                        </label>
                                    </div>

                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3 cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-olive/10 flex items-center justify-center text-olive font-bold">
                                                {customer.name?.[0]?.toUpperCase() || <UserIcon size={18} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-ink group-hover:text-olive transition-colors">{customer.name}</h3>
                                                <p className="text-xs text-ink/50">{customer.phone}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-bold text-olive font-serif">
                                                {customer.ecoPoints || 0}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest text-ink/40">Créditos</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-ink/60 bg-paper2/50 p-2 rounded-lg mb-4 cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                        <div>
                                            <span className="block font-bold text-ink">{customer.orderCount}</span>
                                            <span>Pedidos</span>
                                        </div>
                                        <div>
                                            <span className="block font-bold text-ink">R$ {(customer.lifetimeValueCents / 100).toFixed(2).replace('.', ',')}</span>
                                            <span>Gasto Total</span>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setViewMode('ADJUST');
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-ink/10 hover:bg-olive/5 hover:border-olive/30 transition-colors text-xs font-bold uppercase tracking-wider text-ink/70"
                                        >
                                            <Plus size={14} className="text-olive" /> Pontos
                                        </button>
                                        <button
                                            onClick={() => handleToggleVip(customer)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs font-bold uppercase tracking-wider",
                                                customer.isSubscriber
                                                    ? "bg-amber/10 border-amber/30 text-amber hover:bg-amber/20"
                                                    : "border-ink/10 text-ink/30 hover:text-amber hover:border-amber/30"
                                            )}
                                        >
                                            <Star size={16} fill={customer.isSubscriber ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && hasMore && (
                        <div className="flex justify-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-paper disabled:opacity-50"
                            >
                                {loadingMore ? 'Carregando...' : 'Carregar mais clientes'}
                            </button>
                        </div>
                    )}

                    {/* Customer Detail Drawer / Modal */}
                    {selectedCustomer && (
                        <div className="fixed inset-0 z-50 flex justify-end">
                            <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedCustomer(null)} />
                            <div className="relative w-full max-w-md bg-paper shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full">
                                {/* Header */}
                                <div className="p-6 border-b border-ink/10 bg-paper2/50 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-ink font-serif flex items-center gap-2">
                                            {selectedCustomer.name}
                                            {selectedCustomer.isSubscriber && <Star size={16} className="text-amber fill-amber" />}
                                        </h2>
                                        <p className="text-sm text-ink/50 font-mono mt-1">{selectedCustomer.phone}</p>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-ink/5 rounded-full">
                                        <X size={20} className="text-ink/40" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-2 p-4">
                                        <div className="bg-olive/10 rounded-xl p-3 text-center border border-olive/20">
                                            <div className="text-2xl font-bold text-olive">{selectedCustomer.ecoPoints || 0}</div>
                                            <div className="text-[10px] uppercase font-bold text-olive/60">Pontos</div>
                                        </div>
                                        <div className="bg-paper border border-ink/10 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-bold text-ink">{selectedCustomer.orderCount}</div>
                                            <div className="text-[10px] uppercase font-bold text-ink/40">Pedidos</div>
                                        </div>
                                        <div className="bg-paper border border-ink/10 rounded-xl p-3 text-center">
                                            <div className="text-sm font-bold text-ink pt-1.5">R$ {((selectedCustomer.lifetimeValueCents || 0) / 100).toFixed(0)}</div>
                                            <div className="text-[10px] uppercase font-bold text-ink/40 mt-1">LTV</div>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="px-4 border-b border-ink/5 flex gap-6 mb-4">
                                        <button
                                            onClick={() => setViewMode('DETAILS')}
                                            className={cn("py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors", viewMode === 'DETAILS' ? "border-olive text-olive" : "border-transparent text-ink/40")}
                                        >
                                            Histórico
                                        </button>
                                        <button
                                            onClick={() => setViewMode('ADJUST')}
                                            className={cn("py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors", viewMode === 'ADJUST' ? "border-olive text-olive" : "border-transparent text-ink/40")}
                                        >
                                            Ajustar Pontos
                                        </button>
                                    </div>

                                    {viewMode === 'DETAILS' && (
                                        <div className="px-4 pb-10 space-y-6">
                                            {/* Addresses */}
                                            {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-3 flex items-center gap-2">
                                                        <MapPin size={12} /> Endereços Salvos
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {selectedCustomer.addresses.map((addr, i) => (
                                                            <div key={i} className="text-sm border border-ink/5 rounded-lg p-3 bg-paper2/30">
                                                                <p className="font-bold text-ink/80">{addr.district}</p>
                                                                <p className="text-ink/60">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Order History */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-3 flex items-center gap-2">
                                                    <ShoppingBag size={12} /> Últimos Pedidos
                                                </h4>
                                                <CustomerOrderHistory phone={selectedCustomer.phone} />
                                            </div>
                                        </div>
                                    )}

                                    {viewMode === 'ADJUST' && (
                                        <AdjustCreditsForm
                                            customer={selectedCustomer}
                                            user={user}
                                            onSuccess={(delta) => {
                                                // Optimistic update
                                                setSelectedCustomer(prev => prev ? { ...prev, ecoPoints: (prev.ecoPoints || 0) + delta } : null);
                                                // Realtime will update main list
                                                setViewMode('DETAILS');
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
    );
}

// Subcomponents

function CustomerOrderHistory({ phone }: { phone: string }) {
    const { orders, loading, error } = useCustomerOrders(phone);

    if (loading) return <div className="p-4 text-center text-xs text-ink/40">Carregando histórico...</div>;
    if (error) return <div className="p-4 text-center text-xs text-amber-700 border border-amber-200 bg-amber-50 rounded-xl">Falha ao carregar historico ({error}).</div>;
    if (orders.length === 0) return <div className="p-4 text-center text-xs text-ink/40 border border-dashed border-ink/10 rounded-xl">Nenhum pedido encontrado.</div>;

    return (
        <div className="space-y-3">
            {orders.map(order => (
                <div key={order.id} className="border border-ink/5 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-ink/5 pb-2">
                        <span className="text-[10px] font-mono text-ink/40 bg-paper2 px-1.5 py-0.5 rounded">#{order.shortId}</span>
                        <span className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                            order.status === 'DELIVERED' ? "bg-green-100 text-green-700" :
                                order.status === 'CANCELED' ? "bg-red-50 text-red-500" :
                                    "bg-amber/10 text-amber-700"
                        )}>
                            {order.status}
                        </span>
                    </div>
                    <div>
                        <div className="flex justify-between items-end">
                            <div className="flex flex-wrap gap-1">
                                {order.items.map((item, i) => (
                                    <span key={i} className="text-xs text-ink/70 bg-ink/5 px-1.5 py-0.5 rounded-md">
                                        {item.quantity}x {item.productName.split(' ')[0]}
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm font-bold text-olive whitespace-nowrap ml-2">
                                R$ {((order.totalCents || 0) / 100).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <div className="mt-2 text-[10px] text-ink/40 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')} - {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}


function AdjustCreditsForm({ customer, user, onSuccess }: { customer: Customer, user: FirebaseUser | null, onSuccess: (delta: number) => void }) {
    const [adjustReason, setAdjustReason] = useState("");
    const [adjustValue, setAdjustValue] = useState(1);
    const [isAdjusting, setIsAdjusting] = useState(false);

    const handleAdjust = async (type: 'ADD' | 'REMOVE') => {
        if (!user) return;
        setIsAdjusting(true);

        const delta = type === 'ADD' ? adjustValue : -adjustValue;
        const reason = adjustReason || "Ajuste manual administrativo";

        try {
            const res = await fetch('/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ADJUST_CREDITS',
                    phone: customer.phone,
                    delta,
                    reason,
                    adminUid: user.uid
                })
            });

            if (res.ok) {
                onSuccess(delta);
            } else {
                alert("Erro ao ajustar créditos.");
            }
        } catch (e) {
            alert("Erro ao ajustar créditos.");
        } finally {
            setIsAdjusting(false);
        }
    };

    return (
        <div className="p-4 bg-paper2/30 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-ink">Ajuste Manual</h3>
            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 block mb-1">Quantidade</label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAdjustValue(Math.max(1, adjustValue - 1))}
                        className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-black/5 bg-white"
                    >
                        <Minus size={16} />
                    </button>
                    <div className="flex-1 text-center font-bold text-2xl text-olive">{adjustValue}</div>
                    <button
                        onClick={() => setAdjustValue(adjustValue + 1)}
                        className="h-10 w-10 rounded-lg border border-ink/10 flex items-center justify-center hover:bg-black/5 bg-white"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 block mb-1">Motivo (Opcional)</label>
                <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Devolução de 5 garrafas"
                    className="w-full px-3 py-2 rounded-lg border border-ink/10 bg-white text-sm outline-none focus:border-olive"
                />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    onClick={() => handleAdjust('REMOVE')}
                    disabled={isAdjusting}
                    className="py-3 rounded-lg bg-red-100 text-red-700 font-bold text-xs uppercase tracking-wider hover:bg-red-200"
                >
                    Remover
                </button>
                <button
                    onClick={() => handleAdjust('ADD')}
                    disabled={isAdjusting}
                    className="py-3 rounded-lg bg-olive text-white font-bold text-xs uppercase tracking-wider hover:bg-olive/90"
                >
                    Adicionar
                </button>
            </div>
        </div>
    );
}
