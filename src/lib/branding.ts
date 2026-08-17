"use client";

import { useBrandingContext } from "@/components/providers/BrandingProvider";
import {
  DEFAULT_BRANDING_DATA,
  PUBLIC_SUPABASE_LOGO_URL,
  CompanyBrandingData,
} from "@/lib/repositories/companyBrandingRepository";

export interface CompanyBrandingTheme extends CompanyBrandingData {
  logoUrl: string;
  email: string;
  phone: string;
  address: string;
}

export const DEFAULT_BRANDING_THEME: CompanyBrandingTheme = {
  ...DEFAULT_BRANDING_DATA,
  logoUrl: PUBLIC_SUPABASE_LOGO_URL,
  email: DEFAULT_BRANDING_DATA.contactEmail,
  phone: DEFAULT_BRANDING_DATA.contactPhone,
  address: DEFAULT_BRANDING_DATA.officeAddress,
};

export function useCompanyBranding(): CompanyBrandingTheme {
  const contextBranding = useBrandingContext();
  const activeData = contextBranding || DEFAULT_BRANDING_DATA;

  return {
    ...activeData,
    logoUrl: activeData.logoUrl || PUBLIC_SUPABASE_LOGO_URL,
    email: activeData.contactEmail || DEFAULT_BRANDING_THEME.email,
    phone: activeData.contactPhone || DEFAULT_BRANDING_THEME.phone,
    address: activeData.officeAddress || DEFAULT_BRANDING_THEME.address,
  };
}
