import React from "react";
import { ProductsList } from "@/components/products/ProductsList";
import { getProducts } from "@/lib/services/products";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ConfigErrorBanner } from "@/components/ui/ConfigErrorBanner";

export default async function ProductsPage() {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    return <ConfigErrorBanner />;
  }

  const products = await getProducts();

  return <ProductsList initialProducts={products} />;
}
