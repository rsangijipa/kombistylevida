import { db } from "@/lib/firebase";
import { doc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { InventoryMovement } from "@/types/firestore";

/**
 * Adjusts stock level for a product.
 * Used by Admin to manually add/remove stock or correct numbers.
 */
export async function adjustStock(productId: string, quantity: number, reason: string, type: 'IN' | 'OUT' | 'ADJUST') {
    const inventoryRef = doc(db, "inventory", productId);
    const movementRef = collection(db, "stockMovements");

    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(inventoryRef);
        let currentStock = 0;
        let reservedStock = 0;

        if (sfDoc.exists()) {
            currentStock = sfDoc.data().currentStock || 0;
            reservedStock = sfDoc.data().reservedStock || 0;
        }

        let newStock = currentStock;
        if (type === 'IN') newStock += quantity;
        if (type === 'OUT') newStock -= quantity;
        if (type === 'ADJUST') newStock = quantity; // Absolute set

        // Update Inventory Doc
        transaction.set(inventoryRef, {
            productId,
            currentStock: newStock,
            reservedStock,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // Log Movement
        const movement: Omit<InventoryMovement, 'id'> = {
            productId,
            type,
            quantity: type === 'ADJUST' ? quantity : Math.abs(quantity),
            reason,
            createdAt: new Date().toISOString()
        };
        transaction.set(doc(movementRef), movement);
    });
}

/**
 * Reserves stock for an order.
 * Called when a new order is created.
 * soft: If stock < 0, we still allow it (backorder), but track it.
 */
export async function reserveStock(productId: string, quantity: number, orderId: string) {
    const inventoryRef = doc(db, "inventory", productId);
    const movementRef = collection(db, "stockMovements");

    await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(inventoryRef);
        let currentStock = 0;
        let reservedStock = 0;

        if (sfDoc.exists()) {
            currentStock = sfDoc.data().currentStock || 0;
            reservedStock = sfDoc.data().reservedStock || 0;
        }

        // Logic: specific business rule. 
        // Do we deduct from current now? Or just increase reserved?
        // Let's increase RESERVED. Current Stock remains "Physical in warehouse".
        // Available = Current - Reserved.

        transaction.set(inventoryRef, {
            productId,
            currentStock, // Physical stock doesn't change until delivery/packing
            reservedStock: reservedStock + quantity,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        // Log Movement
        const movement: Omit<InventoryMovement, 'id'> = {
            productId,
            type: 'RESERVE',
            quantity,
            reason: 'Order Created',
            orderId,
            createdAt: new Date().toISOString()
        };
        transaction.set(doc(movementRef), movement);
    });
}
