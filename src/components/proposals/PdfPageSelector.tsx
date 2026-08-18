"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getDocumentProxy, renderPageAsImage } from "unpdf";
import { X, Check, Loader2, MousePointer, ChevronLeft, ChevronRight, FileWarning } from "lucide-react";

interface PdfPageSelectorProps {
  pdfFile: File;
  onSelect: (dataUrl: string) => void;
  onClose: () => void;
}

interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type PdfProxy = Awaited<ReturnType<typeof getDocumentProxy>>;

const THUMB_WIDTH = 130;
const WORK_WIDTH = 780;
const HI_RES_WIDTH = 2400;

export function PdfPageSelector({ pdfFile, onSelect, onClose }: PdfPageSelectorProps) {
  const [pdfDoc, setPdfDoc] = useState<PdfProxy | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const [workUrl, setWorkUrl] = useState<string>("");
  const [workSize, setWorkSize] = useState<{ w: number; h: number } | null>(null);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const workRef = useRef<HTMLDivElement>(null);
  const workImgRef = useRef<HTMLImageElement>(null);
  const selectionRef = useRef<SelectionRect | null>(null);
  selectionRef.current = selection;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await pdfFile.arrayBuffer();
        const doc = await getDocumentProxy(data);
        if (cancelled) return;
        setPdfDoc(doc);

        const urls: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const url = await renderPageAsImage(doc, i, { width: THUMB_WIDTH, toDataURL: true });
          if (cancelled) return;
          urls.push(url);
          setThumbUrls([...urls]);
        }
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Failed to load PDF");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfFile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pdfDoc) return;
      try {
        const url = await renderPageAsImage(pdfDoc, activePage, { width: WORK_WIDTH, toDataURL: true });
        if (cancelled) return;
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load rendered page"));
          img.src = url;
        });
        if (cancelled) return;
        setWorkUrl(url);
        setWorkSize({ w: img.naturalWidth, h: img.naturalHeight });
        setSelection(null);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || "Failed to render page");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, activePage]);

  const getPos = (e: React.PointerEvent) => {
    const img = workImgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const ratioX = img.naturalWidth / rect.width;
    const ratioY = img.naturalHeight / rect.height;
    const localX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width) * ratioX;
    const localY = Math.min(Math.max(e.clientY - rect.top, 0), rect.height) * ratioY;
    return { x: localX, y: localY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!workSize) return;
    e.preventDefault();
    setIsSelecting(true);
    setDragStart(getPos(e));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting || !dragStart) return;
    const pos = getPos(e);
    const x = Math.min(dragStart.x, pos.x);
    const y = Math.min(dragStart.y, pos.y);
    const w = Math.abs(pos.x - dragStart.x);
    const h = Math.abs(pos.y - dragStart.y);
    setSelection({ x, y, w, h });
  };

  const handlePointerUp = () => {
    setIsSelecting(false);
    setDragStart(null);
  };

  const applySelection = async () => {
    const sel = selectionRef.current;
    if (!sel || !pdfDoc || sel.w < 10 || sel.h < 10 || !workSize) return;
    setIsApplying(true);
    try {
      const hiResUrl = await renderPageAsImage(pdfDoc, activePage, { width: HI_RES_WIDTH, toDataURL: true });
      const hiRes = new Image();
      await new Promise<void>((resolve, reject) => {
        hiRes.onload = () => resolve();
        hiRes.onerror = () => reject(new Error("Failed to load high-res page"));
        hiRes.src = hiResUrl;
      });
      const ratio = hiRes.naturalWidth / workSize.w;
      const sx = sel.x * ratio;
      const sy = sel.y * ratio;
      const sw = sel.w * ratio;
      const sh = sel.h * ratio;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(sw);
      canvas.height = Math.round(sh);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(hiRes, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onSelect(dataUrl);
    } catch (e: any) {
      console.error("PDF crop failed", e);
    } finally {
      setIsApplying(false);
    }
  };

  const displayScaleX = workImgRef.current ? workImgRef.current.naturalWidth / workImgRef.current.clientWidth : 1;
  const displayScaleY = workImgRef.current ? workImgRef.current.naturalHeight / workImgRef.current.clientHeight : 1;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Select Area from PDF Pages</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Close PDF selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {loadError ? (
            <div className="flex items-center gap-3 py-12 justify-center text-sm text-rose-600 font-semibold">
              <FileWarning className="w-5 h-5" />
              <span>Failed to load PDF: {loadError}</span>
            </div>
          ) : !pdfDoc ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Loading PDF pages...</span>
            </div>
          ) : (
            <div className="flex gap-5 min-h-[480px]">
              {/* Page thumbnails */}
              <div className="w-[170px] shrink-0 border border-slate-200 rounded-xl bg-slate-50 p-3 space-y-3 overflow-y-auto max-h-[560px]">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Pages ({pdfDoc.numPages})
                </p>
                {Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePage(p)}
                    className={`w-full rounded-lg overflow-hidden border-2 bg-white transition-all ${
                      activePage === p ? "border-emerald-500 shadow-md" : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    {thumbUrls[p - 1] ? (
                      <img src={thumbUrls[p - 1]} alt={`Page ${p}`} className="w-full h-auto" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      </div>
                    )}
                    <span className="block text-center text-[10px] font-bold text-slate-600 bg-slate-100 py-0.5">
                      Page {p}
                    </span>
                  </button>
                ))}
              </div>

              {/* Working area */}
              <div className="flex-1 min-w-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600">
                    Drag on the page to draw the area for the Panel Layout section
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={activePage <= 1}
                      onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-2">
                      Page {activePage} / {pdfDoc.numPages}
                    </span>
                    <button
                      type="button"
                      disabled={activePage >= pdfDoc.numPages}
                      onClick={() => setActivePage((p) => Math.min(pdfDoc.numPages, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={workRef}
                  className="relative overflow-auto rounded-xl border-2 border-slate-300 bg-slate-800 flex-1"
                  style={{ touchAction: "none", maxHeight: 520 }}
                >
                  <div className="relative inline-block p-4">
                    {workUrl ? (
                      <>
                        <img
                          ref={workImgRef}
                          src={workUrl}
                          alt={`PDF page ${activePage}`}
                          className="bg-white max-w-none select-none"
                          draggable={false}
                          onPointerDown={handlePointerDown}
                          onPointerMove={handlePointerMove}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                          style={{ touchAction: "none" }}
                        />
                        {selection && (
                          <div
                            className="absolute border-2 border-emerald-500 bg-emerald-400/20 pointer-events-none"
                            style={{
                              left: `${selection.x / displayScaleX}px`,
                              top: `${selection.y / displayScaleY}px`,
                              width: `${selection.w / displayScaleX}px`,
                              height: `${selection.h / displayScaleY}px`,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-[780px] h-[400px] flex items-center justify-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {selection && selection.w >= 10 && selection.h >= 10
                      ? `Selected: ${Math.round(selection.w)} x ${Math.round(selection.h)} px`
                      : "Draw a rectangle over the part you want"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applySelection}
                      disabled={isApplying || !selection || selection.w < 10 || selection.h < 10}
                      className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {isApplying ? "Rendering..." : "Use Selection as Panel Layout"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}