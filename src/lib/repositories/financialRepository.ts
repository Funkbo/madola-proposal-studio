import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface FinancialData {
  id?: string;
  proposalId: string;
  systemPrice: number;
  vat: number;
  deposit: number;
  annualSaving: number;
  lifetimeSaving: number;
  paybackYears: number;
  electricityRate: number;
  exportRate: number;
  inflationRate: number;
}

const LOCAL_STORAGE_FINANCIALS_KEY = "madola_saved_financials";

function getLocalFinancials(): FinancialData[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_FINANCIALS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local financials fallback", e);
  }
  return [];
}

function saveLocalFinancial(data: FinancialData) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalFinancials();
    const updated = [data, ...current.filter((f) => f.proposalId !== data.proposalId)];
    localStorage.setItem(LOCAL_STORAGE_FINANCIALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving local financials fallback", e);
  }
}

export async function getFinancialsByProposalId(proposalId: string): Promise<FinancialData | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("financials")
        .select("*")
        .eq("proposal_id", proposalId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          proposalId: data.proposal_id,
          systemPrice: Number(data.system_price) || 7950,
          vat: Number(data.vat) || 0,
          deposit: Number(data.deposit) || 500,
          annualSaving: Number(data.annual_saving) || 1240,
          lifetimeSaving: Number(data.lifetime_saving) || 31000,
          paybackYears: Number(data.payback_years) || 6.4,
          electricityRate: Number(data.electricity_rate) || 0.28,
          exportRate: Number(data.export_rate) || 0.15,
          inflationRate: Number(data.inflation_rate) || 0.03,
        };
      }
    } catch (e) {
      console.warn("Supabase getFinancialsByProposalId failed; using local fallback", e);
    }
  }

  const local = getLocalFinancials();
  return local.find((f) => f.proposalId === proposalId) || null;
}

export async function saveFinancials(
  proposalId: string,
  data: FinancialData
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  const payload: FinancialData = { ...data, proposalId };
  saveLocalFinancial(payload);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("financials").upsert(
        {
          proposal_id: proposalId,
          system_price: payload.systemPrice,
          vat: payload.vat,
          deposit: payload.deposit,
          annual_saving: payload.annualSaving,
          lifetime_saving: payload.lifetimeSaving,
          payback_years: payload.paybackYears,
          electricity_rate: payload.electricityRate,
          export_rate: payload.exportRate,
          inflation_rate: payload.inflationRate,
        },
        { onConflict: "proposal_id" }
      );

      if (error) {
        console.warn("Supabase saveFinancials error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase saveFinancials exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
