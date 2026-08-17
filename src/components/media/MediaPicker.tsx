"use client";

import React, { useState, useEffect } from "react";
import { MediaAsset } from "@/types/media";
import { getMediaLibrary, saveMediaAsset, MAX_MEDIA_SIZE_BYTES } from "@/lib/media-library";
import { Image as ImageIcon, Upload, Check, X, Link as LinkIcon, AlertCircle } from "lucide-react";

export interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageSrc: string) => void;
  title?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelectImage,
  title = "Select Media Asset",
}: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedSrc, setSelectedSrc] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAssets(getMediaLibrary());
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAsset = (src: string) => {
    setSelectedSrc(src);
    setErrorMsg(null);
  };

  const handleConfirmSelect = () => {
    setErrorMsg(null);
    const srcToUse = activeTab === "custom" && customUrl.trim() ? customUrl.trim() : selectedSrc;

    if (srcToUse) {
      onSelectImage(srcToUse);
      onClose();
    }
  };

  const compressImageDataUrl = (dataUrl: string, maxWidth = 1200, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        // Compress image using HTML5 Canvas to prevent browser quota overflow
        const compressedDataUrl = await compressImageDataUrl(rawDataUrl, 1200, 0.75);

        const newAsset: MediaAsset = {
          id: `media-upload-${Date.now()}`,
          name: file.name,
          src: compressedDataUrl,
          type: "image",
          alt: file.name,
          category: "general",
          createdAt: new Date().toISOString(),
        };

        const res = saveMediaAsset(newAsset);
        if (!res.success) {
          setErrorMsg(res.error || "Failed to save image asset due to browser storage limits.");
        } else {
          setAssets(res.assets);
          setSelectedSrc(compressedDataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("library");
              setErrorMsg(null);
            }}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Curated Media Library ({assets.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("custom");
              setErrorMsg(null);
            }}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "custom"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Custom Image URL / File Upload
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {activeTab === "library" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assets.map((asset) => {
                const isSelected = selectedSrc === asset.src;
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset.src)}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                      isSelected
                        ? "border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                    }`}
                  >
                    <img src={asset.src} alt={asset.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2 flex flex-col justify-between">
                      <div className="flex justify-end">
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white font-semibold truncate">{asset.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  External Image URL (Recommended)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Upload Small Image File (Max 500 KB)
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Select a small JPG/PNG image file to use for temporary browser storage.
                  </span>
                </div>
                <label className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  <span>Choose Small Image</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {customUrl && (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                  <img src={customUrl} alt="Preview" className="w-16 h-12 rounded-lg object-cover" />
                  <span className="text-xs text-slate-500 font-mono truncate">{customUrl}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSelect}
            disabled={!selectedSrc && !customUrl.trim()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Apply Image</span>
          </button>
        </div>

      </div>
    </div>
  );
}
