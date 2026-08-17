"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, COMPANY_INFO } from "@/lib/constants";
import { useCompanyBranding } from "@/lib/branding";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  LayoutTemplate,
  Settings,
  Sun,
  ShieldCheck,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  LayoutTemplate,
  Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = useState(false);

  return (
    <aside
      className="hidden md:flex flex-col w-64 border-r border-slate-800/80 min-h-screen shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: "var(--brand-sidebar-background, #0b1428)",
        color: "var(--brand-sidebar-text, #ffffff)",
      }}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-start">
        {!logoError && branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.companyName}
            onError={() => setLogoError(true)}
            className="max-w-[180px] w-auto max-h-10 object-contain object-left"
          />
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-lg text-white shadow-md"
              style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
            >
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                {branding.companyName.split(" ")[0] || "MADOLA"}
              </h1>
              <p
                className="text-xs font-semibold tracking-wider uppercase mt-0.5"
                style={{ color: "var(--brand-primary, #10b981)" }}
              >
                Proposal Studio
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-6" aria-label="Sidebar main navigation">
        <div>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest px-3 mb-2 select-none">
            Studio Navigation
          </p>
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.iconName];
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 min-h-[44px]",
                    isActive
                      ? "font-bold shadow-sm"
                      : "opacity-80 hover:opacity-100 hover:bg-white/10 hover:translate-x-1"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          color: "var(--brand-primary, #10b981)",
                          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.15)",
                        }
                      : {}
                  }
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full shadow-md animate-pulse-glow"
                      style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
                    />
                  )}
                  <Icon
                    className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0"
                    style={{
                      color: isActive ? "var(--brand-primary, #10b981)" : "inherit",
                      opacity: isActive ? 1 : 0.75,
                    }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Info Badge */}
      <div className="p-4 border-t border-white/10 bg-black/20 select-none">
        <div className="flex items-center gap-2.5 text-xs opacity-80">
          <div
            className="p-1.5 rounded-lg border text-white shrink-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "var(--brand-primary, #10b981)",
            }}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="truncate">
            <p className="font-semibold text-white truncate">{branding.companyName}</p>
            <p className="text-[11px] opacity-60 font-medium">{COMPANY_INFO.version}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
