"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Bell, Menu, LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";

export interface TopNavProps {
  onOpenMobileMenu: () => void;
  userProfile?: {
    fullName: string;
    role: string;
    email: string;
  } | null;
}

export function TopNav({ onOpenMobileMenu, userProfile }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
      {/* Left: Mobile menu toggle & Title/Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 active:scale-95 transition-all"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-full hidden sm:block">
          <Input
            placeholder="Search proposals, customers, postcodes..."
            icon={<Search className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />}
            className="h-10 bg-slate-50/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80 rounded-xl"
            aria-label="Search platform"
          />
        </div>
      </div>

      {/* Right: Quick action, notifications & User profile */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            window.location.href = "/proposals/new";
          }}
          className="hidden sm:inline-flex shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Proposal</span>
        </Button>

        <button
          type="button"
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none relative transition-all active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span
            className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse-glow"
            style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
          />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-1">
          <div
            className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-xs shadow-md border uppercase tracking-wider"
            style={{
              backgroundColor: "var(--brand-button, #10b981)",
              color: "var(--brand-button-text, #ffffff)",
              borderColor: "var(--brand-primary, #10b981)",
            }}
          >
            {userProfile?.fullName ? userProfile.fullName.substring(0, 2) : "ME"}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {userProfile?.fullName || "Madola Staff"}
            </p>
            <p
              className="text-[10px] capitalize font-bold tracking-wide"
              style={{ color: "var(--brand-primary, #10b981)" }}
            >
              {userProfile?.role || "Staff Member"}
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
            }}
            className="p-2 ml-1 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
