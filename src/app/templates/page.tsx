import React from "react";
import { TemplatesList } from "@/components/templates/TemplatesList";
import { getTemplates } from "@/lib/services/templates";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ConfigErrorBanner } from "@/components/ui/ConfigErrorBanner";

export default async function TemplatesPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <ConfigErrorBanner />;
  }

  const templates = await getTemplates();

  return <TemplatesList initialTemplates={templates} />;
}
