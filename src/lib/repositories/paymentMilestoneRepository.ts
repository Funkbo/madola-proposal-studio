import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { PaymentMilestone } from "@/types/block-proposal";

const LOCAL_STORAGE_MILESTONES_PREFIX = "madola_saved_milestones_";

function getLocalMilestones(proposalId: string): PaymentMilestone[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_MILESTONES_PREFIX}${proposalId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local milestones fallback", e);
  }
  return [
    {
      id: "pm-1",
      label: "Deposit / Order Confirmation",
      percentage: 25,
      paymentMethod: "Bank Transfer",
      description: "Secures your equipment allocation, engineering design & DNO grid application.",
    },
    {
      id: "pm-2",
      label: "Final Commissioning & MCS Handover",
      percentage: 75,
      paymentMethod: "Bank Transfer",
      description: "Due upon full installation, testing, MCS registration & grid handover.",
    },
  ];
}

function saveLocalMilestones(proposalId: string, milestones: PaymentMilestone[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_MILESTONES_PREFIX}${proposalId}`, JSON.stringify(milestones));
  } catch (e) {
    console.error("Error saving local milestones fallback", e);
  }
}

export async function getPaymentMilestonesByProposalId(proposalId: string): Promise<PaymentMilestone[]> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("payment_milestones")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          label: row.label,
          percentage: Number(row.percentage) || 0,
          fixedAmount: Number(row.amount) || undefined,
          paymentMethod: row.payment_method || "Bank Transfer",
          description: row.description || "",
        }));
      }
    } catch (e) {
      console.warn("Supabase getPaymentMilestonesByProposalId failed; using local fallback", e);
    }
  }

  return getLocalMilestones(proposalId);
}

export async function savePaymentMilestones(
  proposalId: string,
  milestones: PaymentMilestone[],
  totalPrice: number
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  const totalPercentage = milestones.reduce((sum, m) => sum + (m.percentage || 0), 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return { success: false, error: "Payment milestone percentages must equal 100%." };
  }

  saveLocalMilestones(proposalId, milestones);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      await supabase.from("payment_milestones").delete().eq("proposal_id", proposalId);

      const rows = milestones.map((m, idx) => ({
        proposal_id: proposalId,
        label: m.label,
        percentage: m.percentage,
        amount: m.fixedAmount ?? (totalPrice * m.percentage) / 100,
        payment_method: m.paymentMethod || "Bank Transfer",
        description: m.description || null,
        order_index: idx + 1,
      }));

      const { error } = await supabase.from("payment_milestones").insert(rows);
      if (error) {
        console.warn("Supabase savePaymentMilestones error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase savePaymentMilestones exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
