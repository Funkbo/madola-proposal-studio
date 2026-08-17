"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";

export interface AppShellProps {
  children: React.ReactNode;
  userProfile?: {
    fullName: string;
    role: string;
    email: string;
  } | null;
}

export function AppShell({ children, userProfile }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname() || "";

  // Public customer routes (/p/) and authentication screens (/login, /auth, /sign-in) MUST hide internal sidebar & topnav.
  const isPublicOrAuthRoute =
    pathname === "/login" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/sign-in") ||
    pathname === "/p" ||
    pathname.startsWith("/p/");

  if (isPublicOrAuthRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden antialiased font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onOpenMobileMenu={() => setMobileNavOpen(true)} userProfile={userProfile} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
