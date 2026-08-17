"use client";

import React, { useState } from "react";
import { CompanyBrandingSettings } from "./CompanyBrandingSettings";
import { UserManagementSettings } from "./UserManagementSettings";
import { ProposalSettings } from "./ProposalSettings";
import { Building2, Users, FileSliders, ShieldAlert } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface SettingsContainerProps {
  currentUserProfile: {
    id: string;
    fullName: string;
    role: string;
    email: string;
  } | null;
}

export function SettingsContainer({ currentUserProfile }: SettingsContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "branding";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const isAdmin = currentUserProfile?.role === "admin";

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/settings?tab=${tabId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Admin & Studio Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage brand identity, theme color patterns, user permissions, and proposal system rules.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => handleTabChange("branding")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "branding"
              ? "border-[var(--brand-primary,#10b981)] text-[var(--brand-primary,#10b981)]"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Branding</span>
        </button>

        <button
          onClick={() => handleTabChange("users")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "users"
              ? "border-[var(--brand-primary,#10b981)] text-[var(--brand-primary,#10b981)]"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          {isAdmin ? (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Admin
            </span>
          ) : (
            <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
              Locked
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange("defaults")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all whitespace-nowrap ${
            activeTab === "defaults"
              ? "border-[var(--brand-primary,#10b981)] text-[var(--brand-primary,#10b981)]"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FileSliders className="w-4 h-4" />
          <span>Proposal Defaults</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === "branding" && <CompanyBrandingSettings />}

        {activeTab === "users" && (
          <UserManagementSettings
            currentUserRole={currentUserProfile?.role || "salesperson"}
            currentUserId={currentUserProfile?.id || ""}
          />
        )}

        {activeTab === "defaults" && <ProposalSettings />}
      </div>
    </div>
  );
}
