import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AdminService } from "@/lib/firebase/adminDb";
import { generateToken, hashToken, parseKvOrderCookie } from "@/lib/security/token";
import { Order } from "@/types/firestore";

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const kvOrderCookie = cookieStore.get("kv_order");

        let existingOrder: Order | null = null;
        let orderId = "";
        let token = "";

        // 1. Validate Existing Cookie
        if (kvOrderCookie) {
            const parsed = parseKvOrderCookie(kvOrderCookie.value);
            if (parsed) {
                const order = await AdminService.getOrder(parsed.orderId);
                // Check if order exists, is actively usable, and token hash matches
                if (order && order.status === 'NEW' && !order.publicAccess?.revoked) {
                    // Verify Token Hash
                    const currentHash = hashToken(parsed.token);
                    if (currentHash === order.publicAccess?.tokenHash) {
                        existingOrder = order;
                        orderId = parsed.orderId;
                        token = parsed.token;
                    }
                }
            }
        }

        // 2. Return Existing or Create New
        if (existingOrder) {
            return NextResponse.json({
                order: existingOrder,
                orderId,
                reused: true
            });
        }

        // 3. Create New Draft Order
        // Generate new secure token
        token = generateToken();
        const tokenHash = hashToken(token);

        // Create Doc ID (slug-like or auto-id, let's use a timestamp prefix + random for sorting/uniqueness)
        orderId = `guest-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const newOrder: Partial<Order> = {
            id: orderId,
            shortId: orderId.slice(-6).toUpperCase(),
            status: 'NEW',
            items: [],
            totalCents: 0,
            customer: {
                name: "Guest",
                phone: "",
                deliveryMethod: "delivery"
            },
            schedule: {
                date: null,
                // slotId: undefined 
            },
            notes: "",
            publicAccess: {
                tokenHash,
                revoked: false,
                tokenLast4: token.slice(-4) // Debug aid
            },
            delivery: {
                type: 'ASAP',
                date: null,
                window: null,
                feeCents: 0
            }
        };

        // REMOVED: Writing to Firestore here causes "Ghost Orders" pollution.
        // We only generate the ID/Token for session security. 
        // The actual Order document will be created at Checkout.
        // await AdminService.createOrder(orderId, newOrder); 

        // Return the payload so frontend knows the ID, but it's ephemeral until Checkout.

        // 4. Set HttpOnly Cookie
        const cookieValue = `${orderId}.${token}`;
        cookieStore.set("kv_order", cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30 // 30 Days
        });

        return NextResponse.json({
            order: newOrder,
            orderId,
            reused: false
        });

    } catch (error) {
        console.error("Init Cart Error:", error);
        return NextResponse.json({
            error: "Failed to init cart",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
