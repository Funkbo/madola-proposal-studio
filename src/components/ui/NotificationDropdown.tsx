"use client";

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, CheckCircle, UserPlus, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "proposal_accepted" | "proposal_created" | "customer_created" | "proposal_viewed" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "madola_notifications";

function getStoredNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
    }
  } catch {}
  return [];
}

function saveNotifications(notifications: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => getStoredNotifications());

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Listen for notifications written from outside the provider (e.g. server
  // actions, public proposal pages, upload flows) so the bell stays in sync.
  useEffect(() => {
    function handleExternalChange() {
      setNotifications(getStoredNotifications());
    }
    window.addEventListener("madola-notifications-changed", handleExternalChange);
    window.addEventListener("storage", handleExternalChange);
    return () => {
      window.removeEventListener("madola-notifications-changed", handleExternalChange);
      window.removeEventListener("storage", handleExternalChange);
    };
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  proposal_accepted: CheckCircle,
  proposal_created: FileText,
  customer_created: UserPlus,
  proposal_viewed: ExternalLink,
  system: Bell,
};

function getIcon(type: NotificationType) {
  return ICONS[type] || Bell;
}

const ICON_CLASSES: Record<NotificationType, string> = {
  proposal_accepted: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  proposal_created: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  customer_created: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  proposal_viewed: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
  system: "text-slate-500 bg-slate-100 dark:bg-slate-900/30",
};

const TITLES: Record<NotificationType, string> = {
  proposal_accepted: "Proposal Accepted",
  proposal_created: "New Proposal Created",
  customer_created: "New Customer Added",
  proposal_viewed: "Proposal Viewed",
  system: "System Notification",
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.read) markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearAll();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none relative transition-all active:scale-95",
          mounted && unreadCount > 0 && "text-emerald-500"
        )}
        aria-label={`Notifications${mounted && unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {mounted && unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center px-1.5 animate-pulse-glow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50"
            role="menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-8 text-center"
                >
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    You'll see updates here when proposals are accepted, customers are added, or proposals are viewed.
                  </p>
                </motion.div>
              ) : (
                <ul className="py-2" role="listbox">
                  {notifications.map((notification, index) => (
                    <motion.li
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                        !notification.read && "bg-emerald-50/50 dark:bg-emerald-900/10"
                      )}
                      onClick={(e) => handleNotificationClick(notification, e)}
                      role="option"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-xl flex-shrink-0",
                          ICON_CLASSES[notification.type]
                        )}>
                          {(() => {
                            const Icon = getIcon(notification.type);
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "font-medium text-slate-900 dark:text-slate-100 text-sm",
                              !notification.read && "font-semibold"
                            )}>
                              {TITLES[notification.type]}
                            </p>
                            <time className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                              {formatTimeAgo(notification.timestamp)}
                            </time>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                          {notification.actionUrl && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                              {notification.actionLabel || "View details"}
                            </div>
                          )}
                          {!notification.read && (
                            <div className="mt-2 w-full h-0.5 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions to trigger notifications from anywhere (server actions,
// upload flows, public proposal pages). Writes directly to localStorage and
// dispatches an event so an open NotificationProvider re-syncs immediately.
function pushNotification(
  type: NotificationType,
  title: string,
  description: string,
  actionUrl?: string,
  actionLabel?: string
) {
  if (typeof window === "undefined") return;

  const notification: Notification = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    description,
    timestamp: new Date(),
    read: false,
    actionUrl,
    actionLabel,
  };

  try {
    const stored = getStoredNotifications();
    saveNotifications([notification, ...stored].slice(0, 50));
  } catch {}

  window.dispatchEvent(new CustomEvent("madola-notifications-changed"));
}

export function notifyProposalAccepted(proposalRef: string, customerName: string, actionUrl?: string) {
  pushNotification(
    "proposal_accepted",
    "Proposal Accepted",
    `${customerName} accepted proposal ${proposalRef}`,
    actionUrl,
    "View Proposal"
  );
}

export function notifyCustomerCreated(customerName: string, customerId: string) {
  pushNotification(
    "customer_created",
    "New Customer Added",
    `${customerName} added to the customer directory`,
    customerId ? `/customers/${customerId}` : "/customers",
    "View Customer"
  );
}

export function notifyProposalCreated(proposalRef: string, customerName: string, actionUrl?: string) {
  pushNotification(
    "proposal_created",
    "New Proposal Created",
    `Proposal ${proposalRef} created for ${customerName}`,
    actionUrl,
    "View Proposal"
  );
}

export function notifyProposalViewed(proposalRef: string, customerName: string) {
  pushNotification(
    "proposal_viewed",
    "Proposal Viewed",
    `${customerName} viewed proposal ${proposalRef}`,
    undefined,
    undefined
  );
}