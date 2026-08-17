"use client";

import React, { useState, useEffect } from "react";
import { useCompanyBranding } from "@/lib/branding";
import {
  uploadCompanyLogo,
  updateCompanyBranding,
  getCompanyBrandingAssets,
  getCompanyBranding,
  CompanyBrandingData,
  DEFAULT_BRANDING_DATA,
  StorageAsset,
  applyThemeCssVariables,
} from "@/lib/repositories/companyBrandingRepository";
import {
  Building2,
  Image as ImageIcon,
  Save,
  Check,
  RotateCcw,
  Zap,
  AlertCircle,
  X,
  Loader2,
  Palette,
  Eye,
  Layout,
  MousePointer,
  Sparkles,
} from "lucide-react";

/**
 * Ensures a valid 7-character #RRGGBB hex string for HTML color picker inputs.
 */
function formatHexColor(val: string | undefined | null, fallback: string): string {
  if (!val) return fallback;
  let str = val.trim();
  if (!str.startsWith("#")) str = "#" + str;
  if (/^#[0-9A-Fa-f]{6}$/.test(str)) return str;
  return fallback;
}

const COLOR_PRESETS = [
  { name: "Madola Emerald", primary: "#10b981", sidebar: "#0b1428", button: "#10b981" },
  { name: "Ocean Teal", primary: "#0ea5e9", sidebar: "#0c1e30", button: "#0ea5e9" },
  { name: "Royal Purple", primary: "#8b5cf6", sidebar: "#130924", button: "#8b5cf6" },
  { name: "Solar Amber", primary: "#f59e0b", sidebar: "#1c1917", button: "#f59e0b" },
  { name: "Crimson Energy", primary: "#f43f5e", sidebar: "#1a080d", button: "#f43f5e" },
  { name: "Deep Indigo", primary: "#6366f1", sidebar: "#090d1f", button: "#6366f1" },
];

export function CompanyBrandingSettings() {
  const activeBranding = useCompanyBranding();

  const [formData, setFormData] = useState<CompanyBrandingData>(activeBranding);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<StorageAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial fresh data directly from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFresh() {
      try {
        const fresh = await getCompanyBranding();
        if (isMounted && fresh) {
          setFormData(fresh);
          applyThemeCssVariables(fresh);
        }
      } catch (e) {
        console.warn("Could not fetch initial branding", e);
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    }
    loadFresh();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof CompanyBrandingData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      applyThemeCssVariables(updated);
      return updated;
    });
  };

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        primaryColor: preset.primary,
        buttonColor: preset.button,
        sidebarBackgroundColor: preset.sidebar,
      };
      applyThemeCssVariables(updated);
      return updated;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);

    const res = await uploadCompanyLogo(file);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.branding) {
      setFormData(res.branding);
      applyThemeCssVariables(res.branding);
      setSuccessMsg("Company logo uploaded directly to Supabase Storage & updated!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }

    setIsUploading(false);
  };

  const handleOpenLibrary = async () => {
    setIsMediaPickerOpen(true);
    setIsLoadingLibrary(true);
    const assets = await getCompanyBrandingAssets();
    setLibraryAssets(assets);
    setIsLoadingLibrary(false);
  };

  const handleSelectAsset = async (asset: StorageAsset) => {
    setIsMediaPickerOpen(false);
    setErrorMsg(null);

    const res = await updateCompanyBranding({
      logoPath: asset.path,
      logoUrl: asset.url,
    });

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.branding) {
      setFormData(res.branding);
      applyThemeCssVariables(res.branding);
      setSuccessMsg("Company logo updated from library!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setIsSaving(true);

    const res = await updateCompanyBranding({
      companyName: formData.companyName,
      logoPath: formData.logoPath,
      logoUrl: formData.logoUrl,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      sidebarBackgroundColor: formData.sidebarBackgroundColor,
      sidebarTextColor: formData.sidebarTextColor,
      loginBackgroundColor: formData.loginBackgroundColor,
      loginCardColor: formData.loginCardColor,
      buttonColor: formData.buttonColor,
      buttonTextColor: formData.buttonTextColor,
      website: formData.website,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      officeAddress: formData.officeAddress,
    });

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.branding) {
      setFormData(res.branding);
      applyThemeCssVariables(res.branding);
      setSuccessMsg("Company branding & theme colors saved successfully in Supabase!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }

    setIsSaving(false);
  };

  const handleResetDefaults = async () => {
    setErrorMsg(null);
    setIsSaving(true);

    const res = await updateCompanyBranding(DEFAULT_BRANDING_DATA);
    if (res.branding) {
      setFormData(res.branding);
      applyThemeCssVariables(res.branding);
      setSuccessMsg("Reset to default Madola Energy branding!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }

    setIsSaving(false);
  };

  const activeLogoUrl = formData.logoUrl || DEFAULT_BRANDING_DATA.logoUrl;

  if (isInitialLoading) {
    return (
      <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary,#10b981)]" />
        <span>Loading theme & branding settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans antialiased pb-12">
      
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[var(--brand-primary,#10b981)]" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Company Branding & Theme Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize logo, color palette, buttons, navigation background, and brand identity persisted in Supabase.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Status Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-8">
        
        {/* 1. LOGO MANAGEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />
              Company Logo (Supabase Storage)
            </label>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {activeLogoUrl ? (
                <div className="w-28 h-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <img src={activeLogoUrl} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-28 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <Zap className="w-6 h-6 text-[var(--brand-primary,#10b981)]" />
                </div>
              )}

              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                  {formData.companyName || "Madola Energy"} Logo
                </span>
                <span className="text-xs text-slate-500 font-mono block truncate max-w-xs mt-0.5">
                  Bucket: company-branding
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <label className="px-4 py-2 rounded-xl bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isUploading ? "Uploading..." : "Upload New Logo"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleOpenLibrary}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-sm"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Select from Library</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. THEME PRESETS */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />
            Quick Theme Color Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group flex items-center gap-2.5"
              >
                <div
                  className="w-5 h-5 rounded-full border border-white shadow-sm shrink-0"
                  style={{ backgroundColor: p.primary }}
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. LIVE THEME PREVIEW */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />
            Live Application Theme Preview
          </label>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sidebar Preview */}
            <div
              className="p-4 rounded-xl shadow-md flex flex-col justify-between space-y-4 transition-colors"
              style={{ backgroundColor: formData.sidebarBackgroundColor, color: formData.sidebarTextColor }}
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="font-bold text-xs">Sidebar Navigation</span>
              </div>
              <div className="space-y-1.5 text-[11px] opacity-90">
                <div className="px-2 py-1 rounded bg-white/10">Dashboard</div>
                <div className="px-2 py-1 rounded font-bold" style={{ color: formData.primaryColor }}>Proposals</div>
                <div className="px-2 py-1 rounded opacity-75">Customers</div>
              </div>
            </div>

            {/* Login Card Preview */}
            <div
              className="p-4 rounded-xl shadow-md flex flex-col justify-between space-y-3 transition-colors"
              style={{ backgroundColor: formData.loginBackgroundColor }}
            >
              <span className="text-[11px] font-bold text-slate-500">Login View</span>
              <div
                className="p-3 rounded-lg border border-slate-200 text-slate-900 shadow-sm text-xs space-y-2 text-center transition-colors"
                style={{ backgroundColor: formData.loginCardColor }}
              >
                <span className="font-bold text-[11px] block">{formData.companyName || "Madola"} Studio</span>
                <div
                  className="py-1 px-3 rounded text-[10px] font-bold mx-auto inline-block shadow-sm transition-colors"
                  style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }}
                >
                  Sign In
                </div>
              </div>
            </div>

            {/* Button Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <MousePointer className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />
                <span>Primary Buttons</span>
              </div>
              <button
                type="button"
                className="w-full py-2 px-4 rounded-xl font-bold text-xs transition-colors shadow-sm"
                style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }}
              >
                Accept Proposal Action
              </button>
            </div>

          </div>
        </div>

        {/* 4. BRAND COLOURS CONFIGURATION */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--brand-primary,#10b981)]" />
            Brand Colours Configuration
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Primary Colour */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Primary Brand Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.primaryColor, "#10b981")}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.primaryColor || "#10b981"}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Secondary Colour */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Secondary Brand Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.secondaryColor, "#0f172a")}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.secondaryColor || "#0f172a"}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Sidebar Background */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Sidebar Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.sidebarBackgroundColor, "#0b1428")}
                  onChange={(e) => handleChange("sidebarBackgroundColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.sidebarBackgroundColor || "#0b1428"}
                  onChange={(e) => handleChange("sidebarBackgroundColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Sidebar Text */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Sidebar Text Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.sidebarTextColor, "#ffffff")}
                  onChange={(e) => handleChange("sidebarTextColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.sidebarTextColor || "#ffffff"}
                  onChange={(e) => handleChange("sidebarTextColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Login Background */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Login Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.loginBackgroundColor, "#f5f7f6")}
                  onChange={(e) => handleChange("loginBackgroundColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.loginBackgroundColor || "#f5f7f6"}
                  onChange={(e) => handleChange("loginBackgroundColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Login Card */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Login Card Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.loginCardColor, "#ffffff")}
                  onChange={(e) => handleChange("loginCardColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.loginCardColor || "#ffffff"}
                  onChange={(e) => handleChange("loginCardColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Button Colour */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Button Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.buttonColor, "#10b981")}
                  onChange={(e) => handleChange("buttonColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.buttonColor || "#10b981"}
                  onChange={(e) => handleChange("buttonColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Button Text */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Button Text Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formatHexColor(formData.buttonTextColor, "#ffffff")}
                  onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.buttonTextColor || "#ffffff"}
                  onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 5. COMPANY DETAILS */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Company Identity & Contact
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website
              </label>
              <input
                type="text"
                value={formData.website || ""}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail || ""}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone || ""}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Office Address
              </label>
              <input
                type="text"
                value={formData.officeAddress || ""}
                onChange={(e) => handleChange("officeAddress", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 font-bold text-xs transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Branding & Theme</span>
          </button>
        </div>

      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                Select Logo from Supabase Storage
              </h3>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingLibrary ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-primary,#10b981)]" />
                <span>Loading storage bucket assets...</span>
              </div>
            ) : libraryAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No image assets found in the storage bucket.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                {libraryAssets.map((asset) => (
                  <button
                    key={asset.path}
                    type="button"
                    onClick={() => handleSelectAsset(asset)}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-emerald-500 transition-all flex flex-col items-center gap-2 group"
                  >
                    <div className="w-full h-20 bg-white dark:bg-slate-900 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                      <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate w-full text-center">
                      {asset.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
