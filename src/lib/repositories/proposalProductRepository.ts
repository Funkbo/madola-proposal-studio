import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { ExtraProduct } from "@/types/block-proposal";

export interface ProposalProductItem {
  id?: string;
  proposalId: string;
  productId?: string | null;
  quantity: number;
  unitPrice: number;
  included: boolean;
  customName: string;
  customDescription?: string | null;
}

const LOCAL_STORAGE_PRODUCTS_PREFIX = "madola_saved_products_";

function getLocalProposalProducts(proposalId: string): ProposalProductItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PRODUCTS_PREFIX}${proposalId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local proposal products fallback", e);
  }
  return [];
}

function saveLocalProposalProducts(proposalId: string, products: ProposalProductItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PRODUCTS_PREFIX}${proposalId}`, JSON.stringify(products));
  } catch (e) {
    console.error("Error saving local proposal products fallback", e);
  }
}

export async function getProposalProductsByProposalId(proposalId: string): Promise<ProposalProductItem[]> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("proposal_products")
        .select("*")
        .eq("proposal_id", proposalId);

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          proposalId: row.proposal_id,
          productId: row.product_id,
          quantity: row.quantity,
          unitPrice: Number(row.unit_price) || 0,
          included: row.included,
          customName: row.custom_name,
          customDescription: row.custom_description,
        }));
      }
    } catch (e) {
      console.warn("Supabase getProposalProductsByProposalId failed; using local fallback", e);
    }
  }

  return getLocalProposalProducts(proposalId);
}

export async function saveProposalProducts(
  proposalId: string,
  products: ProposalProductItem[]
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  saveLocalProposalProducts(proposalId, products);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      await supabase.from("proposal_products").delete().eq("proposal_id", proposalId);

      if (products.length > 0) {
        const rows = products.map((p) => ({
          proposal_id: proposalId,
          product_id: p.productId || null,
          quantity: p.quantity,
          unit_price: p.unitPrice,
          included: p.included,
          custom_name: p.customName,
          custom_description: p.customDescription || null,
        }));

        const { error } = await supabase.from("proposal_products").insert(rows);
        if (error) {
          console.warn("Supabase saveProposalProducts error:", error.message);
          return { success: false, error: error.message };
        }
      }

      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase saveProposalProducts exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
