"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CompanyBrandingData,
  DEFAULT_BRANDING_DATA,
  getCompanyBranding,
  getCachedCompanyBranding,
  getPublicCompanyBranding,
  applyThemeCssVariables,
} from "@/lib/repositories/companyBrandingRepository";
import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";

const BrandingContext = createContext<CompanyBrandingData>(DEFAULT_BRANDING_DATA);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // NOTE: initial state must be identical on server and client (no localStorage
  // reads here) or hydration mismatches crash the page. Cached colors are applied
  // as CSS variables before paint instead — see layout.tsx head script.
  const [branding, setBranding] = useState<CompanyBrandingData>(DEFAULT_BRANDING_DATA);

  // Apply cached brand colors before first paint (pure side effect, no render)
  useLayoutEffect(() => {
    const cached = getCachedCompanyBranding();
    if (cached) applyThemeCssVariables(cached);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncBranding = async () => {
      // For unauthenticated login page, use secure public-safe branding metadata from Supabase
      if (pathname === "/login") {
        try {
          const publicData = await getPublicCompanyBranding();
          if (isMounted) {
            const merged = { ...DEFAULT_BRANDING_DATA, ...publicData };
            setBranding(merged);
            applyThemeCssVariables(merged);
          }
        } catch (e) {
          if (isMounted) {
            setBranding(DEFAULT_BRANDING_DATA);
            applyThemeCssVariables(DEFAULT_BRANDING_DATA);
          }
        }
        return;
      }

      try {
        const data = await getCompanyBranding();
        if (isMounted && data) {
          setBranding(data);
          applyThemeCssVariables(data);
        }
      } catch (e) {
        console.warn("BrandingProvider sync failed", e);
      }
    };

    syncBranding();

    // Subscribe to Supabase Auth state transitions
    let authSubscription: { unsubscribe: () => void } | null = null;
    getSupabaseClient().then((supabase) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
          syncBranding();
        } else if (event === "SIGNED_OUT") {
          if (isMounted) {
            setBranding(DEFAULT_BRANDING_DATA);
            applyThemeCssVariables(DEFAULT_BRANDING_DATA);
          }
        }
      });
      authSubscription = subscription;
    }).catch((e) => {
      console.warn("Failed to subscribe to auth state in BrandingProvider", e);
    });

    const handleUpdate = () => {
      syncBranding();
    };

    const handleLivePreview = (e: Event) => {
      const customEvt = e as CustomEvent<CompanyBrandingData>;
      if (customEvt.detail && isMounted) {
        setBranding(customEvt.detail);
        applyThemeCssVariables(customEvt.detail);
      }
    };

    window.addEventListener("madola_branding_updated", handleUpdate);
    window.addEventListener("madola_theme_preview", handleLivePreview);

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      window.removeEventListener("madola_branding_updated", handleUpdate);
      window.removeEventListener("madola_theme_preview", handleLivePreview);
    };
  }, [pathname]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBrandingContext(): CompanyBrandingData {
  return useContext(BrandingContext);
}
