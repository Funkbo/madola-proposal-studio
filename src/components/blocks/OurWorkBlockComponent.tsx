"use client";

import React from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { Camera, Image as ImageIcon } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
  proposal?: any;
}

export function OurWorkBlockComponent({ block, proposal }: BlockComponentProps) {
  const { title, description, mainImage, supportingImages, images } = block.data || {};

  const allImages: Array<{ url: string; caption?: string }> = [];

  if (mainImage?.url) {
    allImages.push(typeof mainImage === "string" ? { url: mainImage } : mainImage);
  } else if (typeof mainImage === "string") {
    allImages.push({ url: mainImage });
  }

  if (Array.isArray(supportingImages)) {
    supportingImages.forEach((img: any) => {
      if (typeof img === "string") allImages.push({ url: img });
      else if (img?.url) allImages.push(img);
    });
  }

  if (Array.isArray(images)) {
    images.forEach((img: any) => {
      const url = typeof img === "string" ? img : img?.url;
      if (url && !allImages.some((i) => i.url === url)) {
        allImages.push(typeof img === "string" ? { url: img } : img);
      }
    });
  }

  if (allImages.length === 0 && proposal?.galleryImages && proposal.galleryImages.length > 0) {
    proposal.galleryImages.forEach((url: string) => allImages.push({ url }));
  }

  if (allImages.length === 0) {
    allImages.push(
      { url: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1000&q=80", caption: "5.4 kW In-Roof All-Black Solar Array — Surrey, UK" },
      { url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=600&q=80", caption: "Dual-MPPT Hybrid Inverter & LFP Battery Installation" },
      { url: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=600&q=80", caption: "Integrated EV Smart Charger with Solar Surge Charging" }
    );
  }

  const primaryPhoto = allImages[0];
  const secondaryPhotos = allImages.slice(1);

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <Camera className="w-4 h-4" />
          <span>Project Gallery</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title || "Our Recent Work"}</h3>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Primary Showcase Image */}
        {primaryPhoto && (
          <div className="md:col-span-7 group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm aspect-video bg-slate-100 dark:bg-slate-800">
            <img
              src={primaryPhoto.url}
              alt={primaryPhoto.caption || "Main Installation Photo"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {primaryPhoto.caption && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/90 to-transparent text-white text-xs font-medium">
                {primaryPhoto.caption}
              </div>
            )}
          </div>
        )}

        {/* Secondary Gallery Images */}
        {secondaryPhotos.length > 0 && (
          <div className="md:col-span-5 grid grid-cols-1 gap-4">
            {secondaryPhotos.map((img: any, idx: number) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-36 bg-slate-100 dark:bg-slate-800"
              >
                <img
                  src={img.url}
                  alt={img.caption || `Installation Image ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.caption && (
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-950/90 to-transparent text-white text-[11px] font-medium">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
