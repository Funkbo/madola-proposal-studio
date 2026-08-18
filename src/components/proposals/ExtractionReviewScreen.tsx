"use client";

import React, { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ExtractionResult } from "@/types/extraction";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Eye,
  RotateCcw,
  Sparkles,
  FileText,
  Check,
  User,
  Sun,
  Zap,
  Battery,
  DollarSign,
  TrendingUp,
  LayoutTemplate,
  ExternalLink,
  Crop,
  X,
  ZoomIn,
} from "lucide-react";

type CropAspect = "free" | "16/9" | "4/3" | "1/1";

const CROP_ASPECTS: { key: CropAspect; label: string; value?: number }[] = [
  { key: "free", label: "Free" },
  { key: "16/9", label: "16:9", value: 16 / 9 },
  { key: "4/3", label: "4:3", value: 4 / 3 },
  { key: "1/1", label: "1:1", value: 1 },
];

interface ExtractionReviewScreenProps {
  initialExtraction: ExtractionResult;
  onSaveDraft: (updatedData: ExtractionResult, templateId?: string) => Promise<void>;
  onPublish: (updatedData: ExtractionResult, templateId?: string) => Promise<void>;
  onPreview: (updatedData: ExtractionResult, templateId?: string) => void;
}

export function ExtractionReviewScreen({
  initialExtraction,
  onSaveDraft,
  onPublish,
  onPreview,
}: ExtractionReviewScreenProps) {
  const [data, setData] = useState<ExtractionResult>(initialExtraction);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(initialExtraction.selectedOptionIndex || 0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("template-madola-standard");
  const [isSaving, setIsSaving] = useState(false);

  // Panel layout image cropping
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<CropAspect>("free");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const originalRoofLayoutRef = useRef<string | null>(null);

  const cropAspectValue = CROP_ASPECTS.find((a) => a.key === cropAspect)?.value;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImageDataUrl = useCallback(
    (imageSrc: string, pixelCrop: Area) =>
      new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(pixelCrop.width);
          canvas.height = Math.round(pixelCrop.height);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            canvas.width,
            canvas.height
          );
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create image blob"));
                return;
              }
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error || new Error("Failed to read image"));
              reader.readAsDataURL(blob);
            },
            "image/jpeg",
            0.92
          );
        };
        image.onerror = () => reject(new Error("Failed to load image"));
        image.src = imageSrc;
      }),
    []
  );

  const openCropModal = () => {
    originalRoofLayoutRef.current = data.roofLayoutImage || null;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropAspect("free");
    setCroppedAreaPixels(null);
    setIsCropOpen(true);
  };

  const applyCrop = async () => {
    if (!data.roofLayoutImage || !croppedAreaPixels) return;
    setIsApplyingCrop(true);
    try {
      const croppedUrl = await getCroppedImageDataUrl(data.roofLayoutImage, croppedAreaPixels);
      setData((prev) => ({
        ...prev,
        roofLayoutImage: croppedUrl,
        normalised: prev.normalised ? { ...prev.normalised, roofLayoutImage: croppedUrl } : prev.normalised,
      }));
      setIsCropOpen(false);
    } catch (e) {
      console.error("Crop failed", e);
    } finally {
      setIsApplyingCrop(false);
    }
  };

  const restoreOriginalLayoutImage = () => {
    if (!originalRoofLayoutRef.current) return;
    const original = originalRoofLayoutRef.current;
    setData((prev) => ({
      ...prev,
      roofLayoutImage: original,
      normalised: prev.normalised ? { ...prev.normalised, roofLayoutImage: original } : prev.normalised,
    }));
  };

  const systemOptions = data.systemOptions || [];

  const handleSelectOption = (index: number) => {
    setSelectedOptionIdx(index);
    const chosenOption = systemOptions[index];
    if (!chosenOption) return;

    setData((prev) => ({
      ...prev,
      selectedOptionIndex: index,
      systemSizeKwp: chosenOption.systemSizeKwp,
      annualGenerationKwh: chosenOption.annualGenerationKwh,
      panelQuantity: chosenOption.panelQuantity,
      panelWattage: chosenOption.panelWattage,
      panelManufacturer: chosenOption.panelManufacturer,
      panelModel: chosenOption.panelModel,
      inverterManufacturer: chosenOption.inverterManufacturer,
      inverterModel: chosenOption.inverterModel,
      inverterCapacityKw: chosenOption.inverterCapacityKw,
      batteryManufacturer: chosenOption.batteryManufacturer,
      batteryModel: chosenOption.batteryModel,
      batteryCapacityKwh: chosenOption.batteryCapacityKwh,
      systemPricePounds: chosenOption.systemPricePounds,
      firstYearSavingsPounds: chosenOption.firstYearSavingsPounds,
      npvPounds: chosenOption.npvPounds,
      roiPercent: chosenOption.roiPercent,
      products: chosenOption.products && chosenOption.products.length > 0 ? chosenOption.products : prev.products,
    }));
  };

  const handleFieldChange = (fieldKey: keyof ExtractionResult, newValue: any) => {
    setData((prev) => {
      const field = prev[fieldKey];
      if (field && typeof field === "object" && "value" in field) {
        return {
          ...prev,
          [fieldKey]: {
            ...field,
            value: newValue,
            confidence: "high", // Admin manually validated
            notes: "Admin adjusted",
          },
        };
      }
      return prev;
    });
  };

  const handleReset = () => {
    setData(initialExtraction);
    setSelectedOptionIdx(initialExtraction.selectedOptionIndex || 0);
  };

  const renderConfidenceBadge = (confidence: "high" | "medium" | "low") => {
    if (confidence === "high") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>High Confidence</span>
        </span>
      );
    }
    if (confidence === "medium") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Medium Confidence</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>Needs Review</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg animate-slide-up">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-2 border border-emerald-300 dark:border-emerald-800/50 shadow-sm animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OpenSolar PDF Extraction Review</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Validate & Review Proposal Data</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Compare extracted OpenSolar source data on the left with editable proposal values on the right before publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={async () => {
              setIsSaving(true);
              await onPreview(data, selectedTemplateId);
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preview in New Tab</span>
          </button>

          <button
            onClick={async () => {
              setIsSaving(true);
              await onSaveDraft(data, selectedTemplateId);
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={async () => {
              setIsSaving(true);
              await onPublish(data, selectedTemplateId);
              setIsSaving(false);
            }}
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-black rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Save & Continue to Interactive Proposal</span>
          </button>
        </div>
      </div>

      {/* System Options Selector Banner */}
      {systemOptions.length > 0 && (
        <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Select System Option to Import ({systemOptions.length} Options Detected in PDF)</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Click to active option</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {systemOptions.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              return (
                <button
                  key={opt.optionNumber}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? "bg-emerald-900/90 border-amber-400 ring-2 ring-amber-400/50 text-white"
                      : "bg-emerald-900/30 border-emerald-800 text-emerald-100 hover:bg-emerald-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                      {opt.optionName}
                      {opt.isRecommended && (
                        <span className="px-2 py-0.5 text-[10px] bg-amber-400 text-slate-950 font-extrabold rounded-md">
                          RECOMMENDED
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-emerald-200/90 mt-2 border-t border-emerald-800/60 pt-2">
                    <div>
                      <span className="block text-[10px] text-emerald-400 uppercase font-bold">System Price</span>
                      <span className="font-extrabold text-white text-sm">
                        £{typeof opt.systemPricePounds.value === "number" ? opt.systemPricePounds.value.toLocaleString() : "10,950"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-400 uppercase font-bold">Inverter</span>
                      <span className="font-semibold text-white truncate block">
                        {String(opt.inverterModel.value)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-400 uppercase font-bold">Battery</span>
                      <span className="font-semibold text-white truncate block">
                        {String(opt.batteryModel.value)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}



      {/* Review Sections Grid */}
      <div className="space-y-8">
        {/* 0. Extracted PDF Images Preview & Controls */}
        {(data.heroImage || data.roofLayoutImage || (data.allExtractedImages && data.allExtractedImages.length > 0)) && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Extracted PDF Imagery ({data.allExtractedImages?.length || 2} Photos Detected)</span>
              </div>
              {data.allExtractedImages && data.allExtractedImages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const temp = data.heroImage;
                    setData((prev) => ({
                      ...prev,
                      heroImage: prev.roofLayoutImage,
                      roofLayoutImage: temp,
                    }));
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Swap Cover & Roof Images</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cover Photo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Proposal Cover / Hero Photo</span>
                  <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 font-bold rounded">Image #1</span>
                </div>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  {data.heroImage ? (
                    <img src={data.heroImage} alt="Hero Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Default Cover Photo</div>
                  )}
                </div>
              </div>

              {/* Roof Layout Photo */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700">Aerial Roof Panel Layout Photo</span>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded">Image #2 (Panel Layout Section)</span>
                </div>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group shadow-sm">
                  {data.roofLayoutImage ? (
                    <>
                      <img src={data.roofLayoutImage} alt="Aerial Roof Layout" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={openCropModal}
                        className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-black/70 hover:bg-black/85 text-white rounded-lg border border-white/20 transition-colors"
                      >
                        <Crop className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Crop</span>
                      </button>
                      {originalRoofLayoutRef.current && originalRoofLayoutRef.current !== data.roofLayoutImage && (
                        <button
                          type="button"
                          onClick={restoreOriginalLayoutImage}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-black/70 hover:bg-black/85 text-white rounded-lg border border-white/20 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                          <span>Restore Original</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Default Roof Panel Layout</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Customer & Reference */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b pb-3">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Customer & Proposal Metadata</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Customer Name</label>
                {renderConfidenceBadge(data.customerName.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar Source: {data.customerName.value}</p>
              <input
                type="text"
                value={data.customerName.value}
                onChange={(e) => handleFieldChange("customerName", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Site Address</label>
                {renderConfidenceBadge(data.address.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar Source: {data.address.value}</p>
              <input
                type="text"
                value={data.address.value}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Property Postcode</label>
                {renderConfidenceBadge(data.postcode.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar Source: {data.postcode.value}</p>
              <input
                type="text"
                value={data.postcode.value}
                onChange={(e) => handleFieldChange("postcode", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Quote / Proposal Ref #</label>
                {renderConfidenceBadge(data.proposalReference.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar Source: {data.proposalReference.value}</p>
              <input
                type="text"
                value={data.proposalReference.value}
                onChange={(e) => handleFieldChange("proposalReference", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* 2. System Hardware */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b pb-3">
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Solar PV & Storage System Hardware</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">System Capacity (kWp)</label>
                {renderConfidenceBadge(data.systemSizeKwp.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: {data.systemSizeKwp.value} kWp</p>
              <input
                type="number"
                step="0.01"
                value={data.systemSizeKwp.value}
                onChange={(e) => handleFieldChange("systemSizeKwp", parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Panel Model</label>
                {renderConfidenceBadge(data.panelModel.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: {data.panelModel.value}</p>
              <input
                type="text"
                value={data.panelModel.value}
                onChange={(e) => handleFieldChange("panelModel", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Inverter Model</label>
                {renderConfidenceBadge(data.inverterModel.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: {data.inverterModel.value}</p>
              <input
                type="text"
                value={data.inverterModel.value}
                onChange={(e) => handleFieldChange("inverterModel", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Battery Model</label>
                {renderConfidenceBadge(data.batteryModel.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: {data.batteryModel.value}</p>
              <input
                type="text"
                value={data.batteryModel.value}
                onChange={(e) => handleFieldChange("batteryModel", e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* 3. Financial Investment */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Financial Investment & Savings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">System Price (£)</label>
                {renderConfidenceBadge(data.systemPricePounds.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: £{data.systemPricePounds.value}</p>
              <input
                type="number"
                value={data.systemPricePounds.value}
                onChange={(e) => handleFieldChange("systemPricePounds", parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Year 1 Savings (£)</label>
                {renderConfidenceBadge(data.firstYearSavingsPounds.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: £{data.firstYearSavingsPounds.value}</p>
              <input
                type="number"
                value={data.firstYearSavingsPounds.value}
                onChange={(e) => handleFieldChange("firstYearSavingsPounds", parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">NPV (£)</label>
                {renderConfidenceBadge(data.npvPounds.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: £{data.npvPounds.value}</p>
              <input
                type="number"
                value={data.npvPounds.value}
                onChange={(e) => handleFieldChange("npvPounds", parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">ROI (%)</label>
                {renderConfidenceBadge(data.roiPercent.confidence)}
              </div>
              <p className="text-xs text-slate-400">OpenSolar: {data.roiPercent.value}%</p>
              <input
                type="number"
                value={data.roiPercent.value}
                onChange={(e) => handleFieldChange("roiPercent", parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Modal for Panel Layout Image */}
      {isCropOpen && data.roofLayoutImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Crop className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Crop Panel Layout Image</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCropOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                aria-label="Close crop modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative w-full h-[420px] rounded-xl overflow-hidden bg-slate-900">
                <Cropper
                  image={data.roofLayoutImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropAspectValue}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid
                  mediaProps={{ crossOrigin: "anonymous" }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Aspect:</span>
                {CROP_ASPECTS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setCropAspect(a.key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      cropAspect === a.key
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <ZoomIn className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCropOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={isApplyingCrop || !croppedAreaPixels}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isApplyingCrop ? "Applying..." : "Apply Crop"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
