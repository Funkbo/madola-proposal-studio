"use client";

import React, { useState } from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { useCompanyBranding } from "@/lib/branding";
import { Zap, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface OurWorkBlockComponentProps {
  block: ProposalBlock;
  proposal?: any;
  isAdmin?: boolean;
}

const DEFAULT_WORK_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
    title: "Residential All-Black Solar Installation",
    location: "Surrey, UK",
    type: "Residential",
  },
  {
    url: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=800&q=80",
    title: "Solar Canopy Carport & EV Charging Hub",
    location: "Commercial Site, Midlands",
    type: "Carport & EV",
  },
  {
    url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    title: "Commercial Utility-Scale Rooftop Array",
    location: "Industrial Park, Hampshire",
    type: "Commercial",
  },
  {
    url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80",
    title: "High-Yield Monocrystalline Array with Hybrid Inverter",
    location: "Oxfordshire, UK",
    type: "Solar & Battery",
  },
  {
    url: "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=800&q=80",
    title: "Terracotta In-Roof Integrated Solar Tiles",
    location: "Cotswolds Heritage Build",
    type: "In-Roof Tiles",
  },
];

export function OurWorkBlockComponent({ block }: OurWorkBlockComponentProps) {
  const branding = useCompanyBranding();
  const {
    description = "Madola Energy has installed over 10,000 solar systems since 2013 — more than 100,000 panels across homes, commercial sites and utility-scale projects nationwide.",
    pillBadge = "Our Work",
    images,
    videoUrl,
  } = block.data || {};

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos =
    Array.isArray(images) && images.length >= 5
      ? images.map((img: any, i: number) => ({
          url: typeof img === "string" ? img : img.url || DEFAULT_WORK_PHOTOS[i]?.url,
          title: img.title || DEFAULT_WORK_PHOTOS[i]?.title || `Installation ${i + 1}`,
          location: img.location || DEFAULT_WORK_PHOTOS[i]?.location || "United Kingdom",
          type: img.type || DEFAULT_WORK_PHOTOS[i]?.type || "Solar Array",
        }))
      : DEFAULT_WORK_PHOTOS;

  const mainPhoto = photos[0];
  const gridPhotos = photos.slice(1, 5);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % photos.length);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* 1. TOP HEADER ROW: Green Rounded Label on LEFT, Madola Logo on RIGHT */}
      <div className="flex items-center justify-between -mx-8 sm:-mx-12 -mt-4 mb-2">
        <div
          className="text-white font-bold text-xs px-5 py-2 rounded-r-full shadow-sm tracking-wider uppercase"
          style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
        >
          {pillBadge || "Our Work"}
        </div>

        <div className="flex items-center gap-2 pr-8 sm:pr-12">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.companyName} className="h-8 max-w-[160px] object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: "var(--brand-primary, #10b981)" }}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                {branding.companyName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DESCRIPTION COPY */}
      <div className="pt-2">
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
          {description}
        </p>
      </div>

      {/* 2b. EMBEDDED VIDEO */}
      {videoUrl && (
        <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
          <video src={videoUrl} controls className="w-full h-full object-cover" />
        </div>
      )}

      {/* 3. 5-PHOTO COLLAGE GRID MATCHING SCREENSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
        
        {/* Left Large Portrait Image (Col Span 6) */}
        {mainPhoto && (
          <div
            onClick={() => handleOpenLightbox(0)}
            className="md:col-span-6 group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 cursor-pointer min-h-[380px] md:min-h-[440px]"
          >
            <img
              src={mainPhoto.url}
              alt={mainPhoto.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
              <p className="font-bold text-sm">{mainPhoto.title}</p>
              <p className="text-xs text-slate-300">{mainPhoto.location}</p>
            </div>
            <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Right 4-Image 2x2 Grid (Col Span 6) */}
        <div className="md:col-span-6 grid grid-cols-2 gap-4">
          {gridPhotos.map((photo, idx) => {
            const photoIndex = idx + 1;
            const isLast = idx === gridPhotos.length - 1;

            return (
              <div
                key={photoIndex}
                onClick={() => handleOpenLightbox(photoIndex)}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 cursor-pointer aspect-square sm:aspect-auto sm:h-[212px]"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <p className="font-bold text-xs truncate">{photo.title}</p>
                  <p className="text-[10px] text-slate-300 truncate">{photo.location}</p>
                </div>

                {/* Last photo badge button: "Show all photos" */}
                {isLast && (
                  <div className="absolute bottom-3 right-3 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLightbox(0);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 font-bold text-[11px] border border-emerald-500 shadow-lg hover:bg-white transition-all flex items-center gap-1.5"
                    >
                      <span>Show all photos</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div>
                <h3 className="font-bold text-sm">{photos[lightboxIndex]?.title}</h3>
                <p className="text-xs text-slate-400">{photos[lightboxIndex]?.location} • Photo {lightboxIndex + 1} of {photos.length}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] max-h-[65vh] p-2">
              <img
                src={photos[lightboxIndex]?.url}
                alt={photos[lightboxIndex]?.title}
                className="max-h-full max-w-full object-contain rounded-xl"
              />

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2 overflow-x-auto">
              {photos.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    lightboxIndex === i ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
