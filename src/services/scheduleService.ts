import { db } from "@/lib/firebase";
import { DeliveryConfig, DeliveryDayCounters, WeekdayTemplate } from "@/types/firestore";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";

export type DayAvailability = {
    date: string; // YYYY-MM-DD
    open: boolean;
    reason?: string; // "Closed by Config", "Holiday", "Full"
    dailyCapacity: number;
    dailyBooked: number;
    slots: {
        id: string;
        label: string;
        start: string;
        end: string;
        capacity: number;
        booked: number;
        available: number;
        enabled: boolean;
    }[];
};

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export async function getScheduleAvailability(
    startDate: Date,
    days: number,
    mode: 'DELIVERY' | 'PICKUP'
): Promise<DayAvailability[]> {
    // 1. Fetch Config
    const configSnap = await getDoc(doc(db, "settings", "deliveryConfig"));
    if (!configSnap.exists()) {
        console.warn("No delivery config found");
        return [];
    }
    const config = configSnap.data() as DeliveryConfig;

    if (!config.modes[mode].enabled) return [];

    // 2. Prepare Date Range
    const result: DayAvailability[] = [];
    const datesToCheck: string[] = [];

    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        datesToCheck.push(dateStr);
    }

    // 3. Fetch Overrides/Counters for these dates
    // Firestore 'in' query limit is 10. if days > 10, need multiple queries or fetch all in range (using string comparison)
    // For MVP (7 days), 'in' is fine.
    let dayDocs: DeliveryDayCounters[] = [];
    if (datesToCheck.length > 0) {
        // Simple optimization: just query range roughly or loop chunks
        // To be safe and simple: fetch all deliveryDays in range string comparison
        const q = query(
            collection(db, "deliveryDays"),
            where("date", ">=", datesToCheck[0]),
            where("date", "<=", datesToCheck[datesToCheck.length - 1]),
            where("mode", "==", mode) // Mode specific days
        );
        const snap = await getDocs(q);
        dayDocs = snap.docs.map(d => d.data() as DeliveryDayCounters);
    }

    // 4. Merge Logic
    const now = new Date(); // Timezone concern: assuming client local time maps to Porto Velho for MVP or ISO strings

    for (const dateStr of datesToCheck) {
        const dateObj = new Date(dateStr + "T12:00:00"); // midday to avoid timezone edge cases on weekday check
        const dayOfWeek = WEEKDAYS[dateObj.getDay()];

        // A. Base Template
        const template = config.modes[mode].weekdayTemplates[dayOfWeek];

        // B. Global Holidays
        const isClosedDate = config.closedDates.includes(dateStr);

        // C. Specific Override
        const dayOverride = dayDocs.find(d => d.date === dateStr);

        // Merge Open Status
        let isOpen = template.open;
        if (isClosedDate) isOpen = false;
        if (dayOverride?.overrideClosed !== undefined) isOpen = !dayOverride.overrideClosed; // Note: overrideClosed means "is closed?", so isOpen = !closed

        // Merge Capacities
        const dailyCap = dayOverride?.overrideDailyCapacity ?? template.dailyCapacity;
        const dailyBooked = dayOverride?.dailyBooked || 0;

        // Check Daily Cap
        if (dailyBooked >= dailyCap) {
            // If full, it's effectively "closed" for new orders? Or just full?
            // Let's keep it "open" but with 0 slots available logic
        }

        // Merge Slots
        const slots = template.slots.map(slotConfig => {
            const slotOverride = dayOverride?.slots?.[slotConfig.id];

            const slotCap = slotConfig.capacity;
            const slotEnabled = slotConfig.enabled;

            // If snapshot in override exists, use it? Or use override fields?
            // The defined type says 'capacitySnapshot'. Usually we rely on config unless override explicitly set.
            // For this MVP, let's assume overrides in dayDocs are specific actions.
            // But usually dayDocs tracks BOOKINGS. 
            // Logic: Slot Cap = Config Cap (unless override).
            // Since we didn't implement slot overrides in UI yet, stick to Config.

            const booked = slotOverride?.booked || 0;
            const available = Math.max(0, slotCap - booked);

            return {
                ...slotConfig,
                capacity: slotCap,
                booked,
                available,
                enabled: slotEnabled && available > 0
            };
        });

        // Cutoff Logic (Simple)
        // If date is today, check cutoff time vs current time
        // If type is DAY_BEFORE, cannot book today.
        // Assuming Timezone 'America/Porto_Velho' -4.
        // For MVP Client Side: using browser local time is risky if user is travel.
        // Ideal: Server time. Fallback: User time.

        // Implement fundamental cutoff:
        let cutoffReason = undefined;
        // Simple Rule: "Cannot book past dates"
        if (new Date(dateStr) < new Date(now.toISOString().split("T")[0])) {
            isOpen = false;
            cutoffReason = "Past date";
        }

        // Day Before policy
        if (config.cutoffPolicy.type === 'DAY_BEFORE_AT' && config.cutoffPolicy.dayBeforeAt) {
            // Validation logic here
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
