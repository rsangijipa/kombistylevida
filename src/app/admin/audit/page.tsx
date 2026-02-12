"use client";

import React, { useEffect, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Loader2, Download, RefreshCw } from "lucide-react";

type AuditEvent = {
    id: string;
    source: "auditLogs" | "stockMovements";
    action: string;
    createdAt: string;
    actor?: string;
    target?: string;
    details?: string;
};

export default function AuditPage() {
    return (
        <AuthProvider>
            <AuditContent />
        </AuthProvider>
    );
}

function AuditContent() {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [source, setSource] = useState<"ALL" | "auditLogs" | "stockMovements">("ALL");
    const [action, setAction] = useState("");
    const [actor, setActor] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function load(reset = false) {
        const targetCursor = reset ? null : nextCursor;

        if (reset) {
            setLoading(true);
            setEvents([]);
            setNextCursor(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            params.set("limit", "80");
            params.set("source", source);
            if (action.trim()) params.set("action", action.trim());
            if (actor.trim()) params.set("actor", actor.trim());
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            if (targetCursor) params.set("cursor", targetCursor);

            const res = await fetch(`/api/admin/audit?${params.toString()}`, { cache: "no-store" });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(typeof data?.error === "string" ? data.error : "Erro ao carregar auditoria");
            }

            const incoming = Array.isArray(data?.events) ? (data.events as AuditEvent[]) : [];
            setEvents((prev) => (reset ? incoming : [...prev, ...incoming]));
            setNextCursor(typeof data?.nextCursor === "string" ? data.nextCursor : null);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar auditoria");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }

    const exportCsv = () => {
        if (events.length === 0) return;

        const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
        const header = ["quando", "origem", "acao", "alvo", "ator", "detalhes"];
        const rows = events.map((event) => [
            new Date(event.createdAt).toISOString(),
            event.source,
            event.action,
            event.target || "",
            event.actor || "",
            event.details || "",
        ]);

        const csv = [header, ...rows].map((row) => row.map((cell) => escape(String(cell))).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        load(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [source, action, actor, from, to]);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="font-serif text-3xl font-bold text-ink">Auditoria</h1>
                <p className="text-sm text-ink/60">Historico recente de alteracoes operacionais e movimentos de estoque.</p>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-ink/10 bg-white p-4 md:grid-cols-6">
                <select value={source} onChange={(e) => setSource(e.target.value as "ALL" | "auditLogs" | "stockMovements")} className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink">
                    <option value="ALL">Todas as origens</option>
                    <option value="auditLogs">Audit Logs</option>
                    <option value="stockMovements">Stock Movements</option>
                </select>
                <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filtrar por acao" className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs" />
                <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Filtrar por ator" className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs" />
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs" />
                <div className="flex gap-2">
                    <button onClick={() => load(true)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-ink/10 bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink/70">
                        <RefreshCw size={12} /> Atualizar
                    </button>
                    <button onClick={exportCsv} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-olive px-3 py-2 text-xs font-bold uppercase tracking-wider text-white">
                        <Download size={12} /> CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20 text-olive">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-paper2/50 text-xs font-bold uppercase tracking-wider text-ink/50">
                            <tr>
                                <th className="px-4 py-3">Quando</th>
                                <th className="px-4 py-3">Origem</th>
                                <th className="px-4 py-3">Acao</th>
                                <th className="px-4 py-3">Alvo</th>
                                <th className="px-4 py-3">Ator</th>
                                <th className="px-4 py-3">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/5">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center italic text-ink/50">Nenhum evento registrado.</td>
                                </tr>
                            ) : (
                                events.map((event) => (
                                    <tr key={`${event.source}-${event.id}`} className="hover:bg-paper2/30">
                                        <td className="px-4 py-3 text-xs text-ink/60">
                                            {new Date(event.createdAt).toLocaleDateString("pt-BR")} {new Date(event.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${event.source === "auditLogs" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                                                {event.source}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-ink">{event.action}</td>
                                        <td className="px-4 py-3 text-xs text-ink/70">{event.target || "-"}</td>
                                        <td className="px-4 py-3 text-xs text-ink/70">{event.actor || "admin"}</td>
                                        <td className="px-4 py-3 text-xs text-ink/70">{event.details || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && nextCursor && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={() => load(false)}
                        disabled={loadingMore}
                        className="rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink/70 hover:bg-paper disabled:opacity-50"
                    >
                        {loadingMore ? "Carregando..." : "Carregar mais"}
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
