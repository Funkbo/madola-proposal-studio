export type ProductCategory = "panel" | "inverter" | "battery" | "ev_charger" | "other";

export interface Product {
  id: string;
  category: ProductCategory;
  manufacturer: string;
  model: string;
  description?: string | null;
  capacity?: number | null;
  unit?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
