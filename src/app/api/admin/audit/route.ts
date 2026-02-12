export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { adminGuard } from "@/lib/auth/adminGuard";

type AuditEvent = {
    id: string;
    source: "auditLogs" | "stockMovements";
    action: string;
    createdAt: string;
    actor?: string;
    target?: string;
    details?: string;
    metadata?: Record<string, unknown> | null;
};

function toIsoDate(value: unknown) {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate().toISOString();
    }
    return new Date(0).toISOString();
}

export async function GET(request: Request) {
    try {
        await adminGuard();

        const { searchParams } = new URL(request.url);
        const sourceFilter = (searchParams.get("source") || "ALL").toLowerCase();
        const actionFilter = (searchParams.get("action") || "").trim().toLowerCase();
        const actorFilter = (searchParams.get("actor") || "").trim().toLowerCase();
        const fromFilter = searchParams.get("from");
        const toFilter = searchParams.get("to");
        const cursor = searchParams.get("cursor");
        const limit = Math.min(200, Math.max(20, Number(searchParams.get("limit") || 80)));

        const fromTime = fromFilter ? new Date(fromFilter).getTime() : null;
        const toTime = toFilter ? new Date(toFilter).getTime() : null;
        const cursorTime = cursor ? new Date(cursor).getTime() : null;

        const readLimit = Math.max(100, limit * 3);

        const [auditSnap, stockSnap] = await Promise.all([
            adminDb.collection("auditLogs").orderBy("createdAt", "desc").limit(readLimit).get(),
            adminDb.collection("stockMovements").orderBy("createdAt", "desc").limit(readLimit).get(),
        ]);

        const auditLogs: AuditEvent[] = auditSnap.docs.map((doc) => {
            const data = doc.data() as Record<string, unknown>;
            return {
                id: doc.id,
                source: "auditLogs",
                action: String(data.action || data.event || "CHANGE"),
                createdAt: toIsoDate(data.createdAt),
                actor: typeof data.userName === "string" ? data.userName : typeof data.updatedBy === "string" ? data.updatedBy : "admin",
                target: typeof data.collectionName === "string" ? data.collectionName : undefined,
                details: typeof data.reason === "string" ? data.reason : undefined,
                metadata: data,
            };
        });

        const stockLogs: AuditEvent[] = stockSnap.docs.map((doc) => {
            const data = doc.data() as Record<string, unknown>;
            const qty = typeof data.quantity === "number" ? data.quantity : 0;
            return {
                id: doc.id,
                source: "stockMovements",
                action: String(data.type || "MOVEMENT"),
                createdAt: toIsoDate(data.createdAt),
                actor: typeof data.createdBy === "string" ? data.createdBy : "admin",
                target: typeof data.productId === "string" ? data.productId : undefined,
                details: `${qty} un${typeof data.reason === "string" ? ` - ${data.reason}` : ""}`,
                metadata: data,
            };
        });

        const events = [...auditLogs, ...stockLogs]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .filter((event) => {
                if (sourceFilter !== "all" && event.source.toLowerCase() !== sourceFilter) return false;

                const createdAtTime = new Date(event.createdAt).getTime();
                if (Number.isFinite(fromTime) && fromTime !== null && createdAtTime < fromTime) return false;
                if (Number.isFinite(toTime) && toTime !== null && createdAtTime > toTime + 86400000 - 1) return false;
                if (Number.isFinite(cursorTime) && cursorTime !== null && createdAtTime >= cursorTime) return false;

                if (actionFilter && !event.action.toLowerCase().includes(actionFilter)) return false;
                if (actorFilter && !(event.actor || "").toLowerCase().includes(actorFilter)) return false;

                return true;
            })
            .slice(0, limit);

        const nextCursor = events.length > 0 ? events[events.length - 1].createdAt : null;

        return NextResponse.json({ events, nextCursor, total: events.length });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (message === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
