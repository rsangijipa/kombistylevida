export type DeliverySlot = {
    id: string;
    label: string;
    startTime: number; // Hour integer (9 for 09:00)
    endTime: number;
    capacity: number;
    cutoffHours: number; // Hours before 'startTime' required to book
};

export const DELIVERY_SLOTS: DeliverySlot[] = [
    {
        id: "morning",
        label: "Manhã (09h - 12h)",
        startTime: 9,
        endTime: 12,
        capacity: 8,
        cutoffHours: 14, // Must book by 19:00 previous day (approx logic: 9 - 14 = -5 -> 19h prev day)
    },
    {
        id: "afternoon",
        label: "Tarde (13h - 17h)",
        startTime: 13,
        endTime: 17,
        capacity: 10,
        cutoffHours: 4, // Must book 4 hours before 13:00 -> 09:00 same day
    },
    {
        id: "evening",
        label: "Noite (18h - 20h)",
        startTime: 18,
        endTime: 20,
        capacity: 5,
        cutoffHours: 4, // Must book by 14:00 same day
    },
];

export const CLOSED_DAYS = [0]; // Sunday

/**
 * Checks if a slot is available for a given date based on cutoff time.
 * @param slot The DeliverySlot to check
 * @param dateStr ISO Date string YYYY-MM-DD
 * @param now Optional Date object for testing/mocking
 */
export function isSlotAvailable(slot: DeliverySlot, dateStr: string, now = new Date()): boolean {
    const targetDate = new Date(dateStr + "T00:00:00");
    const sameDay = targetDate.getDate() === now.getDate() && targetDate.getMonth() === now.getMonth();

    // If target date is in the past (and not today), it's unavailable
    const todayZero = new Date(now);
    todayZero.setHours(0, 0, 0, 0);
    if (targetDate < todayZero) return false;

    // Cutoff Logic
    // Target time is date + startTime hours.
    const targetTime = new Date(targetDate);
    targetTime.setHours(slot.startTime, 0, 0, 0);

    // If target time is LESS than (now + cutoffHours), it's too late.
    // e.g. Target 13:00. Cutoff 4h. Need to book by 09:00.
    // If now is 10:00. 10 + 4 = 14:00. 14 > 13. Unavailable.

    const timeWithCutoff = new Date(now.getTime() + (slot.cutoffHours * 60 * 60 * 1000));

    if (timeWithCutoff > targetTime) {
        return false;
    }

    return true;
}
