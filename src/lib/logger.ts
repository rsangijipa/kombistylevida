export function logEvent(event: string, data: Record<string, unknown>) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export function logError(event: string, error: unknown, data?: Record<string, unknown>) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        level: 'error',
        error: message,
        stack,
        ...data
    }));
}
