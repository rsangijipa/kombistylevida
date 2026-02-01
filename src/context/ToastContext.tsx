"use client";

import React, { createContext, useContext, useCallback, useState, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error" | "info" | "loading";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, "id">) => string;
    removeToast: (id: string) => void;
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    loading: (message: string) => string; // Returns ID to allow removal
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idsRef = useRef(0);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(({ type, message, description, duration = 3000 }: Omit<Toast, "id">) => {
        const id = `toast-${++idsRef.current}`;
        const newToast: Toast = { id, type, message, description, duration };

        setToasts((prev) => [...prev, newToast]);

        if (type !== 'loading') {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, [removeToast]);

    const success = (message: string, description?: string) => addToast({ type: "success", message, description });
    const error = (message: string, description?: string) => addToast({ type: "error", message, description, duration: 4000 });
    const info = (message: string, description?: string) => addToast({ type: "info", message, description });
    const loading = (message: string) => addToast({ type: "loading", message, duration: 999999 });

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, loading }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed top-0 right-0 z-[9999] p-4 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-full fade-in",
                        toast.type === "success" && "border-green-200 bg-green-50/90 text-green-900",
                        toast.type === "error" && "border-red-200 bg-red-50/90 text-red-900",
                        toast.type === "info" && "border-blue-200 bg-blue-50/90 text-blue-900",
                        toast.type === "loading" && "border-olive/20 bg-paper/90 text-ink"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                            {toast.type === "info" && <Info className="h-5 w-5 text-blue-600" />}
                            {toast.type === "loading" && <Loader2 className="h-5 w-5 text-olive animate-spin" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold leading-tight">{toast.message}</h3>
                            {toast.description && (
                                <p className="mt-1 text-xs opacity-90">{toast.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {/* Progress Bar (Optional, simpler CSS animation preferred for MVP) */}
                    {toast.type !== 'loading' && (
                        <div className={cn(
                            "absolute bottom-0 left-0 h-1 bg-current opacity-20 transition-all w-full animate-toast-progress",
                        )} style={{ animationDuration: `${toast.duration}ms` }} />
                    )}
                </div>
            ))}
        </div>
    );
}
