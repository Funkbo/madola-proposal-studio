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
  X,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  LayoutTemplate,
  Settings,
};

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex flex-col w-72 max-w-[80vw] bg-slate-900 text-slate-100 min-h-full shadow-2xl z-10">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {!logoError && branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                onError={() => setLogoError(true)}
                className="max-w-[150px] w-auto max-h-9 object-contain object-left"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-600 text-white">
                  <Sun className="w-4 h-4 text-amber-300 fill-amber-300" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white leading-none">
                    {branding.companyName.split(" ")[0] || "MADOLA"}
                  </h2>
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase">Proposal Studio</p>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.iconName];
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  isActive
                    ? "bg-emerald-600/20 text-emerald-400 font-semibold border-l-4 border-emerald-500 pl-2.5"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400")} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <p className="text-xs font-medium text-slate-300">{branding.companyName}</p>
          <p className="text-[11px] text-slate-500">{COMPANY_INFO.version}</p>
        </div>
      </div>
    </div>
  );
}
