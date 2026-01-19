
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Types (Mirrored from Firestore types but adapted for server usage)
type DeliveryConfig = {
    closedDates: string[];
    cutoffPolicy: { type: string; dayBeforeAt?: string };
    modes: {
        [key: string]: {
            enabled: boolean;
            weekdayTemplates: Record<string, any>;
        }
    };
};

// Helper function to get schedule availability (Server Side)
async function getScheduleAvailabilityServer(startDate: Date, days: number, mode: string) {
    // 1. Fetch Config
    const configSnap = await adminDb.collection('settings').doc('deliveryConfig').get();
    if (!configSnap.exists) return [];
    const config = configSnap.data() as DeliveryConfig;

    if (!config.modes[mode]?.enabled) return [];

    // 2. Prepare Date Range
    const datesToCheck: string[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0]; // Simple YYYY-MM-DD
        datesToCheck.push(dateStr);
    }

    // 3. Implied DeliveryDays query
    // Since 'in' query is limited, we'll fetch range if possible or just last 14 days
    const snapshot = await adminDb.collection('deliveryDays')
        .where('date', '>=', datesToCheck[0])
        .where('date', '<=', datesToCheck[datesToCheck.length - 1])
        .where('mode', '==', mode)
        .get();

    const dayDocs = snapshot.docs.map(d => d.data());

    // 4. Merge Logic
    const result: any[] = [];
    const now = new Date();
    const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    for (const dateStr of datesToCheck) {
        const dateObj = new Date(dateStr + "T12:00:00");
        const dayOfWeek = WEEKDAYS[dateObj.getDay()];
        const template = config.modes[mode].weekdayTemplates[dayOfWeek];
        const isClosedDate = config.closedDates.includes(dateStr);
        const dayOverride = dayDocs.find(d => d.date === dateStr);

        let isOpen = template.open;
        if (isClosedDate) isOpen = false;
        if (dayOverride?.overrideClosed !== undefined) isOpen = !dayOverride.overrideClosed;

        const dailyCap = dayOverride?.overrideDailyCapacity ?? template.dailyCapacity;
        const dailyBooked = dayOverride?.dailyBooked || 0;

        // Slots
        const slots = template.slots.map((slotConfig: any) => {
            const slotOverride = dayOverride?.slots?.[slotConfig.id];
            const booked = slotOverride?.booked || 0;
            const available = Math.max(0, slotConfig.capacity - booked);
            return {
                ...slotConfig,
                booked,
                available,
                enabled: slotConfig.enabled && available > 0
            };
        });

        // Simple Cutoff (Past dates)
        let cutoffReason = undefined;
        if (dateStr < now.toISOString().split('T')[0]) {
            isOpen = false;
            cutoffReason = "Past date";
        }

        result.push({
            date: dateStr,
            open: isOpen,
            reason: cutoffReason,
            dailyCapacity: dailyCap,
            dailyBooked,
            slots
        });
    }

    return result;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '14');
        const mode = searchParams.get('mode') || 'DELIVERY';

        // Assuming start date is today
        const data = await getScheduleAvailabilityServer(new Date(), days, mode);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, date, mode, open, slotId, capacity, notes, enabled } = body;

        const docId = `${date}_${mode}`;
        const ref = adminDb.collection('deliveryDays').doc(docId);

        if (action === 'TOGGLE_DAY') {
            await ref.set({
                date, mode,
                overrideClosed: open, // true means closed
                updatedAt: new Date().toISOString()
            }, { merge: true });
            return NextResponse.json({ success: true });
        }

        if (action === 'UPDATE_SLOT') {
            // Need to update specific slot in map `slots.slotId`
            // Firestore map update dot notation
            if (!slotId) return NextResponse.json({ error: "Missing Slot ID" }, { status: 400 });

            const updateData: any = {
                updatedAt: new Date().toISOString()
            };

            // We are using `slots` map in DeliveryDayCounters
            if (capacity !== undefined) updateData[`slots.${slotId}.capacitySnapshot`] = Number(capacity);
            if (enabled !== undefined) updateData[`slots.${slotId}.enabledSnapshot`] = Boolean(enabled);
            // Notes not in original type but useful to add? 
            // Type definition didn't have notes per slot in Counters. 
            // Let's add it dynamically as it's Firestore.
            if (notes !== undefined) updateData[`slots.${slotId}.notes`] = notes;

            await ref.set(updateData, { merge: true }); // set merge to create doc if missing
            // However, set merge with dot notation on top level works, but for nested maps inside potentially new doc?
            // Safer to ensure doc exists or use set with nested object structure if new.
            // Simplified:
            await ref.set({ date, mode }, { merge: true }); // Ensure doc
            await ref.update(updateData);

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}
