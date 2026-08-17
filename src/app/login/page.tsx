"use client";

import React, { useState } from "react";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ConfigErrorBanner } from "@/components/ui/ConfigErrorBanner";
import { useCompanyBranding } from "@/lib/branding";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const isConfigError = searchParams.get("error") === "config_required";

  const branding = useCompanyBranding();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    }
  };

  if (isConfigError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <ConfigErrorBanner />
      </div>
    );
  }

  const logoSrc = branding.logoUrl || "https://hqdeexzbzqptedurwxbq.supabase.co/storage/v1/object/public/company-branding/Madola-Right-logo-yJETPfnRlMe2UuUHxD0b0ziiUTpDCp.webp";
  const loginBgColor = branding.loginBackgroundColor || "var(--brand-login-background, #f5f7f6)";
  const loginCardColor = branding.loginCardColor || "var(--brand-login-card, #ffffff)";
  const buttonBgColor = branding.buttonColor || "var(--brand-button, #10b981)";
  const buttonTextColor = branding.buttonTextColor || "var(--brand-button-text, #ffffff)";

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 select-none transition-colors"
      style={{ backgroundColor: loginBgColor }}
    >
      {/* Container Card */}
      <div
        className="w-full max-w-md border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6 transition-colors"
        style={{ backgroundColor: loginCardColor }}
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center py-1">
            <img
              src={logoSrc}
              alt={`${branding.companyName || "Madola Energy"} Logo`}
              onError={(e) => {
                // Fallback to static SVG if primary image fails to load
                (e.currentTarget as HTMLImageElement).src = "/branding/madola-energy-logo-light.svg";
              }}
              className="w-48 sm:w-60 h-auto object-contain max-h-20 transition-all duration-200"
            />
          </div>
          <div className="pt-1 space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {branding.companyName || "Madola"} Proposal Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in to your account
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="staff@example.co.uk"
              required
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              className="h-11 sm:h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              className="h-11 sm:h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 sm:h-12 mt-2 font-bold rounded-xl shadow-md transition-opacity hover:opacity-90 flex items-center justify-center text-sm"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer Security Notice */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Restricted to Authorized {branding.companyName || "Madola Energy"} Staff</span>
        </div>
      </div>
    </div>
  );
}
