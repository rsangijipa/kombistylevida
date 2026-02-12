export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { adminGuard } from '@/lib/auth/adminGuard';
import { writeAuditEvent } from '@/lib/audit';

export async function GET(request: Request) {
    try {
        await adminGuard();
        const { searchParams } = new URL(request.url);
        const queryText = (searchParams.get('q') || '').trim().toLowerCase();
        const cursor = searchParams.get('cursor');
        const paginated = searchParams.get('paginated') === '1';
        const limitParam = Number(searchParams.get('limit') || '50');
        const limitCount = Number.isFinite(limitParam) ? Math.min(200, Math.max(1, limitParam)) : 50;

        let query = adminDb.collection('customers')
            .orderBy('lastOrderAt', 'desc')
            .limit(paginated ? limitCount + 1 : limitCount);

        if (paginated && cursor) {
            query = query.startAfter(cursor);
        }

        const snapshot = await query.get();

        let customers: Array<{ id: string } & Record<string, unknown>> = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        if (queryText) {
            customers = customers.filter((customer) => {
                const name = typeof customer.name === 'string' ? customer.name.toLowerCase() : '';
                const phone = typeof customer.phone === 'string' ? customer.phone : '';
                return name.includes(queryText) || phone.includes(queryText);
            });
        }

        if (paginated) {
            const hasMore = customers.length > limitCount;
            const items = hasMore ? customers.slice(0, limitCount) : customers;
            const nextCursor = hasMore
                ? (typeof items[items.length - 1]?.lastOrderAt === 'string' ? items[items.length - 1]?.lastOrderAt as string : null)
                : null;

            return NextResponse.json({ items, hasMore, nextCursor });
        }

        return NextResponse.json(customers);
    } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error fetching customers:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customers';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    let admin: { uid?: string; email?: string; role?: string } | null = null;
    try {
        admin = await adminGuard();
        const body = await request.json();
        const { action, phone, delta, isSubscriber } = body;

        const isBulkAction = action === 'BULK_SET_SUBSCRIPTION' || action === 'BULK_ADJUST_CREDITS';
        if (!isBulkAction && !phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

        const docRef = phone ? adminDb.collection('customers').doc(phone) : null;

        if (action === 'ADJUST_CREDITS') {
            await docRef?.update({
                ecoPoints: FieldValue.increment(delta),
                updatedAt: new Date().toISOString()
            });

            await writeAuditEvent({
                action: 'CUSTOMER_CREDITS_ADJUSTED',
                target: `customers/${phone}`,
                actorUid: admin?.uid,
                actorEmail: admin?.email,
                role: admin?.role,
                details: `Ajuste de pontos: ${delta}`,
                metadata: { phone, delta, reason: body.reason || null },
            });

            return NextResponse.json({ success: true });
        }

        if (action === 'TOGGLE_SUBSCRIPTION') {
            await docRef?.update({
                isSubscriber: isSubscriber,
                updatedAt: new Date().toISOString()
            });

            await writeAuditEvent({
                action: 'CUSTOMER_SUBSCRIPTION_TOGGLED',
                target: `customers/${phone}`,
                actorUid: admin?.uid,
                actorEmail: admin?.email,
                role: admin?.role,
                details: `VIP: ${Boolean(isSubscriber)}`,
                metadata: { phone, isSubscriber: Boolean(isSubscriber) },
            });

            return NextResponse.json({ success: true });
        }

        if (action === 'BULK_SET_SUBSCRIPTION') {
            const phones = Array.isArray(body.phones) ? body.phones.filter((v: unknown): v is string => typeof v === 'string' && v.length > 0) : [];
            const targetState = Boolean(body.isSubscriber);

            if (phones.length === 0) {
                return NextResponse.json({ error: 'Missing phones' }, { status: 400 });
            }

            const batch = adminDb.batch();
            phones.forEach((value: string) => {
                batch.update(adminDb.collection('customers').doc(value), {
                    isSubscriber: targetState,
                    updatedAt: new Date().toISOString(),
                });
            });
            await batch.commit();

            await writeAuditEvent({
                action: 'CUSTOMER_BULK_SUBSCRIPTION_TOGGLED',
                target: 'customers',
                actorUid: admin?.uid,
                actorEmail: admin?.email,
                role: admin?.role,
                details: `VIP em lote: ${targetState} (${phones.length} clientes)`,
                metadata: { phonesCount: phones.length, isSubscriber: targetState },
            });

            return NextResponse.json({ success: true, updated: phones.length });
        }

        if (action === 'BULK_ADJUST_CREDITS') {
            const phones = Array.isArray(body.phones) ? body.phones.filter((v: unknown): v is string => typeof v === 'string' && v.length > 0) : [];
            const pointsDelta = Number(body.delta || 0);

            if (phones.length === 0 || !Number.isFinite(pointsDelta) || pointsDelta === 0) {
                return NextResponse.json({ error: 'Invalid bulk payload' }, { status: 400 });
            }

            const batch = adminDb.batch();
            phones.forEach((value: string) => {
                batch.update(adminDb.collection('customers').doc(value), {
                    ecoPoints: FieldValue.increment(pointsDelta),
                    updatedAt: new Date().toISOString(),
                });
            });
            await batch.commit();

            await writeAuditEvent({
                action: 'CUSTOMER_BULK_CREDITS_ADJUSTED',
                target: 'customers',
                actorUid: admin?.uid,
                actorEmail: admin?.email,
                role: admin?.role,
                details: `Ajuste em lote: ${pointsDelta} (${phones.length} clientes)`,
                metadata: { phonesCount: phones.length, delta: pointsDelta, reason: body.reason || null },
            });

            return NextResponse.json({ success: true, updated: phones.length });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        if (error instanceof Error && error.message === 'UNAUTHORIZED') {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }
        if (error instanceof Error && error.message === 'FORBIDDEN') {
            return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
        }
        console.error('Error updating customer:', error);
        const message = error instanceof Error ? error.message : 'Failed to update customer';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
