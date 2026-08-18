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
      </head>
      <body className="h-full">
        <BrandingProvider>
          <AppShell userProfile={userProfile}>{children}</AppShell>
        </BrandingProvider>
      </body>
    </html>
  );
}
