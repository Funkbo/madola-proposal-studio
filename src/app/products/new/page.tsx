import React from "react";
import { CreateProductForm } from "@/components/products/CreateProductForm";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ConfigErrorBanner } from "@/components/ui/ConfigErrorBanner";

export default async function NewProductPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <ConfigErrorBanner />;
  }

  return <CreateProductForm />;
}
