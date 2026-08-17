import { MediaAsset } from "@/types/media";

export const MAX_MEDIA_SIZE_BYTES = 500 * 1024; // 500 KB max for local base64 uploads

export const DEFAULT_ACCREDITATION_LOGOS = [
  {
    id: "acc-hies",
    name: "HIES Consumer Code",
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80",
    alt: "HIES Consumer Code Accredited",
  },
  {
    id: "acc-tsi",
    name: "Trading Standards Approved",
    src: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80",
    alt: "TSI Approved Code",
  },
  {
    id: "acc-safecontractor",
    name: "SafeContractor Approved",
    src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80",
    alt: "SafeContractor Approved",
  },
  {
    id: "acc-olev",
    name: "OZEV / OLEV Approved",
    src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=80",
    alt: "OLEV Approved Installer",
  },
  {
    id: "acc-trustmark",
    name: "TrustMark Quality",
    src: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=300&q=80",
    alt: "TrustMark Government Endorsed Quality",
  },
  {
    id: "acc-napit",
    name: "NAPIT Approved Contractor",
    src: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80",
    alt: "NAPIT Electrical Approved Contractor",
  },
  {
    id: "acc-cityguilds",
    name: "City & Guilds Accredited",
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80",
    alt: "City & Guilds Accredited Programme",
  },
];

export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "media-1",
    name: "Solar Array Roof Installation",
    src: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "All-black solar PV modules on UK tiled roof",
    category: "solar",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "media-2",
    name: "In-Roof Solar PV Array",
    src: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "Premium in-roof solar array installation",
    category: "solar",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "media-3",
    name: "Hybrid Inverter & LFP Battery System",
    src: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "Wall-mounted hybrid inverter and lithium battery storage",
    category: "battery",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "media-4",
    name: "Smart EV Charger Unit",
    src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "Integrated smart electric vehicle charger",
    category: "ev",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "media-5",
    name: "Monocrystalline Solar Cell Close-Up",
    src: "https://images.unsplash.com/photo-1548611635-b6e7827d7d4a?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "High efficiency solar panel silicon cell texture",
    category: "solar",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  {
    id: "media-6",
    name: "Certified Survey & Documentation",
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
    type: "image",
    alt: "MCS engineering design documentation and survey plans",
    category: "installation",
    createdAt: "2026-08-11T00:00:00.000Z",
  },
];

export function getMediaLibrary(): MediaAsset[] {
  if (typeof window === "undefined") return DEFAULT_MEDIA_ASSETS;

  try {
    const saved = localStorage.getItem("madola_media_library");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const userAssets = parsed.filter(
          (u) => !DEFAULT_MEDIA_ASSETS.some((d) => d.src === u.src || d.id === u.id)
        );
        return [...userAssets, ...DEFAULT_MEDIA_ASSETS];
      }
    }
  } catch (e) {
    console.error("Error reading media library from localStorage", e);
  }

  return DEFAULT_MEDIA_ASSETS;
}

export function getMediaAssetById(id: string): MediaAsset | undefined {
  const library = getMediaLibrary();
  return library.find((a) => a.id === id);
}

export function resolveMediaUrl(ref: string): string {
  if (!ref || typeof ref !== "string") return "";

  // 1. If ref is a Base64 string, return it directly so uploaded images render
  if (ref.startsWith("data:image/")) {
    return ref;
  }

  // 2. If ref is a valid HTTP/HTTPS URL or absolute path (/images/...)
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("/")) {
    return ref;
  }

  // 3. Otherwise try resolving ref as a MediaAsset ID from media library
  const found = getMediaAssetById(ref);
  if (found && found.src && !found.src.startsWith("data:image/")) {
    return found.src;
  } else if (found && found.src && found.src.startsWith("data:image/")) {
    // If the asset itself contains a base64 string, return it for rendering!
    return found.src;
  }

  // 4. CRITICAL FIX: If ref is NOT a valid URL and CANNOT be found in media library,
  // NEVER return raw 'ref' ("media-upload-1786445078066")!
  // Returning raw non-URL string causes browser GET request to /media-upload-1786445078066 (404 error).
  // Return empty string "" so components safely fall back to clean text logo!
  return "";
}

export function saveMediaAsset(newAsset: MediaAsset): {
  success: boolean;
  assets: MediaAsset[];
  assetId: string;
  error?: string;
} {
  const current = getMediaLibrary();

  const existing = current.find((a) => a.src === newAsset.src || a.id === newAsset.id);
  if (existing) {
    return { success: true, assets: current, assetId: existing.id };
  }

  if (newAsset.src.startsWith("data:") && newAsset.src.length > 700000) {
    return {
      success: false,
      assets: current,
      assetId: "",
      error: "This image is too large for temporary browser storage (max 500 KB). Please choose a smaller image or use an image URL.",
    };
  }

  let activeLogoId = "";
  if (typeof window !== "undefined") {
    try {
      const b = localStorage.getItem("madola_company_branding");
      if (b) {
        const parsed = JSON.parse(b);
        activeLogoId = parsed.logo || "";
      }
    } catch (e) {}
  }

  const userAssets = current.filter(
    (a) => !DEFAULT_MEDIA_ASSETS.some((d) => d.id === a.id || d.src === a.src)
  );

  const updatedUserAssets = [newAsset, ...userAssets.filter((a) => a.id !== newAsset.id)];
  const fullList = [...updatedUserAssets, ...DEFAULT_MEDIA_ASSETS];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("madola_media_library", JSON.stringify(updatedUserAssets));
    } catch (e: any) {
      console.warn("localStorage quota hit when saving media asset", e);

      try {
        // Emergency pruning: Protect newAsset AND active company logo asset from deletion!
        const prunedUserAssets = updatedUserAssets.filter(
          (a) => a.id === newAsset.id || a.id === activeLogoId || !a.src.startsWith("data:")
        );
        localStorage.setItem("madola_media_library", JSON.stringify(prunedUserAssets));
      } catch (innerErr) {
        console.error("Emergency storage pruning failed", innerErr);
      }

      // Check if newAsset was retained
      try {
        const savedCheck = localStorage.getItem("madola_media_library");
        if (savedCheck && savedCheck.includes(newAsset.id)) {
          return { success: true, assets: fullList, assetId: newAsset.id };
        }
      } catch (checkErr) {}

      return {
        success: false,
        assets: current,
        assetId: "",
        error: "Browser storage quota reached. Please use a web image URL or select an existing media asset.",
      };
    }
  }

  return { success: true, assets: fullList, assetId: newAsset.id };
}
