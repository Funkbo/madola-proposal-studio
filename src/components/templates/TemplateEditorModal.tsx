import React, { useState } from "react";
import { ProposalTemplate } from "@/types/template";
import { ProposalBlock } from "@/types/block-proposal";
import { createDefaultProposal } from "@/lib/block-defaults";
import { uploadMediaAsset } from "@/lib/repositories/mediaRepository";
import { X, ArrowUp, ArrowDown, Eye, EyeOff, Save, Image as ImageIcon, Plus, Check, FileText, Upload, Trash2, Loader2 } from "lucide-react";

export interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ProposalTemplate | null;
  initialBlocks?: ProposalBlock[];
  onSaveSuccess: (updatedTemplate: ProposalTemplate, blocks?: ProposalBlock[]) => void;
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

  if (!isOpen) return null;

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];

  // File Upload Handler for Template Images
  const handleImageFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "hero" | "profile" | "gallery",
    galleryIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target + (galleryIndex !== undefined ? `-${galleryIndex}` : ""));

    try {
      const { asset, error } = await uploadMediaAsset(file, { category: "template" });
      if (error || !asset) {
        alert(error || "Failed to upload image.");
        return;
      }

      const imageUrl = asset.publicUrl;

      setBlocks((prev) =>
        prev.map((b) => {
          if (b.type === "cover") {
            if (target === "hero") {
              return { ...b, data: { ...b.data, heroImage: imageUrl } };
            }
            if (target === "profile") {
              return {
                ...b,
                data: {
                  ...b.data,
                  preparedBy: { ...b.data?.preparedBy, profileImage: imageUrl },
                },
              };
            }
          }
          if (b.type === "our_work" && target === "gallery" && galleryIndex !== undefined) {
            const currentImages = Array.isArray(b.data?.images) ? [...b.data.images] : [];
            currentImages[galleryIndex] = imageUrl;
            return { ...b, data: { ...b.data, images: currentImages } };
          }
          return b;
        })
      );
    } catch (err: any) {
      alert(`Upload error: ${err.message || "Failed to upload image"}`);
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
              data: {
                ...b.data,
                [key]: value,
              },
            }
          : b
      )
    );
  };

  // Save Template Action
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const templateId = template?.id || `template-${Date.now()}`;
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
                Customize raw template sections, text content, pictures, and layout ordering.
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
            Raw Sections & Text
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
                  placeholder="e.g. Madola Luxury Solar Template"
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

                {/* Cover / Hero Block Fields */}
                {selectedBlock.type === "cover" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Proposal Main Title
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.data?.proposalTitle || ""}
                        onChange={(e) => handleBlockDataChange("proposalTitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.data?.subtitle || ""}
                        onChange={(e) => handleBlockDataChange("subtitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Introductory Message Text
                      </label>
                      <textarea
                        rows={4}
                        value={selectedBlock.data?.introText || ""}
                        onChange={(e) => handleBlockDataChange("introText", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Why Choose Us Block Fields */}
                {selectedBlock.type === "why_choose_us" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Section Heading
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.data?.heading || ""}
                        onChange={(e) => handleBlockDataChange("heading", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Paragraph 1 (Company Heritage)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.data?.paragraph1 || ""}
                        onChange={(e) => handleBlockDataChange("paragraph1", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Paragraph 2 (Our Commitment)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedBlock.data?.paragraph2 || ""}
                        onChange={(e) => handleBlockDataChange("paragraph2", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Generic Text Block Fields */}
                {selectedBlock.type === "text" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Heading
                      </label>
                      <input
                        type="text"
                        value={selectedBlock.data?.heading || ""}
                        onChange={(e) => handleBlockDataChange("heading", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Body Content
                      </label>
                      <textarea
                        rows={5}
                        value={selectedBlock.data?.content || ""}
                        onChange={(e) => handleBlockDataChange("content", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
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
                  Upload image files directly from your computer to Supabase Storage. Uploaded pictures will appear on all hydrated customer proposals.
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
                    {uploadingTarget === "hero" && (
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
                        onChange={(e) => handleImageFileUpload(e, "hero")}
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
                    {uploadingTarget === "profile" && (
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
                        onChange={(e) => handleImageFileUpload(e, "profile")}
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
                            onChange={(e) => handleImageFileUpload(e, "gallery", idx)}
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

