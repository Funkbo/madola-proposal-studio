import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUserProfile } from "@/lib/services/profile";

export const metadata: Metadata = {
  title: "Madola Proposal Studio | Interactive Solar Proposals",
  description: "Proprietary interactive solar proposal platform for Madola Energy UK.",
};

import { BrandingProvider } from "@/components/providers/BrandingProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getCurrentUserProfile();

  const userProfile = profile
    ? {
        fullName: profile.fullName,
        role: profile.role,
        email: user?.email || "",
      }
    : null;

  return (
    <html lang="en-GB" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var b=JSON.parse(localStorage.getItem("madola_branding_cache_v2")||"null");if(!b||typeof b!=="object")return;var r=document.documentElement,p=b.primaryColor||"#10b981";r.style.setProperty("--brand-primary",p);r.style.setProperty("--brand-primary-hover",p);r.style.setProperty("--brand-secondary",b.secondaryColor||"#0f172a");r.style.setProperty("--brand-sidebar-background",b.sidebarBackgroundColor||"#0b1428");r.style.setProperty("--brand-sidebar-text",b.sidebarTextColor||"#ffffff");r.style.setProperty("--brand-login-background",b.loginBackgroundColor||"#f5f7f6");r.style.setProperty("--brand-login-card",b.loginCardColor||"#ffffff");r.style.setProperty("--brand-button",b.buttonColor||p);r.style.setProperty("--brand-button-text",b.buttonTextColor||"#ffffff");r.style.setProperty("--border-focus",p);r.style.setProperty("--color-success",p);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full">
        <BrandingProvider>
          <AppShell userProfile={userProfile}>{children}</AppShell>
        </BrandingProvider>
      </body>
    </html>
  );
}
