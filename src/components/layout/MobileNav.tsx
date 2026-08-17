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
      <div
        className="relative flex flex-col w-72 max-w-[80vw] min-h-full shadow-2xl z-10 transition-colors duration-200"
        style={{
          backgroundColor: "var(--brand-sidebar-background, #0b1428)",
          color: "var(--brand-sidebar-text, #ffffff)",
        }}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
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
                <div
                  className="p-1.5 rounded-md text-white"
                  style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
                >
                  <Sun className="w-4 h-4 text-amber-300 fill-amber-300" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-white leading-none">
                    {branding.companyName.split(" ")[0] || "MADOLA"}
                  </h2>
                  <p
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: "var(--brand-primary, #10b981)" }}
                  >
                    Proposal Studio
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none"
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
                  "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none",
                  isActive
                    ? "font-semibold shadow-sm"
                    : "opacity-80 hover:opacity-100 hover:bg-white/10"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "rgba(255, 255, 255, 0.12)",
                        color: "var(--brand-primary, #10b981)",
                        borderLeft: "4px solid var(--brand-primary, #10b981)",
                      }
                    : {}
                }
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isActive ? "var(--brand-primary, #10b981)" : "inherit",
                  }}
                  aria-hidden="true"
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <p className="text-xs font-medium text-white">{branding.companyName}</p>
          <p className="text-[11px] opacity-60">{COMPANY_INFO.version}</p>
        </div>
      </div>
    </div>
  );
}
