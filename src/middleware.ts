import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isAdminPage = path.startsWith('/admin');
    const isAdminApi = path.startsWith('/api/admin');

    // 1. Protect /admin pages and /api/admin endpoints
    if (isAdminPage || isAdminApi) {
        // Skip login page itself if it exists inside /admin
        if (path === '/admin/login') {
            return NextResponse.next();
        }

        // Check for session cookie
        const session = request.cookies.get('session') || request.cookies.get('__session');
        const authHeader = request.headers.get('authorization');
        const hasBearerToken = !!authHeader && authHeader.startsWith('Bearer ');

        if (!session && !hasBearerToken) {
            if (isAdminApi) {
                return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
            }

            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
    ],
};
