import "server-only";

import { adminDb } from "@/lib/firebase/admin";

type WriteAuditEventInput = {
    action: string;
    target?: string;
    actorUid?: string;
    actorEmail?: string;
    role?: string;
    details?: string;
    metadata?: Record<string, unknown>;
};

export async function writeAuditEvent(input: WriteAuditEventInput) {
    try {
        await adminDb.collection("auditLogs").add({
            action: input.action,
            target: input.target || null,
            actorUid: input.actorUid || null,
            actorEmail: input.actorEmail || null,
            role: input.role || null,
            details: input.details || null,
            metadata: input.metadata || null,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("audit_write_failed", error);
    }
}
