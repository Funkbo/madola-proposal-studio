import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  getPublicCompanyBranding,
  type CompanyBrandingData,
} from "@/lib/repositories/companyBrandingRepository";

export const dynamic = "force-dynamic";

// Brand colors are rendered into the initial HTML so the login page paints
// with the correct colors on the very first frame (no flash, no re-render).
function buildBrandingCss(b: Partial<CompanyBrandingData>): string {
  const primary = b.primaryColor || "#10b981";
  const secondary = b.secondaryColor || "#0f172a";
  const sidebarBg = b.sidebarBackgroundColor || "#0b1428";
  const sidebarText = b.sidebarTextColor || "#ffffff";
  const loginBg = b.loginBackgroundColor || "#f5f7f6";
  const loginCard = b.loginCardColor || "#ffffff";
  const button = b.buttonColor || primary;
  const buttonText = b.buttonTextColor || "#ffffff";
  return (
    `:root{--brand-primary:${primary};--brand-primary-hover:${primary};--brand-secondary:${secondary};` +
    `--brand-sidebar-background:${sidebarBg};--brand-sidebar-text:${sidebarText};` +
    `--brand-login-background:${loginBg};--brand-login-card:${loginCard};` +
    `--brand-button:${button};--brand-button-text:${buttonText};` +
    `--border-focus:${primary};--color-success:${primary};}`
  );
}

export default async function LoginPage() {
  let publicBranding: Partial<CompanyBrandingData> = {};
  try {
    publicBranding = await getPublicCompanyBranding();
  } catch {
    // Fall back to default colors; the client provider will retry.
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: buildBrandingCss(publicBranding) }} />
      <LoginForm initialBranding={publicBranding} />
    </>
  );
}