"use client";

import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  default: 5000,
  success: 4000,
  error: 7000,
  warning: 6000,
  info: 5000,
  loading: Infinity,
};

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const ICON_CLASSES: Record<ToastType, string> = {
  default: "text-blue-500",
  success: "text-emerald-500",
  error: "text-rose-500",
  warning: "text-amber-500",
  info: "text-blue-500",
  loading: "text-emerald-500 animate-spin",
};

const BORDER_CLASSES: Record<ToastType, string> = {
  default: "border-blue-200 dark:border-blue-800",
  success: "border-emerald-200 dark:border-emerald-800",
  error: "border-rose-200 dark:border-rose-800",
  warning: "border-amber-200 dark:border-amber-800",
  info: "border-blue-200 dark:border-blue-800",
  loading: "border-emerald-200 dark:border-emerald-800",
};

const BG_CLASSES: Record<ToastType, string> = {
  default: "bg-blue-50 dark:bg-blue-950/40",
  success: "bg-emerald-50 dark:bg-emerald-950/40",
  error: "bg-rose-50 dark:bg-rose-950/40",
  warning: "bg-amber-50 dark:bg-amber-950/40",
  info: "bg-blue-50 dark:bg-blue-950/40",
  loading: "bg-emerald-50 dark:bg-emerald-950/40",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (toast.duration === Infinity || toast.type === "loading") return;

    const duration = toast.duration ?? DEFAULT_DURATIONS[toast.type];
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        "min-w-[320px] max-w-[480px]",
        BG_CLASSES[toast.type],
        BORDER_CLASSES[toast.type],
        "hover:shadow-xl hover:border-emerald-300/50 dark:hover:border-emerald-700/50 transition-all duration-200"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn("w-5 h-5", ICON_CLASSES[toast.type])} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{toast.description}</p>
        )}
        {toast.action && (
          <div className="mt-3">{toast.action}</div>
        )}
      </div>

      {toast.dismissible !== false && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {(toast.duration !== Infinity && toast.type !== "loading") && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl"
          style={{
            backgroundColor: "var(--brand-primary, #10b981)",
            width: `${(1 - progress) * 100}%`,
          }}
          animate={{ width: `${(1 - progress) * 100}%` }}
          transition={{ duration: 50, ease: "linear" }}
          initial={false}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, dismissAll }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <AnimatePresence mode="popLayout">
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </AnimatePresence>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience hooks
export function useToastActions() {
  const { addToast, dismissToast, dismissAll } = useToast();

  const success = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: "success", title, description, ...options }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: "error", title, description, ...options }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: "warning", title, description, ...options }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: "info", title, description, ...options }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: "loading", title, description, duration: Infinity, ...options }),
    [addToast]
  );

  const dismiss = useCallback(
    (id: string) => dismissToast(id),
    [dismissToast]
  );

  return { success, error, warning, info, loading, dismiss, dismissAll };
}