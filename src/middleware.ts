import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protect /admin routes
    if (path.startsWith('/admin')) {
        // Skip login page itself if it exists inside /admin
        if (path === '/admin/login') {
            return NextResponse.next();
        }

        // Check for session cookie
        // Using "soft gate" strategy as requested for P0 if no full session system exist
        const session = request.cookies.get('session') || request.cookies.get('__session');

        if (!session) {
            // Redirect to root if no session, or /admin/login if we confirm it exists
            // We use / for safety to avoid loops
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
};
