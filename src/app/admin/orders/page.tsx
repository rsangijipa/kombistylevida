"use client";

import React, { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthProvider } from "@/context/AuthContext";
import { Search, Loader2, MessageSquare, Copy, CheckSquare2 } from "lucide-react";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";

import { useToast } from "@/context/ToastContext";
import { buildCustomerWhatsAppLink } from "@/config/business";

export default function OrdersPage() {
    return (
        <AuthProvider>
            <OrdersList />
        </AuthProvider>
    );
}

function OrdersList() {
    const { orders, loading } = useOrdersRealtime({ limitCount: 100 });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [selectedMethod, setSelectedMethod] = useState<"ALL" | "delivery" | "pickup">("ALL");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const toast = useToast();

    const statusCounts = useMemo(() => {
        return orders.reduce<Record<string, number>>((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
    }, [orders]);

    const filteredOrders = orders.filter(o =>
        ((o.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.shortId || "").toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedStatus === "ALL" || o.status === selectedStatus) &&
        (selectedMethod === "ALL" || o.customer?.deliveryMethod === selectedMethod)
    );

    const selectableOrders = filteredOrders.filter((order) => order.status !== "CANCELED");
    const allVisibleSelected = selectableOrders.length > 0 && selectableOrders.every((order) => selectedIds.includes(order.id));

    const handleMarkPaid = async (orderId: string) => {
        if (!confirm("Confirmar pagamento e baixar estoque?")) return;

        const tid = toast.loading("Processando pagamento...");
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method: "PIX" })
            });
            if (!res.ok) throw new Error(await res.text());

            toast.removeToast(tid);
            toast.success("Pedido confirmado!", "Estoque atualizado com sucesso.");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            toast.removeToast(tid);
            toast.error("Erro ao processar", message);
        }
    };

    const handleCancel = async (orderId: string) => {
        if (!confirm("Cancelar pedido? Se já pago, o estoque será estornado.")) return;

        const tid = toast.loading("Cancelando pedido...");
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
                method: "PATCH",
            });
            if (!res.ok) throw new Error(await res.text());

            toast.removeToast(tid);
            toast.success("Pedido cancelado", "Estoque foi estornado.");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            toast.removeToast(tid);
            toast.error("Erro ao cancelar", message);
        }
    };

    const toggleSelect = (orderId: string, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) return Array.from(new Set([...prev, orderId]));
            return prev.filter((id) => id !== orderId);
        });
    };

    const toggleSelectAllVisible = (checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableOrders.map((order) => order.id)])));
            return;
        }
        const visibleSet = new Set(selectableOrders.map((order) => order.id));
        setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    };

    const handleBulkMarkPaid = async () => {
        const validIds = selectedIds.filter((id) => {
            const order = orders.find((item) => item.id === id);
            return !!order && order.status !== "PAID" && order.status !== "CANCELED";
        });

        if (validIds.length === 0) {
            toast.error("Nenhum pedido elegivel", "Selecione pedidos pendentes para marcar como pagos.");
            return;
        }

        if (!confirm(`Marcar ${validIds.length} pedido(s) como pago?`)) return;

        const tid = toast.loading("Processando acao em lote...");
        const results = await Promise.all(
            validIds.map(async (orderId) => {
                const res = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ method: "PIX" })
                });
                return { orderId, ok: res.ok };
            })
        );

        const successCount = results.filter((r) => r.ok).length;
        toast.removeToast(tid);
        if (successCount === validIds.length) {
            toast.success("Lote concluido", `${successCount} pedido(s) marcados como pagos.`);
        } else {
            toast.error("Lote parcial", `${successCount} de ${validIds.length} pedido(s) processados.`);
        }
        setSelectedIds([]);
    };

    const handleBulkCancel = async () => {
        const validIds = selectedIds.filter((id) => {
            const order = orders.find((item) => item.id === id);
            return !!order && order.status !== "CANCELED";
        });

        if (validIds.length === 0) {
            toast.error("Nenhum pedido elegivel", "Selecione pedidos ativos para cancelamento.");
            return;
        }

        if (!confirm(`Cancelar ${validIds.length} pedido(s)?`)) return;

        const tid = toast.loading("Cancelando lote...");
        const results = await Promise.all(
            validIds.map(async (orderId) => {
                const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
                    method: "PATCH",
                });
                return { orderId, ok: res.ok };
            })
        );

        const successCount = results.filter((r) => r.ok).length;
        toast.removeToast(tid);
        if (successCount === validIds.length) {
            toast.success("Lote cancelado", `${successCount} pedido(s) cancelados.`);
        } else {
            toast.error("Lote parcial", `${successCount} de ${validIds.length} cancelados.`);
        }
        setSelectedIds([]);
    };

    const openWhatsApp = (phone: string, text?: string) => {
        const url = buildCustomerWhatsAppLink(phone, text || "");
        window.open(url, '_blank');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Mensagem copiada!");
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink">Pedidos</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-olive"></span>
                        </span>
                        <p className="text-ink2 text-sm">Tempo Real Ativo</p>
                    </div>
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-ink/10 bg-white pl-10 pr-4 py-3 text-sm outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 shadow-sm md:w-72 transition-all"
                    />
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-ink/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setSelectedStatus("ALL")}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${selectedStatus === "ALL" ? "bg-olive text-white" : "bg-paper2 text-ink/70"}`}
                    >
                        Todos ({orders.length})
                    </button>
                    {Object.keys(statusCounts).sort().map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${selectedStatus === status ? "bg-olive text-white" : "bg-paper2 text-ink/70"}`}
                        >
                            {status} ({statusCounts[status] || 0})
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink/50">Canal</label>
                    <select
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value as "ALL" | "delivery" | "pickup")}
                        className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink"
                    >
                        <option value="ALL">Todos</option>
                        <option value="delivery">Entrega</option>
                        <option value="pickup">Retirada</option>
                    </select>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-olive/20 bg-olive/5 p-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-olive">{selectedIds.length} selecionado(s)</span>
                    <button
                        onClick={handleBulkMarkPaid}
                        className="rounded-lg bg-olive px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-olive/90"
                    >
                        Marcar pago em lote
                    </button>
                    <button
                        onClick={handleBulkCancel}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-700 hover:bg-red-100"
                    >
                        Cancelar em lote
                    </button>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink/60"
                    >
                        Limpar selecao
                    </button>
                </div>
            )}

            {loading ? (
                <div className="py-20 flex justify-center text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <>
                    {/* PC Table View */}
                    <div className="hidden md:block overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-paper2/50 text-xs font-bold uppercase tracking-wider text-ink/50">
                                <tr>
                                    <th className="px-3 py-4">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                                            aria-label="Selecionar todos visiveis"
                                        />
                                    </th>
                                    <th className="px-6 py-4">ID / Data</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Entrega</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ink/5">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-ink2 italic">
                                            Nenhum pedido encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-paper2/30 transition-colors">
                                            <td className="px-3 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={(e) => toggleSelect(order.id, e.target.checked)}
                                                    aria-label={`Selecionar pedido ${order.shortId || order.id.slice(0, 8)}`}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold font-mono text-ink">#{order.shortId || order.id.slice(0, 8)}</div>
                                                <div className="text-xs text-ink2">
                                                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                                    {' '}
                                                    {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-ink">{order.customer.name}</div>
                                                <div className="text-xs text-ink/60">{order.customer.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.customer.deliveryMethod === 'delivery' ? (
                                                    <div>
                                                        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 mb-1">
                                                            Entrega
                                                        </span>
                                                        <div className="text-xs text-ink truncate max-w-[150px]">
                                                            {order.schedule.date ? new Date(order.schedule.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'S/ Data'}
                                                            {' - '}
                                                            {order.schedule.slotLabel || '?'}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center rounded bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700">
                                                        Retirada
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-olive">
                                                R$ {((order.totalCents || order.pricing?.totalCents || 0) / 100).toFixed(2).replace(".", ",")}
                                            </td>
                                            <td className="px-6 py-4 flex flex-col gap-2">
                                                <div className="flex items-center gap-1 mb-1">
                                                    {order.whatsappMessage && (
                                                        <>
                                                            <button
                                                                onClick={() => openWhatsApp(order.customer.phone, order.whatsappMessage)}
                                                                title="Abrir WhatsApp com Cliente"
                                                                className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            >
                                                                <MessageSquare size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => copyToClipboard(order.whatsappMessage!)}
                                                                title="Copiar Mensagem"
                                                                className="p-1.5 rounded bg-paper2 text-ink/60 hover:bg-paper2/80 transition-colors"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {order.status !== 'PAID' && order.status !== 'CANCELED' && (
                                                    <button
                                                        onClick={() => handleMarkPaid(order.id)}
                                                        className="text-xs font-bold text-green-700 hover:underline text-left">
                                                        Marcar Pago
                                                    </button>
                                                )}
                                                {order.status !== 'CANCELED' && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        className="text-xs font-bold text-red-600 hover:underline text-left">
                                                        Cancelar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredOrders.length === 0 ? (
                            <div className="py-10 text-center text-ink2 italic bg-white rounded-xl border border-ink/5">
                                Nenhum pedido encontrado.
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl p-4 border border-ink/5 shadow-sm active:scale-[0.99] transition-transform">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-ink/50">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={(e) => toggleSelect(order.id, e.target.checked)}
                                            />
                                            Selecionar
                                        </label>
                                        <CheckSquare2 size={14} className="text-ink/30" />
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-ink">#{order.shortId || order.id.slice(0, 8)}</span>
                                                <StatusBadge status={order.status} />
                                            </div>
                                            <div className="text-xs text-ink2 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="font-bold text-olive text-lg">
                                            R$ {((order.totalCents || order.pricing?.totalCents || 0) / 100).toFixed(2).replace(".", ",")}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4 p-3 bg-paper2/50 rounded-lg">
                                        <div className="h-8 w-8 rounded-full bg-olive text-white flex items-center justify-center font-bold text-xs uppercase">
                                            {order.customer.name[0]}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-sm text-ink truncate">{order.customer.name}</div>
                                            <div className="text-xs text-ink/60 truncate flex items-center gap-1">
                                                {order.customer.deliveryMethod === 'delivery' ? '🚗 Entrega' : '🏪 Retirada'}
                                                <span>•</span>
                                                {order.schedule.date ? new Date(order.schedule.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'S/ Data'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Whatsapp Actions Mobile */}
                                    <div className="flex items-center justify-end gap-2 mb-4 border-b border-ink/5 pb-4">
                                        {order.whatsappMessage && (
                                            <>
                                                <button
                                                    onClick={() => openWhatsApp(order.customer.phone, order.whatsappMessage)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 text-green-700 text-xs font-bold"
                                                >
                                                    <MessageSquare size={14} /> Abrir WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(order.whatsappMessage!)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded bg-paper2 text-ink/60 text-xs font-bold"
                                                >
                                                    <Copy size={14} /> Copiar
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {order.status !== 'CANCELED' && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                className="rounded-lg border border-red-200 text-red-700 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-red-50">
                                                Cancelar
                                            </button>
                                        )}
                                        {order.status !== 'PAID' && order.status !== 'CANCELED' && (
                                            <button
                                                onClick={() => handleMarkPaid(order.id)}
                                                className="rounded-lg bg-olive py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-olive/90">
                                                Marcar Pago
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'NEW': 'bg-blue-100 text-blue-800',
        'CONFIRMED': 'bg-purple-100 text-purple-800',
        'IN_PRODUCTION': 'bg-yellow-100 text-yellow-800',
        'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELED': 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
        'NEW': 'Novo',
        'CONFIRMED': 'Confirmado',
        'IN_PRODUCTION': 'Em Produção',
        'OUT_FOR_DELIVERY': 'Saiu p/ Entrega',
        'DELIVERED': 'Entregue',
        'CANCELED': 'Cancelado',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    );
}
