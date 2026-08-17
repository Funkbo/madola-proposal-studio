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
      className="hidden md:flex flex-col w-64 border-r border-slate-800/80 min-h-screen shrink-0 transition-colors"
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
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-950">
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                {branding.companyName.split(" ")[0] || "MADOLA"}
              </h1>
              <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mt-0.5">Proposal Studio</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5" aria-label="Sidebar main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.iconName];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                isActive
                  ? "bg-emerald-600/15 text-emerald-400 font-semibold border-l-4 border-emerald-500 pl-2.5"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                )}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
          <div className="truncate">
            <p className="font-medium text-slate-300 truncate">{branding.companyName}</p>
            <p className="text-[11px] text-slate-500">{COMPANY_INFO.version}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
