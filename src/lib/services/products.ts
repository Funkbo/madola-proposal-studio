import { createClient } from "@/lib/supabase/server";
import { Product, ProductCategory } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, category, manufacturer, model, description, capacity, unit, image_url, active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    category: row.category as ProductCategory,
    manufacturer: row.manufacturer,
    model: row.model,
    description: row.description,
    capacity: row.capacity,
    unit: row.unit,
    imageUrl: row.image_url,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createProduct(payload: {
  category: ProductCategory;
  manufacturer: string;
  model: string;
  description?: string;
  capacity?: number;
  unit?: string;
}): Promise<{ product: Product | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert({
      category: payload.category,
      manufacturer: payload.manufacturer,
      model: payload.model,
      description: payload.description || null,
      capacity: payload.capacity || null,
      unit: payload.unit || null,
      active: true,
    })
    .select()
    .single();

  if (error || !data) {
    return { product: null, error: error?.message || "Failed to create product record." };
  }

  return {
    product: {
      id: data.id,
      category: data.category as ProductCategory,
      manufacturer: data.manufacturer,
      model: data.model,
      description: data.description,
      capacity: data.capacity,
      unit: data.unit,
      imageUrl: data.image_url,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    error: null,
  };
}
