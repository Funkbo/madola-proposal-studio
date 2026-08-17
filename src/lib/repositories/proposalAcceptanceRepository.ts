import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface ProposalAcceptanceData {
  id?: string;
  proposalId: string;
  status: "pending" | "accepted" | "declined";
  customerName?: string | null;
  customerEmail?: string | null;
  acceptedAt?: string | null;
  notes?: string | null;
}

const LOCAL_STORAGE_ACCEPTANCE_PREFIX = "madola_saved_acceptance_";

function getLocalAcceptance(proposalId: string): ProposalAcceptanceData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_ACCEPTANCE_PREFIX}${proposalId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local acceptance fallback", e);
  }
  return null;
}

function saveLocalAcceptance(proposalId: string, data: ProposalAcceptanceData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_ACCEPTANCE_PREFIX}${proposalId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving local acceptance fallback", e);
  }
}

export async function getProposalAcceptanceByProposalId(proposalId: string): Promise<ProposalAcceptanceData | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("proposal_acceptance")
        .select("*")
        .eq("proposal_id", proposalId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          proposalId: data.proposal_id,
          status: data.status as ProposalAcceptanceData["status"],
          customerName: data.customer_name,
          customerEmail: data.customer_email,
          acceptedAt: data.accepted_at,
          notes: data.notes,
        };
      }
    } catch (e) {
      console.warn("Supabase getProposalAcceptanceByProposalId failed; using local fallback", e);
    }
  }

  return getLocalAcceptance(proposalId);
}

export async function updateProposalAcceptance(
  proposalId: string,
  status: "pending" | "accepted" | "declined",
  customerName?: string,
  customerEmail?: string,
  notes?: string
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  const payload: ProposalAcceptanceData = {
    proposalId,
    status,
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    acceptedAt: status === "accepted" ? new Date().toISOString() : null,
    notes: notes || null,
  };

  saveLocalAcceptance(proposalId, payload);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("proposal_acceptance").upsert(
        {
          proposal_id: proposalId,
          status,
          customer_name: payload.customerName,
          customer_email: payload.customerEmail,
          accepted_at: payload.acceptedAt,
          notes: payload.notes,
        },
        { onConflict: "proposal_id" }
      );

      if (error) {
        console.warn("Supabase updateProposalAcceptance error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase updateProposalAcceptance exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
