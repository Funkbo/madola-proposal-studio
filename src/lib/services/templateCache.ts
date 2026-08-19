import { ProposalBlock } from "@/types/block-proposal";
import { createDefaultProposal } from "@/lib/block-defaults";
import { createClient } from "@/lib/supabase/client";

export const MASTER_TEMPLATE_ID = "template-madola-standard";

/**
 * Reads the single master template's blocks from the in-memory cache,
 * then localStorage, and finally falls back to the default proposal blocks.
 * This is the single source of truth for what the customer-facing proposal renders.
 */
export function getMasterTemplateBlocks(): ProposalBlock[] {
  if (typeof window === "undefined") {
    return createDefaultProposal().blocks;
  }

  try {
    const cache = (window as any).__MADOLA_MASTER_TEMPLATE_CACHE__;
    if (cache?.blocks && Array.isArray(cache.blocks) && cache.blocks.length > 0) {
      return cache.blocks;
    }

    const keys = [
      `madola_template_${MASTER_TEMPLATE_ID}`,
      "madola_saved_blocks_proposal-default-1",
    ];
    for (const key of keys) {
      const saved = localStorage.getItem(key);
      if (!saved) continue;
      const parsed = JSON.parse(saved);
      const blocks = parsed?.blocks || (Array.isArray(parsed) ? parsed : null);
      if (blocks && Array.isArray(blocks) && blocks.length > 0) {
        return blocks;
      }
    }
  } catch (e) {
    console.warn("Error reading master template blocks", e);
  }

  return createDefaultProposal().blocks;
}

/**
 * Async: fetches the master template blocks from Supabase DB (public read).
 * Used by the customer page to reflect template edits made in the template editor.
 */
export async function getMasterTemplateBlocksFromDb(): Promise<ProposalBlock[] | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("master_template_blocks")
      .select("blocks")
      .eq("id", MASTER_TEMPLATE_ID)
      .maybeSingle();

    if (!error && data?.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
      return data.blocks as ProposalBlock[];
    }
  } catch (e) {
    console.warn("Error fetching master template blocks from DB", e);
  }
  return null;
}

/**
 * Reads a single master template block by type (e.g. "cover", "our_work").
 */
export function getMasterTemplateBlock(type: string): ProposalBlock | undefined {
  return getMasterTemplateBlocks().find((b) => b.type === type);
}
