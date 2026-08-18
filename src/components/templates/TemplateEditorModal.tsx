import React, { useState } from "react";
import { ProposalTemplate } from "@/types/template";
import { ProposalBlock } from "@/types/block-proposal";
import { createDefaultProposal } from "@/lib/block-defaults";
import { uploadMediaAsset } from "@/lib/repositories/mediaRepository";
import { MASTER_TEMPLATE_ID } from "@/lib/services/templateCache";
import { TEMPLATE_VARIABLES } from "@/lib/template-variables";
import {
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Image as ImageIcon,
  Plus,
  Check,
  FileText,
  Upload,
  Trash2,
  Loader2,
  Video,
  Link2,
  Braces,
  ChevronDown,
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ProposalTemplate | null;
  initialBlocks?: ProposalBlock[];
  onSaveSuccess: (updatedTemplate: ProposalTemplate, blocks?: ProposalBlock[]) => void;
}

type FieldKind = "text" | "textarea" | "image" | "video" | "bullet_list" | "check" | "accreditation_list";

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
}

interface BlockFieldSchema {
  type: string;
  title: string;
  fields: FieldDef[];
}

const BLOCK_FIELD_SCHEMAS: BlockFieldSchema[] = [
  {
    type: "cover",
    title: "Cover",
    fields: [
      { key: "proposalTitle", label: "Proposal Main Title", kind: "text" },
      { key: "subtitle", label: "Subtitle / Tagline", kind: "text" },
      { key: "greeting", label: "Greeting", kind: "text" },
      { key: "introText", label: "Introductory Message Text", kind: "textarea" },
      { key: "heroImage", label: "Hero Banner Image", kind: "image", hint: "Large banner image at the top of the cover section." },
      { key: "preparedBy.name", label: "Advisor Name", kind: "text" },
      { key: "preparedBy.email", label: "Advisor Email", kind: "text" },
      { key: "preparedBy.phone", label: "Advisor Phone", kind: "text" },
      { key: "preparedBy.profileImage", label: "Advisor Photo", kind: "image", hint: "Circular profile photo shown on the cover intro card." },
    ],
  },
  {
    type: "why_choose_us",
    title: "Why Choose Us",
    fields: [
      { key: "heading", label: "Section Heading", kind: "text" },
      { key: "paragraph1", label: "Paragraph 1 (Company Heritage)", kind: "textarea" },
      { key: "paragraph2", label: "Paragraph 2 (Our Commitment)", kind: "textarea" },
      { key: "madolaWayHeading", label: "Subheading (The Madola way)", kind: "text" },
      { key: "closingLine", label: "Closing Tagline", kind: "text" },
      {
        key: "accreditations",
        label: "Accreditation & Certificate Logos",
        kind: "accreditation_list",
        hint: "Upload real accreditation / certificate images (MCS, NAPIT, HIES, TrustMark...). They are shown in the Why Choose Us section on every customer proposal.",
      },
    ],
  },
  {
    type: "text",
    title: "Text / Trustpilot",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "bodyText", label: "Body Content", kind: "textarea" },
      { key: "bulletPoints", label: "Bullet Points (one per line)", kind: "bullet_list" },
      { key: "isTrustpilot", label: "Render as Trustpilot Review Widget", kind: "check" },
      { key: "videoUrl", label: "Video (MP4/WebM)", kind: "video", hint: "Optional embedded video. Upload a video file or paste a direct video URL." },
    ],
  },
  {
    type: "our_work",
    title: "Our Work",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "description", label: "Introductory Description", kind: "textarea" },
      { key: "videoUrl", label: "Video (MP4/WebM)", kind: "video", hint: "Optional embedded video." },
    ],
  },
  {
    type: "panel_layout",
    title: "Panel Layout & System Output",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "layoutImage", label: "Roof / Layout Diagram Image", kind: "image", hint: "The solar panel roof layout diagram." },
    ],
  },
  {
    type: "product_highlights",
    title: "Product Highlights",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "introText", label: "Introductory Text", kind: "textarea" },
      { key: "batteryTitle", label: "Battery Title", kind: "text" },
      { key: "batterySubtitle", label: "Battery Subtitle", kind: "textarea" },
      { key: "batteryImage", label: "Battery Image", kind: "image" },
      { key: "inverterTitle", label: "Inverter Title", kind: "text" },
      { key: "inverterSubtitle", label: "Inverter Subtitle", kind: "textarea" },
      { key: "inverterImage", label: "Inverter Image", kind: "image" },
      { key: "panelTitle", label: "Solar Panel Title", kind: "text" },
      { key: "panelSubtitle", label: "Solar Panel Subtitle", kind: "textarea" },
      { key: "panelImage", label: "Solar Panel Image", kind: "image" },
    ],
  },
  {
    type: "technical_details",
    title: "Technical Details",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "introText", label: "Introductory Text", kind: "textarea" },
      { key: "roofGroup", label: "Roof Group Label", kind: "text" },
      { key: "orientation", label: "Orientation (e.g. 59° from south)", kind: "text" },
      { key: "pitch", label: "Pitch (e.g. 37°)", kind: "text" },
      { key: "panelGroupLabel", label: "Panel Group Label", kind: "text" },
      { key: "kwhPerKwp", label: "kWh/kWp (Kk)", kind: "text" },
      { key: "disclaimerText", label: "Sunpath Shade Disclaimer", kind: "textarea" },
    ],
  },
  {
    type: "performance_estimates",
    title: "Performance Estimates",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "installedCapacityLabel", label: "Installed Capacity Label", kind: "text" },
      { key: "postcodeRegion", label: "Postcode Region", kind: "text" },
      { key: "shadeFactor", label: "Shade Factor (SF)", kind: "text" },
      { key: "disclaimer", label: "MCS Disclaimer", kind: "textarea" },
    ],
  },
  {
    type: "energy_usage",
    title: "Energy Usage & Profile",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "baselineLabel", label: "Baseline Label", kind: "text" },
      { key: "billLabel", label: "Estimated Bill Label", kind: "text" },
    ],
  },
  {
    type: "self_consumption",
    title: "Self-Consumption",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subtitle", label: "Subtitle", kind: "text" },
      { key: "directToHomeLabel", label: "Direct to Home Label", kind: "text" },
      { key: "directToHomeKwh", label: "Direct to Home (kWh)", kind: "text" },
      { key: "batteryToHomeLabel", label: "Stored in Battery Label", kind: "text" },
      { key: "batteryToHomeKwh", label: "Stored in Battery (kWh)", kind: "text" },
      { key: "exportToGridLabel", label: "Exported to Grid Label", kind: "text" },
      { key: "exportToGridKwh", label: "Exported to Grid (kWh)", kind: "text" },
    ],
  },
  {
    type: "before_after_solar",
    title: "Before vs After Solar",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "beforeLabel", label: "Before Label", kind: "text" },
      { key: "beforeNote", label: "Before Note", kind: "text" },
      { key: "afterLabel", label: "After Label", kind: "text" },
      { key: "afterNote", label: "After Note", kind: "text" },
    ],
  },
  {
    type: "pricing",
    title: "Pricing",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "text" },
    ],
  },
  {
    type: "savings",
    title: "Savings",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "gridSavingsLabel", label: "Grid Savings Label", kind: "text" },
      { key: "exportIncomeLabel", label: "Export Income Label", kind: "text" },
      { key: "totalSavingsLabel", label: "Total Savings Label", kind: "text" },
    ],
  },
  {
    type: "return_on_investment",
    title: "Return on Investment",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "roiLabel", label: "ROI Label", kind: "text" },
      { key: "breakEvenLabel", label: "Break-Even Label", kind: "text" },
      { key: "lifetimeLabel", label: "Lifetime Label", kind: "text" },
    ],
  },
  {
    type: "whats_included",
    title: "What's Included",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "videoUrl", label: "Video (MP4/WebM)", kind: "video", hint: "Optional embedded video." },
    ],
  },
  {
    type: "ev_charger",
    title: "Add an EV?",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
  },
  {
    type: "extra_products",
    title: "Extra Products",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
  },
  {
    type: "next_steps",
    title: "Next Steps",
    fields: [
      { key: "pillBadge", label: "Section Label Badge", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
    ],
  },
  {
    type: "payment_schedule",
    title: "Payment Schedule",
    fields: [
      { key: "headline", label: "Headline", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
    ],
  },
  {
    type: "final_price_summary",
    title: "Final Price Summary",
    fields: [
      { key: "headline", label: "Headline", kind: "text" },
      { key: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    type: "acceptance",
    title: "Acceptance & Next Steps",
    fields: [
      { key: "headline", label: "Headline", kind: "text" },
      { key: "termsNotice", label: "Terms Notice", kind: "textarea" },
    ],
  },
];

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
}

function setNestedValue(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  const result = { ...obj };
  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current[parts[i]] = { ...current[parts[i]] };
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
  return result;
}

export function TemplateEditorModal({
  isOpen,
  onClose,
  template,
  initialBlocks,
  onSaveSuccess,
}: TemplateEditorModalProps) {
  const isEditing = Boolean(template?.id);
  const [name, setName] = useState(template?.name || "New Madola Proposal Template");
  const [description, setDescription] = useState(
    template?.description || "Custom raw template with personalized sections and pictures."
  );
  const [blocks, setBlocks] = useState<ProposalBlock[]>(
    initialBlocks && initialBlocks.length > 0 ? initialBlocks : createDefaultProposal().blocks
  );

  const [activeTab, setActiveTab] = useState<"sections" | "images" | "details">("sections");
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [openVariableField, setOpenVariableField] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];
  const selectedSchema = BLOCK_FIELD_SCHEMAS.find((s) => s.type === selectedBlock.type);

  // Generic File Upload Handler (images + videos)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: { blockId: string; key: string; galleryIndex?: number }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setUploadingTarget(target.key + (target.galleryIndex !== undefined ? `-${target.galleryIndex}` : ""));

    try {
      const { asset, error } = await uploadMediaAsset(file, {
        category: "template",
        name: isVideo ? `video-${target.key}` : undefined,
      });
      if (error || !asset) {
        alert(error || "Failed to upload file.");
        return;
      }

      const mediaUrl = asset.publicUrl;

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== target.blockId) return b;

          // Gallery (our_work images) updates
          if (target.key === "images" && target.galleryIndex !== undefined) {
            const currentImages = Array.isArray(b.data?.images) ? [...b.data.images] : [];
            currentImages[target.galleryIndex] = mediaUrl;
            return { ...b, data: { ...b.data, images: currentImages } };
          }
          if (target.key === "images" && target.galleryIndex === undefined) {
            return { ...b, data: { ...b.data, videoUrl: mediaUrl } };
          }

          // Accreditation list updates (why_choose_us)
          if (target.key === "accreditations" && target.galleryIndex !== undefined) {
            const currentAccs = Array.isArray(b.data?.accreditations) ? [...b.data.accreditations] : [];
            if (target.galleryIndex >= 0 && target.galleryIndex < currentAccs.length) {
              // Replace existing accreditation's image
              currentAccs[target.galleryIndex] = {
                ...currentAccs[target.galleryIndex],
                src: mediaUrl,
              };
            } else if (target.galleryIndex === -1) {
              // Add new accreditation
              const newAcc = {
                id: `acc-${Date.now()}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                src: mediaUrl,
                alt: file.name,
              };
              currentAccs.push(newAcc);
            }
            return { ...b, data: { ...b.data, accreditations: currentAccs } };
          }

          return { ...b, data: setNestedValue(b.data, target.key, mediaUrl) };
        })
      );
    } catch (err: any) {
      alert(`Upload error: ${err.message || "Failed to upload file"}`);
    } finally {
      setUploadingTarget(null);
    }
  };

  // Reorder Block Up
  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const updated = [...blocks];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setBlocks(updated);
  };

  // Reorder Block Down
  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setBlocks(updated);
  };

  // Toggle Block Visibility
  const toggleBlockVisibility = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  // Update Data in Selected Block
  const handleBlockDataChange = (key: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === selectedBlock.id
          ? {
              ...b,
              data: setNestedValue(b.data, key, value),
            }
          : b
      )
    );
  };

  // Insert a dynamic {{variable}} placeholder into a text field
  const handleInsertVariable = (key: string, variableKey: string) => {
    const current = getNestedValue(selectedBlock.data, key);
    const existing = typeof current === "string" ? current : "";
    handleBlockDataChange(key, existing + (existing.endsWith(" ") || existing === "" ? "" : " ") + `{{${variableKey}}}`);
  };

  // Save Template Action
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const templateId = template?.id || MASTER_TEMPLATE_ID;
      const savedTpl: ProposalTemplate = {
        id: templateId,
        name,
        description,
        active: true,
        createdBy: "system",
        createdAt: template?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In-Memory Global Cache for instant reactivity across pages
      if (typeof window !== "undefined") {
        (window as any).__MADOLA_MASTER_TEMPLATE_CACHE__ = { template: savedTpl, blocks };
        try {
          localStorage.setItem(`madola_template_${templateId}`, JSON.stringify({ template: savedTpl, blocks }));
        } catch (storageErr) {
          console.warn("localStorage quota exceeded for template cache, using in-memory cache fallback", storageErr);
        }
      }

      // Persist master template blocks to DB so customer side (any browser) reflects changes
      try {
        const supabase = createClient();
        await supabase
          .from("master_template_blocks")
          .upsert({
            id: MASTER_TEMPLATE_ID,
            blocks: blocks as any,
            updated_at: new Date().toISOString(),
          });
      } catch (dbErr) {
        console.warn("Failed to persist master template blocks to DB", dbErr);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        onSaveSuccess(savedTpl, blocks);
        onClose();
      }, 600);
    } catch (e) {
      console.error("Save template error", e);
    } finally {
      setIsSaving(false);
    }
  };

  const coverBlock = blocks.find((b) => b.type === "cover");
  const ourWorkBlock = blocks.find((b) => b.type === "our_work");
  const galleryImages = Array.isArray(ourWorkBlock?.data?.images) ? ourWorkBlock.data.images : [
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542336391-ae2936d8eff4?auto=format&fit=crop&w=600&q=80"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing && template ? `Edit Template: ${template.name}` : "Create New Proposal Template"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize sections, text content, pictures, videos, and layout ordering. Changes appear on every customer proposal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 gap-6">
          <button
            onClick={() => setActiveTab("sections")}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "sections"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Sections, Text & Media
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "images"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Upload Pictures & Media
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "details"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Template Metadata
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="e.g. Madola Master Proposal Template"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Explain when to use this template..."
                />
              </div>
            </div>
          )}

          {activeTab === "sections" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Sections List & Reordering */}
              <div className="space-y-2 border-r border-slate-200 dark:border-slate-800 pr-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Template Sections ({blocks.length})
                  </h3>
                </div>
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      selectedBlock.id === block.id
                        ? "border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-900 dark:text-emerald-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {index + 1}
                      </span>
                      <span className="truncate">{block.title}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlockVisibility(block.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={block.enabled ? "Hide block" : "Show block"}
                      >
                        {block.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlockUp(index);
                        }}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlockDown(index);
                        }}
                        disabled={index === blocks.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Section Content Editor */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Editing: {selectedBlock.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    type: {selectedBlock.type}
                  </span>
                </div>

                {/* Section Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section Display Title
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setBlocks((prev) =>
                        prev.map((b) => (b.id === selectedBlock.id ? { ...b, title: newTitle } : b))
                      );
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Schema-driven editable fields */}
                {selectedSchema ? (
                  <div className="space-y-3">
                    {selectedSchema.fields.map((field) => {
                      const fieldValue = getNestedValue(selectedBlock.data, field.key);

                      if (field.kind === "accreditation_list") {
                        const accreditations: any[] = Array.isArray(fieldValue) ? fieldValue : [];
                        return (
                          <div
                            key={field.key}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {field.label}
                                </span>
                              </div>
                              {uploadingTarget === "accreditations" && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                </span>
                              )}
                            </div>

                            {field.hint && (
                              <p className="text-[11px] text-slate-500 leading-relaxed">{field.hint}</p>
                            )}

                            {accreditations.length === 0 && (
                              <p className="text-[11px] text-slate-400 italic">
                                No accreditation logos yet. Add one below to show it on customer proposals.
                              </p>
                            )}

                            <div className="space-y-2">
                              {accreditations.map((acc: any, idx: number) => (
                                <div
                                  key={acc.id || idx}
                                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                >
                                  <div className="w-14 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                                    <img
                                      src={acc.src}
                                      alt={acc.name || acc.alt || `Accreditation ${idx + 1}`}
                                      className="max-h-8 max-w-12 object-contain"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={acc.name || ""}
                                      onChange={(e) => {
                                        const updated = [...accreditations];
                                        updated[idx] = { ...updated[idx], name: e.target.value };
                                        handleBlockDataChange(field.key, updated);
                                      }}
                                      placeholder={`Accreditation ${idx + 1}`}
                                      className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <label className="cursor-pointer p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 transition" title="Replace with uploaded image">
                                      <Upload className="w-3.5 h-3.5" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                          handleFileUpload(e, { blockId: selectedBlock.id, key: "accreditations", galleryIndex: idx })
                                        }
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...accreditations];
                                        const temp = updated[idx - 1];
                                        updated[idx - 1] = updated[idx];
                                        updated[idx] = temp;
                                        handleBlockDataChange(field.key, updated);
                                      }}
                                      disabled={idx === 0}
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                      title="Move up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...accreditations];
                                        const temp = updated[idx + 1];
                                        updated[idx + 1] = updated[idx];
                                        updated[idx] = temp;
                                        handleBlockDataChange(field.key, updated);
                                      }}
                                      disabled={idx === accreditations.length - 1}
                                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                      title="Move down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = accreditations.filter((_, i) => i !== idx);
                                        handleBlockDataChange(field.key, updated);
                                      }}
                                      className="p-1 rounded-md text-rose-500 hover:text-rose-700"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition">
                              <Plus className="w-3.5 h-3.5" /> Add Accreditation Logo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, { blockId: selectedBlock.id, key: "accreditations", galleryIndex: -1 })
                                }
                              />
                            </label>
                          </div>
                        );
                      }

                      if (field.kind === "image" || field.kind === "video") {
                        const isVideoField = field.kind === "video";
                        return (
                          <div key={field.key} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isVideoField ? (
                                  <Video className="w-4 h-4 text-purple-500" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                                )}
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {field.label}
                                </span>
                              </div>
                              {uploadingTarget === field.key && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                </span>
                              )}
                            </div>

                            {field.hint && (
                              <p className="text-[11px] text-slate-500 leading-relaxed">{field.hint}</p>
                            )}

                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shrink-0">
                                <Upload className="w-3.5 h-3.5" /> {isVideoField ? "Upload Video" : "Upload File"}
                                <input
                                  type="file"
                                  accept={isVideoField ? "video/*" : "image/*"}
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, { blockId: selectedBlock.id, key: field.key })}
                                />
                              </label>
                              <input
                                type="text"
                                value={fieldValue || ""}
                                onChange={(e) => handleBlockDataChange(field.key, e.target.value)}
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                placeholder={isVideoField ? "Video URL or empty to remove" : "Image URL"}
                              />
                            </div>

                            {fieldValue && (
                              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                                {isVideoField ? (
                                  <video
                                    src={fieldValue}
                                    className="w-full max-h-40 object-contain"
                                    controls
                                  />
                                ) : (
                                  <img
                                    src={fieldValue}
                                    alt={field.label}
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                    className="w-full h-36 object-cover"
                                  />
                                )}
                                {fieldValue && (
                                  <button
                                    type="button"
                                    onClick={() => handleBlockDataChange(field.key, "")}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-200 transition"
                                    title="Remove media"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (field.kind === "bullet_list") {
                        const bullets: string[] = Array.isArray(fieldValue) ? fieldValue : [];
                        return (
                          <div key={field.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {field.label}
                              </label>
                              <button
                                type="button"
                                onClick={() => setOpenVariableField(openVariableField === field.key ? null : field.key)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition"
                                title="Insert a dynamic value that resolves from the customer's proposal data"
                              >
                                <Braces className="w-3 h-3" />
                                Insert Variable
                              </button>
                            </div>
                            {openVariableField === field.key && (
                              <div className="p-2 rounded-lg border border-violet-500/30 bg-violet-500/5 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {TEMPLATE_VARIABLES.map((v) => (
                                  <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => {
                                      const lastLine = bullets.length > 0 ? bullets[bullets.length - 1] : "";
                                      const updated = [...bullets];
                                      updated[updated.length - 1] = lastLine + (lastLine.endsWith(" ") || lastLine === "" ? "" : " ") + `{{${v.key}}}`;
                                      handleBlockDataChange(field.key, updated.filter((l) => l !== "").length > 0 ? updated : [`{{${v.key}}}`]);
                                    }}
                                    className="text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-violet-500/10 transition"
                                    title={v.description}
                                  >
                                    <span className="font-mono text-violet-600 dark:text-violet-400">{"{{"}{v.key}{"}}"}</span>
                                    <span className="block text-[10px] text-slate-500 truncate">{v.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <textarea
                              rows={3}
                              value={bullets.join("\n")}
                              onChange={(e) =>
                                handleBlockDataChange(
                                  field.key,
                                  e.target.value
                                    .split("\n")
                                    .map((l) => l.trim())
                                    .filter(Boolean)
                                )
                              }
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                          </div>
                        );
                      }

                      if (field.kind === "check") {
                        return (
                          <label
                            key={field.key}
                            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(fieldValue)}
                              onChange={(e) => handleBlockDataChange(field.key, e.target.checked)}
                              className="w-4 h-4 accent-emerald-600"
                            />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {field.label}
                            </span>
                          </label>
                        );
                      }

                      if (field.kind === "textarea") {
                        return (
                          <div key={field.key}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {field.label}
                              </label>
                              <button
                                type="button"
                                onClick={() => setOpenVariableField(openVariableField === field.key ? null : field.key)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition"
                                title="Insert a dynamic value that resolves from the customer's proposal data"
                              >
                                <Braces className="w-3 h-3" />
                                Insert Variable
                              </button>
                            </div>
                            {openVariableField === field.key && (
                              <div className="mb-2 p-2 rounded-lg border border-violet-500/30 bg-violet-500/5 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {TEMPLATE_VARIABLES.map((v) => (
                                  <button
                                    key={v.key}
                                    type="button"
                                    onClick={() => handleInsertVariable(field.key, v.key)}
                                    className="text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-violet-500/10 transition"
                                    title={v.description}
                                  >
                                    <span className="font-mono text-violet-600 dark:text-violet-400">{"{{"}{v.key}{"}}"}</span>
                                    <span className="block text-[10px] text-slate-500 truncate">{v.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <textarea
                              rows={3}
                              value={fieldValue || ""}
                              onChange={(e) => handleBlockDataChange(field.key, e.target.value)}
                              className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            {field.hint && (
                              <p className="text-[10px] text-slate-400 mt-1">{field.hint}</p>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={field.key}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {field.label}
                            </label>
                            <button
                              type="button"
                              onClick={() => setOpenVariableField(openVariableField === field.key ? null : field.key)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 transition"
                              title="Insert a dynamic value that resolves from the customer's proposal data"
                            >
                              <Braces className="w-3 h-3" />
                              Insert Variable
                            </button>
                          </div>
                          {openVariableField === field.key && (
                            <div className="mb-2 p-2 rounded-lg border border-violet-500/30 bg-violet-500/5 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {TEMPLATE_VARIABLES.map((v) => (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => handleInsertVariable(field.key, v.key)}
                                  className="text-left px-2 py-1.5 rounded-md text-[11px] hover:bg-violet-500/10 transition"
                                  title={v.description}
                                >
                                  <span className="font-mono text-violet-600 dark:text-violet-400">{"{{"}{v.key}{"}}"}</span>
                                  <span className="block text-[10px] text-slate-500 truncate">{v.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <input
                            type="text"
                            value={fieldValue || ""}
                            onChange={(e) => handleBlockDataChange(field.key, e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          {field.hint && (
                            <p className="text-[10px] text-slate-400 mt-1">{field.hint}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No editable fields defined for block type "{selectedBlock.type}".
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upload Template Pictures & Media
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload image or video files directly from your computer to Supabase Storage. Uploaded media will appear on all customer proposals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Cover Hero Image Uploader */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cover Hero Banner Picture</h4>
                    </div>
                    {uploadingTarget === "heroImage" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, { blockId: coverBlock?.id || "", key: "heroImage" })}
                      />
                    </label>
                    <input
                      type="text"
                      value={coverBlock?.data?.heroImage || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setBlocks((prev) =>
                          prev.map((b) => (b.type === "cover" ? { ...b, data: { ...b.data, heroImage: url } } : b))
                        );
                      }}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>

                  {coverBlock?.data?.heroImage && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img
                        src={coverBlock.data.heroImage}
                        alt="Hero Preview"
                        className="w-full h-36 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Specialist Profile Photo Uploader */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Advisor / Specialist Photo</h4>
                    </div>
                    {uploadingTarget === "preparedBy.profileImage" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, { blockId: coverBlock?.id || "", key: "preparedBy.profileImage" })
                        }
                      />
                    </label>
                    <input
                      type="text"
                      value={coverBlock?.data?.preparedBy?.profileImage || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setBlocks((prev) =>
                          prev.map((b) =>
                            b.type === "cover"
                              ? {
                                  ...b,
                                  data: {
                                    ...b.data,
                                    preparedBy: { ...b.data?.preparedBy, profileImage: url },
                                  },
                                }
                              : b
                          )
                        );
                      }}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      placeholder="https://..."
                    />
                  </div>

                  {coverBlock?.data?.preparedBy?.profileImage && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={coverBlock.data.preparedBy.profileImage}
                        alt="Profile Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                      />
                      <span className="text-xs text-slate-500 font-medium">Appears on proposal intro card</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Project Installation Portfolio Gallery Uploader */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Installation Gallery Pictures</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload portfolio photos of past Madola solar roof and battery installations to showcase on proposals.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBlocks((prev) =>
                        prev.map((b) => {
                          if (b.type === "our_work") {
                            const imgs = Array.isArray(b.data?.images) ? [...b.data.images] : [];
                            imgs.push("https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80");
                            return { ...b, data: { ...b.data, images: imgs } };
                          }
                          return b;
                        })
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Gallery Image
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 space-y-2 relative">
                      <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setBlocks((prev) =>
                              prev.map((b) => {
                                if (b.type === "our_work") {
                                  const imgs = (b.data?.images || []).filter((_: any, i: number) => i !== idx);
                                  return { ...b, data: { ...b.data, images: imgs } };
                                }
                                return b;
                              })
                            );
                          }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 text-rose-400 hover:text-rose-200 transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-500 transition">
                          <Upload className="w-3 h-3" /> Change
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, { blockId: ourWorkBlock?.id || "", key: "images", galleryIndex: idx })
                            }
                          />
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono truncate">Photo #{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Template Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
