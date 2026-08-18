import { createClient } from "@/lib/supabase/server";
import { ProposalTemplate } from "@/types/template";
import { ProposalBlock } from "@/types/block-proposal";
import { createDefaultProposal } from "@/lib/block-defaults";

export async function getTemplates(): Promise<ProposalTemplate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_templates")
      .select("id, name, description, active, created_by, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getFallbackTemplates();
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      active: row.active,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    return getFallbackTemplates();
  }
}

export function getFallbackTemplates(): ProposalTemplate[] {
  return [
    {
      id: "template-madola-standard",
      name: "Madola Standard Proposal Template",
      description: "Default high-conversion UK residential solar & battery specification template.",
      active: true,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "template-madola-premium-tesla",
      name: "Madola Premium Tesla Powerwall Template",
      description: "Luxury specification layout tailored for Tesla Powerwall 3.0 systems.",
      active: true,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "template-madola-duracell",
      name: "Madola Duracell Energy Storage Template",
      description: "Standard residential specification highlighting Duracell Dura16 modular storage.",
      active: true,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export async function getTemplateBlocks(templateId: string): Promise<ProposalBlock[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("proposal_template_blocks")
      .select("*")
      .eq("template_id", templateId)
      .order("order_index", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((b) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        order: b.order_index,
        enabled: b.enabled,
        data: b.data,
      }));
    }
  } catch (e) {
    console.warn("Could not load template blocks from Supabase, using default block layout", e);
  }

  // Fallback to default proposal blocks
  return createDefaultProposal().blocks;
}

export async function saveTemplate(
  id: string,
  name: string,
  description: string,
  blocks: ProposalBlock[]
): Promise<ProposalTemplate> {
  const now = new Date().toISOString();

  // Resolve authenticated user ID
  let createdById: string | null = null;
  try {
    const supabase = await createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser?.user?.id) {
      createdById = authUser.user.id;
    }
  } catch (e) {
    console.warn("Could not resolve user ID for template save", e);
  }

  if (!createdById) {
    throw new Error("No authenticated user found. Cannot save template without a valid user.");
  }

  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("proposal_templates")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("proposal_templates")
        .update({
          name,
          description,
          updated_at: now,
        })
        .eq("id", id);
    } else {
      await supabase.from("proposal_templates").insert({
        id,
        name,
        description,
        active: true,
        created_by: createdById,
        created_at: now,
        updated_at: now,
      });
    }

    // Save block sections
    await supabase.from("proposal_template_blocks").delete().eq("template_id", id);
    const blockInserts = blocks.map((b, idx) => ({
      template_id: id,
      type: b.type,
      title: b.title,
      order_index: idx + 1,
      enabled: b.enabled,
      data: b.data,
    }));
    await supabase.from("proposal_template_blocks").insert(blockInserts);
  } catch (e) {
    console.warn("Save template Supabase fallback warning", e);
  }

  return {
    id,
    name,
    description,
    active: true,
    createdBy: createdById,
    createdAt: now,
    updatedAt: now,
  };
}
