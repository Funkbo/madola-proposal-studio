import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { ProposalBlock } from "@/types/block-proposal";
import { getSupabaseEnv } from "@/lib/supabase/config";

const LOCAL_STORAGE_BLOCKS_PREFIX = "madola_saved_blocks_";

function getLocalBlocks(proposalId: string): ProposalBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_BLOCKS_PREFIX}${proposalId}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local blocks fallback", e);
  }
  return [];
}

function saveLocalBlocks(proposalId: string, blocks: ProposalBlock[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_BLOCKS_PREFIX}${proposalId}`, JSON.stringify(blocks));
  } catch (e) {
    console.error("Error saving local blocks fallback", e);
  }
}

export async function getProposalBlocksByProposalId(proposalId: string): Promise<ProposalBlock[]> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("proposal_blocks")
        .select("id, block_id, type, title, order_index, enabled, data, conditions")
        .eq("proposal_id", proposalId)
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.block_id || row.id,
          type: row.type as ProposalBlock["type"],
          title: row.title,
          order: row.order_index,
          enabled: row.enabled,
          data: row.data || {},
          conditions: row.conditions || {},
        }));
      }
    } catch (e) {
      console.warn("Supabase getProposalBlocksByProposalId failed; using local fallback", e);
    }
  }

  return getLocalBlocks(proposalId);
}

export async function saveProposalBlocks(
  proposalId: string,
  blocks: ProposalBlock[]
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  saveLocalBlocks(proposalId, blocks);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      const rows = blocks.map((b, idx) => ({
        proposal_id: proposalId,
        block_id: b.id,
        type: b.type,
        title: b.title,
        order_index: b.order || idx + 1,
        enabled: b.enabled,
        data: b.data || {},
        conditions: b.conditions || {},
      }));

      const { error } = await supabase.from("proposal_blocks").upsert(rows, {
        onConflict: "proposal_id,block_id",
      });

      if (error) {
        console.warn("Supabase saveProposalBlocks error:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase saveProposalBlocks exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
