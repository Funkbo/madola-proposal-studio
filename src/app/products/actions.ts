"use server";

import { createProduct } from "@/lib/services/products";
import { ProductCategory } from "@/types/product";
import { redirect } from "next/navigation";

export async function createProductAction(formData: FormData) {
  const category = formData.get("category") as ProductCategory;
  const manufacturer = formData.get("manufacturer") as string;
  const model = formData.get("model") as string;
  const description = (formData.get("description") as string) || undefined;
  const capacityStr = formData.get("capacity") as string;
  const unit = (formData.get("unit") as string) || undefined;

  if (!category || !manufacturer || !model) {
    return { error: "Category, Manufacturer, and Model are required." };
  }

  const capacity = capacityStr ? parseFloat(capacityStr) : undefined;

  const { product, error } = await createProduct({
    category,
    manufacturer,
    model,
    description,
    capacity,
    unit,
  });

  if (error || !product) {
    return { error: error || "Failed to create product record." };
  }

  redirect("/products");
}
