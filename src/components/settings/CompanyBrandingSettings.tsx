"use client";

import React, { useState, useEffect } from "react";
import { useCompanyBranding } from "@/lib/branding";
import {
  uploadCompanyLogo,
  updateCompanyBranding,
  getCompanyBrandingAssets,
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
} from "lucide-react";

export function CompanyBrandingSettings() {
  const activeBranding = useCompanyBranding();

  const [formData, setFormData] = useState<CompanyBrandingData>(activeBranding);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<StorageAsset[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData(activeBranding);
  }, [activeBranding.logoUrl, activeBranding.primaryColor, activeBranding.sidebarBackgroundColor]);

  const handleChange = (field: keyof CompanyBrandingData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
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
      setSuccessMsg("Company branding & theme saved successfully in Supabase!");
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
      setSuccessMsg("Reset to default Madola Energy branding!");
      setTimeout(() => setSuccessMsg(null), 4000);
    }

    setIsSaving(false);
  };

  const activeLogoUrl = formData.logoUrl || DEFAULT_BRANDING_DATA.logoUrl;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans antialiased pb-12">
      
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Company Branding & Theme Settings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralize your logo, theme colors, and brand identity persisted directly in Supabase.
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
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              Company Logo (Supabase Storage: company-branding)
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
                  <Zap className="w-6 h-6 text-emerald-500" />
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
              <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
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

        {/* 2. LIVE THEME PREVIEW */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-500" />
            Live Application Theme Preview
          </label>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sidebar Preview */}
            <div
              className="p-4 rounded-xl shadow-md flex flex-col justify-between space-y-4"
              style={{ backgroundColor: formData.sidebarBackgroundColor, color: formData.sidebarTextColor }}
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="font-bold text-xs">Sidebar Preview</span>
              </div>
              <div className="space-y-1.5 text-[11px] opacity-90">
                <div className="px-2 py-1 rounded bg-white/10">Dashboard</div>
                <div className="px-2 py-1 rounded font-bold" style={{ color: formData.primaryColor }}>Proposals</div>
                <div className="px-2 py-1 rounded opacity-75">Customers</div>
              </div>
            </div>

            {/* Login Card Preview */}
            <div
              className="p-4 rounded-xl shadow-md flex flex-col justify-between space-y-3"
              style={{ backgroundColor: formData.loginBackgroundColor }}
            >
              <span className="text-[11px] font-bold text-slate-500">Login Preview</span>
              <div
                className="p-3 rounded-lg border border-slate-200 text-slate-900 shadow-sm text-xs space-y-2 text-center"
                style={{ backgroundColor: formData.loginCardColor }}
              >
                <span className="font-bold text-[11px] block">{formData.companyName} Studio</span>
                <div
                  className="py-1 px-3 rounded text-[10px] font-bold text-white mx-auto inline-block"
                  style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }}
                >
                  Sign In
                </div>
              </div>
            </div>

            {/* Button Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <MousePointer className="w-4 h-4 text-emerald-500" />
                <span>Button Styling</span>
              </div>
              <button
                type="button"
                className="w-full py-2 px-4 rounded-xl font-bold text-xs transition-opacity shadow-sm"
                style={{ backgroundColor: formData.buttonColor, color: formData.buttonTextColor }}
              >
                Primary Button Action
              </button>
            </div>

          </div>
        </div>

        {/* 3. BRAND COLOURS CONFIGURATION */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-500" />
            Brand Colours Configuration
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            {/* Primary Colour */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Primary Brand
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Secondary Colour */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Secondary Brand
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Sidebar Background */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Sidebar Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.sidebarBackgroundColor}
                  onChange={(e) => handleChange("sidebarBackgroundColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.sidebarBackgroundColor}
                  onChange={(e) => handleChange("sidebarBackgroundColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Sidebar Text */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Sidebar Text
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.sidebarTextColor}
                  onChange={(e) => handleChange("sidebarTextColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.sidebarTextColor}
                  onChange={(e) => handleChange("sidebarTextColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Login Background */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Login Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.loginBackgroundColor}
                  onChange={(e) => handleChange("loginBackgroundColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.loginBackgroundColor}
                  onChange={(e) => handleChange("loginBackgroundColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Login Card */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Login Card
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.loginCardColor}
                  onChange={(e) => handleChange("loginCardColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.loginCardColor}
                  onChange={(e) => handleChange("loginCardColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Button Colour */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Button Colour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.buttonColor}
                  onChange={(e) => handleChange("buttonColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.buttonColor}
                  onChange={(e) => handleChange("buttonColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Button Text */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Button Text
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.buttonTextColor}
                  onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white shrink-0"
                />
                <input
                  type="text"
                  value={formData.buttonTextColor}
                  onChange={(e) => handleChange("buttonTextColor", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono font-bold"
                />
              </div>
            </div>

          </div>
        </div>

        {/* 4. COMPANY CONTACT DETAILS */}
        <div className="space-y-4 pt-2">
          <label className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Company Contact Details
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Office Address
              </label>
              <input
                type="text"
                value={formData.officeAddress}
                onChange={(e) => handleChange("officeAddress", e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Global Branding"}</span>
          </button>
        </div>

      </div>

      {/* Storage Assets Library Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Select Logo from Storage (company-branding)
                </h3>
                <p className="text-xs text-slate-500">
                  Assets stored in public Supabase bucket
                </p>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingLibrary ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs">Fetching storage objects...</span>
              </div>
            ) : libraryAssets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No storage assets found in bucket. Upload a new logo above.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
                {libraryAssets.map((asset) => (
                  <div
                    key={asset.path}
                    onClick={() => handleSelectAsset(asset)}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all flex flex-col items-center gap-2 group"
                  >
                    <div className="w-full h-24 rounded-xl bg-white dark:bg-slate-900 p-2 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform">
                      <img src={asset.url} alt={asset.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
