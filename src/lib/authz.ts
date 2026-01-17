
export type UserRole = 'admin' | 'staff' | 'driver' | 'content';

export const ROLES: Record<string, UserRole> = {
    ADMIN: 'admin',
    STAFF: 'staff',
    DRIVER: 'driver',
    CONTENT: 'content'
};

/**
 * Returns true if the user has one of the allowed roles.
 */
export function hasRole(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): boolean {
    if (!userRole) return false;
    if (userRole === 'admin') return true; // Admin accesses everything
    return allowedRoles.includes(userRole);
}

export const PERMISSIONS = {
    MANAGE_SETTINGS: ['admin'] as UserRole[],
    MANAGE_ORDERS: ['admin', 'staff'] as UserRole[],
    MANAGE_INVENTORY: ['admin', 'staff'] as UserRole[],
    VIEW_ROUTE: ['admin', 'staff', 'driver'] as UserRole[],
    MANAGE_CONTENT: ['admin', 'content'] as UserRole[],
    VIEW_LOGS: ['admin'] as UserRole[],
};
