export function logEvent(event: string, data: Record<string, any>) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...data
    }));
}

export function logError(event: string, error: any, data?: Record<string, any>) {
    console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        level: 'error',
        error: error.message || String(error),
        stack: error.stack,
        ...data
    }));
}
