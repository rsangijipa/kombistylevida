export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
type DayScheduleAggregate = {
    count: number;
    revenue: number;
    orders: Array<{ id: string } & Record<string, unknown>>;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');

    if (!month || !year) {
        return NextResponse.json({ error: 'Missing month/year' }, { status: 400 });
    }

    // Calculate Start/End of Month
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    try {
        // P1-4: Use Admin SDK to bypass client rules (which might require auth) in production
        const ordersRef = adminDb.collection("orders");
        // Ensure "schedule.date" is the field name. 
        // In checkout we wrote: schedule: { date: ... }
        // So field path is "schedule.date"
        // Also note: Checkout stores date as STRING (ISO-ish) or TIMESTAMP?
        // Checkout: schedule: { date: payload.selectedDate || null }
        // CartDrawer passed `selectedDate` which comes from Date object usually?
        // Let's check format. `selectedDate` is usually string "YYYY-MM-DD" or Date object.
        // If it's stored as String "2024-01-20", range query on string works if format is ISO.
        // Let's assume standardized format or just query everything and filter (if scaling permits).
        // For efficiency, let's query. If field is string YYYY-MM-DD key.

        const snapshot = await ordersRef
            .where("schedule.date", ">=", start.toISOString().split('T')[0])
            .where("schedule.date", "<=", end.toISOString().split('T')[0])
            .get();

        // Aggregate by Day
        const days: Record<string, DayScheduleAggregate> = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const dateStr = data.schedule?.date;

            if (!dateStr) return;

            if (!days[dateStr]) {
                days[dateStr] = { count: 0, revenue: 0, orders: [] };
            }

            days[dateStr].count += 1;
            days[dateStr].revenue += (data.totalCents || 0);
            days[dateStr].orders.push({ id: doc.id, ...(data as Record<string, unknown>) });
        });

        // Convert to Array
        const result = Object.entries(days).map(([date, info]) => ({
            date,
            ...info
        }));

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        console.error("Schedule API Error", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
