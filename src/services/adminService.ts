import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";
import { Order, InventoryItem } from "@/types/firestore";

export interface DashboardStats {
    ordersToday: number;
    revenueToday: number;
    pendingDelivery: number;
    lowStockCount: number;
    packsSold: number;
    returnsPending: number;
    salesHistory: { date: string; value: number }[];
    topFlavors: { name: string; qty: number }[];
}

// getDashboardStats migrated to /api/admin/stats

// getDailyRoutes migrated to /api/admin/routes
