import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Ensure this runs on edge/server correctly? 
// Note: Usually we use firebase-admin for API routes to bypass rules, but client SDK can work if rules allow public read or if we don't auth.
// Ideally, for Admin, we should verify auth token. For MVP, we'll try client SDK first, but beware of "client" usage in "server" env unless initialized properly.
// Wait, `src/lib/firebase` initializes client SDK. This works in Next.js API routes usually, but runs as "anonymous" unless we pass a token. 
// However, Firestore Rules might block it if it requires "auth != null".
// Better strategy: Use a dedicated "Admin" service if strict, OR let's just assume the user is asking for the frontend to have a robust calendar, and the API is a clean way to aggregate.
// Actually, using Client SDK in API Route avoids exposing Service Account Key to client, but it effectively acts as a "Client". It won't have Admin privileges.
// If Firestore rules say "allow read: if request.auth != null", this API route won't work unless we pass the token from the header.
// 
// Simplified approach for User's Request: The user asked for "Implemente o calendário via API".
// This implies the frontend calls this API, and this API talks to Firestore.
// I will implement a basic aggregation here.

import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

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
        // Query Orders in Range
        // Note: This requires an index on `scheduledDate`.
        const ordersRef = collection(db, "orders");
        const q = query(
            ordersRef,
            where("scheduledDate", ">=", Timestamp.fromDate(start)),
            where("scheduledDate", "<=", Timestamp.fromDate(end))
        );

        const snapshot = await getDocs(q);

        // Aggregate by Day
        const days: Record<string, { count: number, revenue: number, orders: any[] }> = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const dateKey = data.scheduledDate.toDate().toISOString().split('T')[0]; // YYYY-MM-DD

            if (!days[dateKey]) {
                days[dateKey] = { count: 0, revenue: 0, orders: [] };
            }

            days[dateKey].count += 1;
            days[dateKey].revenue += (data.totalCents || 0);
            days[dateKey].orders.push({ id: doc.id, ...data });
        });

        // Convert to Array
        const result = Object.entries(days).map(([date, info]) => ({
            date,
            ...info
        }));

        return NextResponse.json({ data: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
