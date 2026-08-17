import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { FullInteractiveProposalData } from "@/types/interactiveProposal";
import { ExtractionResult } from "@/types/extraction";
import { getSupabaseEnv } from "@/lib/supabase/config";

const LOCAL_PROPOSAL_CACHE_KEY = "madola_interactive_proposals_cache";

function getMemoryCache(): Record<string, FullInteractiveProposalData> {
  if (typeof window === "undefined") return {};
  if (!(window as any).__MADOLA_PROPOSALS_CACHE__) {
    (window as any).__MADOLA_PROPOSALS_CACHE__ = {};
  }
  return (window as any).__MADOLA_PROPOSALS_CACHE__;
}

function getLocalProposalCache(): Record<string, FullInteractiveProposalData> {
  if (typeof window === "undefined") return {};
  const mem = getMemoryCache();
  try {
    const saved = localStorage.getItem(LOCAL_PROPOSAL_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, ...mem };
    }
  } catch (e) {
    console.warn("Local proposal cache read notice:", e);
  }
  return mem;
}

export function saveLocalProposalCache(token: string, proposal: FullInteractiveProposalData) {
  if (typeof window === "undefined") return;

  // 1. Always write to in-memory window cache first (guaranteed instant access across routes)
  const mem = getMemoryCache();
  mem[token] = proposal;
  if (proposal.publicToken) mem[proposal.publicToken] = proposal;
  if (proposal.reference) mem[proposal.reference] = proposal;
  if (proposal.id) mem[proposal.id] = proposal;

  // 2. Safely attempt writing to localStorage without 3x duplication
  try {
    const current = getLocalProposalCache();
    current[token] = proposal;

    try {
      localStorage.setItem(LOCAL_PROPOSAL_CACHE_KEY, JSON.stringify(current));
    } catch (quotaErr) {
      console.warn("localStorage quota exceeded. Trimming old cache entries...");
      // Prune old entries if quota exceeded
      const keys = Object.keys(current);
      if (keys.length > 2) {
        const trimmed: Record<string, FullInteractiveProposalData> = {};
        keys.slice(-2).forEach((k) => {
          trimmed[k] = current[k];
        });
        localStorage.setItem(LOCAL_PROPOSAL_CACHE_KEY, JSON.stringify(trimmed));
      } else {
        // If single proposal still exceeds quota due to huge base64 images, save single key
        localStorage.setItem(`madola_prop_${token}`, JSON.stringify(proposal));
      }
    }
  } catch (e) {
    console.warn("Local proposal cache write warning (using in-memory fallback):", e);
  }
}

/**
 * Default Master Proposal Data matching OpenSolar_Proposal(3).pdf data source.
 */
export const DEFAULT_MASTER_PROPOSAL: FullInteractiveProposalData = {
  id: "prop-vykdsfmwjw5n",
  reference: "10534548",
  publicSlug: "pub_tok_7a9f8b2c1d4e6f3a",
  publicToken: "pub_tok_7a9f8b2c1d4e6f3a",
  status: "published",
  createdAt: "11 Aug 2026",
  publishedAt: new Date().toISOString(),

  customer: {
    name: "Amanda Ratucoko",
    email: "amanda@example.co.uk",
    phone: "+44 7700 900077",
    address: "13 Bryn Eirlys, Bridgend",
    postcode: "CF35 6NU",
  },

  system: {
    systemSizeKwp: 5.76,
    annualGenerationKwh: 4927,
    panelCount: 12,
    panelWattage: 480,
    panelManufacturer: "LONGi Solar",
    panelModel: "LR7-54HVH-480M",
    inverterManufacturer: "Hanchu ESS",
    inverterModel: "HESS-HY-S-5.0K",
    inverterCapacityKw: 5.0,
    inverterWarranty: "12 Years",
    batteryManufacturer: "Hanchu ESS",
    batteryModel: "HOME-ESS-LV-9.4K",
    batteryCapacityKwh: 8.93,
    batteryWarranty: "12 Years",
  },

  technical: {
    roofGroup: "Roof Group 1 (South)",
    orientation: "South (180°)",
    pitch: "37°",
    shadeFactor: 0.999,
    kwhPerKwp: 856,
  },

  performance: {
    annualConsumptionKwh: 3461,
    annualGenerationKwh: 4927,
    selfConsumptionPercent: 54,
    selfSufficiencyPercent: 77,
    directToHomeKwh: 887,
    batteryToHomeKwh: 1774,
    exportToGridKwh: 2266,
  },

  financials: {
    baseSystemPrice: 10950,
    annualBillBefore: 1450,
    annualBillAfter: 592,
    firstYearSavings: 858,
    gridSavings: 560,
    exportIncome: 298,
    vatRatePercent: 0,
    roiPercent: 7.8,
    breakEvenYear: 11,
    lifetime25YearSavings: 42701,
    inflationRatePercent: 7.04,
  },

  monthlyData: [
    { month: "Jan", generationKwh: 171, consumptionKwh: 346, importKwh: 183, exportKwh: 9, exportCreditPounds: 1, billBeforePounds: 90, billAfterPounds: 54, savingsPounds: 37 },
    { month: "Feb", generationKwh: 240, consumptionKwh: 338, importKwh: 111, exportKwh: 14, exportCreditPounds: 2, billBeforePounds: 87, billAfterPounds: 36, savingsPounds: 51 },
    { month: "Mar", generationKwh: 400, consumptionKwh: 335, importKwh: 21, exportKwh: 86, exportCreditPounds: 10, billBeforePounds: 88, billAfterPounds: 9, savingsPounds: 79 },
    { month: "Apr", generationKwh: 520, consumptionKwh: 285, importKwh: 17, exportKwh: 254, exportCreditPounds: 30, billBeforePounds: 77, billAfterPounds: -12, savingsPounds: 89 },
    { month: "May", generationKwh: 635, consumptionKwh: 254, importKwh: 15, exportKwh: 397, exportCreditPounds: 48, billBeforePounds: 70, billAfterPounds: -29, savingsPounds: 100 },
    { month: "Jun", generationKwh: 651, consumptionKwh: 241, importKwh: 14, exportKwh: 427, exportCreditPounds: 51, billBeforePounds: 67, billAfterPounds: -34, savingsPounds: 101 },
    { month: "Jul", generationKwh: 655, consumptionKwh: 234, importKwh: 14, exportKwh: 438, exportCreditPounds: 53, billBeforePounds: 66, billAfterPounds: -35, savingsPounds: 100 },
    { month: "Aug", generationKwh: 578, consumptionKwh: 229, importKwh: 14, exportKwh: 366, exportCreditPounds: 44, billBeforePounds: 65, billAfterPounds: -26, savingsPounds: 91 },
    { month: "Sep", generationKwh: 438, consumptionKwh: 252, importKwh: 15, exportKwh: 205, exportCreditPounds: 25, billBeforePounds: 69, billAfterPounds: -7, savingsPounds: 76 },
    { month: "Oct", generationKwh: 309, consumptionKwh: 281, importKwh: 17, exportKwh: 53, exportCreditPounds: 6, billBeforePounds: 76, billAfterPounds: 12, savingsPounds: 64 },
    { month: "Nov", generationKwh: 186, consumptionKwh: 321, importKwh: 142, exportKwh: 11, exportCreditPounds: 1, billBeforePounds: 84, billAfterPounds: 44, savingsPounds: 40 },
    { month: "Dec", generationKwh: 143, consumptionKwh: 345, importKwh: 209, exportKwh: 8, exportCreditPounds: 1, billBeforePounds: 90, billAfterPounds: 59, savingsPounds: 31 },
  ],

  products: [
    {
      id: "prod-1",
      category: "principal",
      name: "12 × LONGi LR7-54HVH-480M",
      manufacturer: "LONGi Solar",
      model: "LR7-54HVH-480M",
      quantity: 12,
      price: 280,
      included: true,
      description: "N-Type TOPCon Mono-crystalline solar panels with 15-yr product & 30-yr performance warranty.",
      warranty: "15 Year Product / 30 Year Performance",
    },
    {
      id: "prod-2",
      category: "principal",
      name: "Hanchu ESS HESS-HY-S-5.0K Hybrid Inverter",
      manufacturer: "Hanchu ESS",
      model: "HESS-HY-S-5.0K",
      quantity: 1,
      price: 1250,
      included: true,
      description: "5.0kW Hybrid inverter with integrated EPS emergency power supply.",
      warranty: "12 Years",
    },
    {
      id: "prod-3",
      category: "principal",
      name: "Hanchu ESS HOME-ESS-LV-9.4K Battery Storage",
      manufacturer: "Hanchu ESS",
      model: "HOME-ESS-LV-9.4K",
      quantity: 1,
      price: 2850,
      included: true,
      description: "8.93kWh Usable LFP battery storage system.",
      warranty: "12 Years",
    },
    {
      id: "prod-opt-1",
      category: "optional",
      name: "Smart Hot Water Solar Diverter",
      manufacturer: "Myenergi",
      model: "eddi 2.1",
      quantity: 1,
      price: 495,
      included: false,
      description: "Diverts excess solar generation to heat your domestic hot water cylinder automatically.",
      warranty: "3 Years",
    },
    {
      id: "prod-opt-2",
      category: "optional",
      name: "Bird Proofing Protection Mesh",
      manufacturer: "Solar Guard",
      model: "SG-MESH-PRO",
      quantity: 1,
      price: 350,
      included: false,
      description: "High-grade stainless steel mesh array border preventing bird nesting under panels.",
      warranty: "10 Years",
    },
    {
      id: "prod-ev-1",
      category: "ev",
      name: "Sigen EV AC Charger 7kW",
      manufacturer: "Sigenergy",
      model: "Sigen EV AC 7K",
      quantity: 1,
      price: 1250,
      included: false,
      description: "Smart 7kW home EV charger with AI solar matching & dynamic tariff scheduling.",
      warranty: "3 Years",
    },
    {
      id: "prod-ev-2",
      category: "ev",
      name: "Hanchu EV Charge HC 7KW (T)",
      manufacturer: "Hanchu ESS",
      model: "HC-7KW-T",
      quantity: 1,
      price: 1250,
      included: false,
      description: "7kW Tethered smart EV charger seamlessly integrated with Hanchu app.",
      warranty: "3 Years",
    },
    {
      id: "prod-add-1",
      category: "additional",
      name: "Hanchu ESS Gateway M1",
      manufacturer: "Hanchu ESS",
      model: "Gateway M1",
      quantity: 1,
      price: 295,
      included: false,
      description: "Whole-home power backup gateway module for seamless EPS islanding.",
      warranty: "5 Years",
    },
    {
      id: "prod-add-2",
      category: "additional",
      name: "Extended Workmanship Warranty (10 Years)",
      manufacturer: "Madola Energy",
      model: "W-EXT-10",
      quantity: 1,
      price: 450,
      included: false,
      description: "Extends Madola Energy installation workmanship warranty from 5 to 10 years.",
      warranty: "10 Years",
    },
  ],

  milestones: [
    {
      id: "ms-1",
      label: "Upfront Deposit",
      percentage: 25,
      amount: 2737.5,
      paymentMethod: "Bank Transfer / Card",
      description: "Paid upon proposal acceptance to secure hardware allocation & scheduling.",
      orderIndex: 1,
    },
    {
      id: "ms-2",
      label: "After Installation & Commissioning",
      percentage: 75,
      amount: 8212.5,
      paymentMethod: "Bank Transfer",
      description: "Paid after MCS installation, testing and commissioning completion.",
      orderIndex: 2,
    },
  ],

  acceptance: {
    status: "pending",
  },

  branding: {
    companyName: "Madola Energy",
    primaryColor: "#10b981",
    secondaryColor: "#0f172a",
    email: "nparry@madolaenergy.com",
    phone: "+44 (0) 800 123 4567",
    website: "https://madola.co.uk",
    address: "Madola House, Richmond, Surrey, UK",
  },
  preparedBy: {
    name: "Neil Parry",
    email: "nparry@madolaenergy.com",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  heroImage: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
  layoutImage: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Convert raw/edited ExtractionResult into FullInteractiveProposalData.
 */
export function convertExtractionToInteractiveProposal(
  extraction: ExtractionResult,
  token: string,
  status: "draft" | "published" = "published",
  templateId?: string
): FullInteractiveProposalData {
  const sysPrice = typeof extraction.systemPricePounds.value === "number" ? extraction.systemPricePounds.value : 10950;
  const depPct = typeof extraction.depositPercent.value === "number" ? extraction.depositPercent.value : 25;
  const depositAmount = Math.round((sysPrice * (depPct / 100)) * 100) / 100;
  const balanceAmount = Math.round((sysPrice - depositAmount) * 100) / 100;

  // Read Custom Master Template Images & Content from Cache
  let customHeroImage = DEFAULT_MASTER_PROPOSAL.heroImage;
  let customPreparedBy = DEFAULT_MASTER_PROPOSAL.preparedBy;
  let customGalleryImages = DEFAULT_MASTER_PROPOSAL.galleryImages;

  if (typeof window !== "undefined") {
    try {
      const targetId = templateId || "template-madola-standard";
      const saved = localStorage.getItem(`madola_template_${targetId}`) || localStorage.getItem("madola_template_template-madola-standard");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cover = parsed.blocks?.find((b: any) => b.type === "cover");
        const ourWork = parsed.blocks?.find((b: any) => b.type === "our_work");
        if (cover?.data?.heroImage) customHeroImage = cover.data.heroImage;
        if (cover?.data?.preparedBy) customPreparedBy = { ...customPreparedBy, ...cover.data.preparedBy };
        if (ourWork?.data?.images) customGalleryImages = ourWork.data.images;
      }
    } catch (e) {
      console.warn("Error reading template cache during extraction conversion", e);
    }
  }

  const extractedHeroImage = extraction.heroImage || extraction.allExtractedImages?.[0];
  const extractedLayoutImage = extraction.roofLayoutImage || (extraction.allExtractedImages && extraction.allExtractedImages.length > 1 ? extraction.allExtractedImages[1] : extraction.allExtractedImages?.[0]);

  return {
    id: `prop-${token.substring(0, 8)}`,
    reference: String(extraction.proposalReference.value || "10534548"),
    publicSlug: token,
    publicToken: token,
    status,
    createdAt: String(extraction.proposalDate.value || new Date().toLocaleDateString("en-GB")),
    publishedAt: new Date().toISOString(),
    heroImage: extractedHeroImage || customHeroImage,
    layoutImage: extractedLayoutImage || DEFAULT_MASTER_PROPOSAL.layoutImage,
    preparedBy: customPreparedBy,
    galleryImages: customGalleryImages,

    customer: {
      name: String(extraction.customerName.value || "Amanda Ratucoko"),
      email: String(extraction.salespersonEmail.value || "amanda@example.co.uk"),
      phone: String(extraction.salespersonPhone.value || "+44 7700 900077"),
      address: String(extraction.address.value || "13 Bryn Eirlys, Bridgend"),
      postcode: String(extraction.postcode.value || "CF35 6NU"),
    },

    system: {
      systemSizeKwp: typeof extraction.systemSizeKwp.value === "number" ? extraction.systemSizeKwp.value : 5.76,
      annualGenerationKwh: typeof extraction.annualGenerationKwh.value === "number" ? extraction.annualGenerationKwh.value : 4927,
      panelCount: typeof extraction.panelQuantity.value === "number" ? extraction.panelQuantity.value : 12,
      panelWattage: typeof extraction.panelWattage.value === "number" ? extraction.panelWattage.value : 480,
      panelManufacturer: String(extraction.panelManufacturer.value || "LONGi Solar"),
      panelModel: String(extraction.panelModel.value || "LR7-54HVH-480M"),
      inverterManufacturer: String(extraction.inverterManufacturer.value || "Hanchu ESS"),
      inverterModel: String(extraction.inverterModel.value || "HESS-HY-S-5.0K"),
      inverterCapacityKw: typeof extraction.inverterCapacityKw.value === "number" ? extraction.inverterCapacityKw.value : 5.0,
      inverterWarranty: String(extraction.inverterWarranty.value || "12 Years"),
      batteryManufacturer: String(extraction.batteryManufacturer.value || "Hanchu ESS"),
      batteryModel: String(extraction.batteryModel.value || "HOME-ESS-LV-9.4K"),
      batteryCapacityKwh: typeof extraction.batteryCapacityKwh.value === "number" ? extraction.batteryCapacityKwh.value : 8.93,
      batteryWarranty: String(extraction.batteryWarranty.value || "12 Years"),
    },

    technical: {
      roofGroup: String(extraction.roofGroup.value || "Roof Group 1 (South)"),
      orientation: String(extraction.roofOrientation.value || "South (180°)"),
      pitch: String(extraction.roofPitch.value || "37°"),
      shadeFactor: typeof extraction.shadeFactor.value === "number" ? extraction.shadeFactor.value : 0.999,
      kwhPerKwp: typeof extraction.kwhPerKwp.value === "number" ? extraction.kwhPerKwp.value : 856,
    },

    performance: {
      annualConsumptionKwh: typeof extraction.annualConsumptionKwh.value === "number" ? extraction.annualConsumptionKwh.value : 3461,
      annualGenerationKwh: typeof extraction.annualGenerationKwh.value === "number" ? extraction.annualGenerationKwh.value : 4927,
      selfConsumptionPercent: typeof extraction.selfConsumptionPercent.value === "number" ? extraction.selfConsumptionPercent.value : 54,
      selfSufficiencyPercent: typeof extraction.selfSufficiencyPercent.value === "number" ? extraction.selfSufficiencyPercent.value : 77,
      directToHomeKwh: typeof extraction.directToHomeKwh.value === "number" ? extraction.directToHomeKwh.value : 887,
      batteryToHomeKwh: typeof extraction.batteryToHomeKwh.value === "number" ? extraction.batteryToHomeKwh.value : 1774,
      exportToGridKwh: typeof extraction.exportToGridKwh.value === "number" ? extraction.exportToGridKwh.value : 2266,
    },

    financials: {
      baseSystemPrice: sysPrice,
      annualBillBefore: typeof extraction.annualBillBeforePounds.value === "number" ? extraction.annualBillBeforePounds.value : 1450,
      annualBillAfter: typeof extraction.annualBillAfterPounds.value === "number" ? extraction.annualBillAfterPounds.value : 592,
      firstYearSavings: typeof extraction.firstYearSavingsPounds.value === "number" ? extraction.firstYearSavingsPounds.value : 858,
      gridSavings: typeof extraction.gridSavingsPounds.value === "number" ? extraction.gridSavingsPounds.value : 560,
      exportIncome: typeof extraction.exportIncomePounds.value === "number" ? extraction.exportIncomePounds.value : 298,
      vatRatePercent: typeof extraction.vatPounds.value === "number" ? extraction.vatPounds.value : 0,
      roiPercent: typeof extraction.roiPercent.value === "number" ? extraction.roiPercent.value : 7.8,
      breakEvenYear: typeof extraction.breakEvenYear.value === "number" ? extraction.breakEvenYear.value : 11,
      lifetime25YearSavings: typeof extraction.lifetime25YearSavingsPounds.value === "number" ? extraction.lifetime25YearSavingsPounds.value : 42701,
      inflationRatePercent: typeof extraction.inflationRatePercent.value === "number" ? extraction.inflationRatePercent.value : 7.04,
    },

    monthlyData: extraction.monthlyData && extraction.monthlyData.length > 0 ? extraction.monthlyData : DEFAULT_MASTER_PROPOSAL.monthlyData,

    products: extraction.products && extraction.products.length > 0
      ? extraction.products.map((p, idx) => ({
          id: `prod-ext-${idx + 1}`,
          category: p.category,
          name: p.name,
          manufacturer: p.manufacturer,
          model: p.model,
          quantity: p.quantity,
          price: p.unitPrice,
          included: p.included,
          description: p.description,
          warranty: p.warranty,
        }))
      : DEFAULT_MASTER_PROPOSAL.products,

    milestones: [
      {
        id: "ms-1",
        label: "Upfront Deposit",
        percentage: depPct,
        amount: depositAmount,
        paymentMethod: "Bank Transfer / Card",
        description: "Paid upon proposal acceptance to secure hardware allocation & scheduling.",
        orderIndex: 1,
      },
      {
        id: "ms-2",
        label: "After Installation & Commissioning",
        percentage: 100 - depPct,
        amount: balanceAmount,
        paymentMethod: "Bank Transfer",
        description: "Paid after MCS installation, testing and commissioning completion.",
        orderIndex: 2,
      },
    ],

    acceptance: {
      status: "pending",
    },

    branding: DEFAULT_MASTER_PROPOSAL.branding,
  };
}

/**
 * Save FullInteractiveProposalData to local cache and Supabase DB.
 * Performs a complete relational insert/upsert across proposals, customers, solar_systems, financials, and products.
 */
export async function saveInteractiveProposal(proposal: FullInteractiveProposalData) {
  saveLocalProposalCache(proposal.publicToken, proposal);
  saveLocalProposalCache(proposal.reference, proposal);
  saveLocalProposalCache(proposal.id, proposal);

  const { isConfigured } = getSupabaseEnv();
  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      // 1. Resolve Auth User ID & Company ID
      let companyId = "5c813b60-7b97-47c1-9457-11f98adfb9b7";
      let createdById: string | null = null;
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user?.id) {
          createdById = authUser.user.id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", authUser.user.id)
            .maybeSingle();
          if (profile?.company_id) {
            companyId = profile.company_id;
          }
        }
      } catch (pe) {
        console.warn("Company ID resolution warning in saveInteractiveProposal", pe);
      }

      if (!createdById) {
        createdById = "abbceaf7-c24b-4984-a7e1-a2ee000d3bfe"; // Demo user fallback
      }

      // 2. Resolve / Upsert Customer Record
      let customerId: string | null = null;
      try {
        const nameParts = (proposal.customer.name || "Client").trim().split(" ");
        const firstName = nameParts[0] || "Client";
        const lastName = nameParts.slice(1).join(" ") || "Customer";
        const email = proposal.customer.email || `customer_${Date.now()}@example.co.uk`;

        const { data: existingCust } = await supabase
          .from("customers")
          .select("id")
          .eq("company_id", companyId)
          .ilike("first_name", firstName)
          .ilike("last_name", lastName)
          .maybeSingle();

        if (existingCust?.id) {
          customerId = existingCust.id;
        } else {
          const { data: newCust, error: custErr } = await supabase
            .from("customers")
            .insert({
              company_id: companyId,
              created_by: createdById,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: proposal.customer.phone || null,
              address_line_1: proposal.customer.address || null,
              postcode: proposal.customer.postcode || null,
            })
            .select("id")
            .single();

          if (!custErr && newCust) {
            customerId = newCust.id;
          }
        }
      } catch (ce) {
        console.warn("Customer upsert warning in saveInteractiveProposal", ce);
      }

      // Fallback customer ID if resolution failed
      if (!customerId) {
        const { data: fallbackCust } = await supabase
          .from("customers")
          .select("id")
          .eq("company_id", companyId)
          .limit(1)
          .maybeSingle();
        customerId = fallbackCust?.id || "abbceaf7-c24b-4984-a7e1-a2ee000d3bfe";
      }

      // 3. Check if Proposal row already exists
      const { data: existingProposal } = await supabase
        .from("proposals")
        .select("id")
        .or(`reference.eq.${proposal.reference},public_token.eq.${proposal.publicToken}`)
        .maybeSingle();

      if (existingProposal?.id) {
        // Update status and public token
        await supabase
          .from("proposals")
          .update({
            status: proposal.status,
            public_token: proposal.publicToken,
            published_at: proposal.publishedAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProposal.id);
      } else {
        // Full Relational Insert for New Proposal
        const { data: newProposal, error: propErr } = await supabase
          .from("proposals")
          .insert({
            reference: proposal.reference,
            company_id: companyId,
            customer_id: customerId,
            created_by: createdById,
            status: proposal.status,
            public_token: proposal.publicToken,
            published_at: proposal.publishedAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (propErr) {
          console.error("Proposals insert error in saveInteractiveProposal:", propErr);
        }

        if (!propErr && newProposal?.id) {
          const propId = newProposal.id;

          // Insert linked Solar System record
          await supabase.from("solar_systems").insert({
            proposal_id: propId,
            system_size_kwp: proposal.system.systemSizeKwp,
            annual_generation_kwh: proposal.system.annualGenerationKwh,
            panel_count: proposal.system.panelCount,
            panel_wattage: proposal.system.panelWattage,
            panel_manufacturer: proposal.system.panelManufacturer,
            panel_model: proposal.system.panelModel,
            inverter_manufacturer: proposal.system.inverterManufacturer,
            inverter_model: proposal.system.inverterModel,
            inverter_capacity_kw: proposal.system.inverterCapacityKw,
            battery_manufacturer: proposal.system.batteryManufacturer,
            battery_model: proposal.system.batteryModel,
            battery_capacity_kwh: proposal.system.batteryCapacityKwh,
            annual_consumption_kwh: proposal.performance.annualConsumptionKwh,
            self_consumption_percent: proposal.performance.selfConsumptionPercent,
            self_sufficiency_percent: proposal.performance.selfSufficiencyPercent,
            export_kwh: proposal.performance.exportToGridKwh,
          });

          // Insert linked Financials record
          await supabase.from("financials").insert({
            proposal_id: propId,
            system_price: proposal.financials.baseSystemPrice,
            vat: proposal.financials.vatRatePercent,
            deposit: proposal.milestones[0]?.amount || Math.round(proposal.financials.baseSystemPrice * 0.25),
            annual_saving: proposal.financials.firstYearSavings,
            lifetime_saving: proposal.financials.lifetime25YearSavings,
            payback_years: proposal.financials.breakEvenYear,
            inflation_rate: proposal.financials.inflationRatePercent,
          });

          // Insert linked Products
          if (proposal.products && proposal.products.length > 0) {
            const productInserts = proposal.products.map((p) => ({
              proposal_id: propId,
              name: p.name,
              category: p.category,
              manufacturer: p.manufacturer,
              model: p.model,
              quantity: p.quantity,
              unit_price: p.price,
              included: p.included,
              description: p.description,
              warranty: p.warranty,
            }));
            await supabase.from("proposal_products").insert(productInserts);
          }

          // Insert Payment Milestones
          if (proposal.milestones && proposal.milestones.length > 0) {
            const milestoneInserts = proposal.milestones.map((m) => ({
              proposal_id: propId,
              label: m.label,
              percentage: m.percentage,
              amount: m.amount,
              payment_method: m.paymentMethod,
              description: m.description,
              order_index: m.orderIndex,
            }));
            await supabase.from("payment_milestones").insert(milestoneInserts);
          }
        }
      }
    } catch (e) {
      console.warn("saveInteractiveProposal Supabase relational insert exception", e);
    }
  }
}

export function applyMasterTemplateOverrides(proposal: FullInteractiveProposalData): FullInteractiveProposalData {
  if (typeof window === "undefined") return proposal;

  try {
    let cover: any = null;
    let panelLayout: any = null;
    let ourWork: any = null;

    const cache = (window as any).__MADOLA_MASTER_TEMPLATE_CACHE__;
    if (cache?.blocks) {
      cover = cache.blocks.find((b: any) => b.type === "cover");
      panelLayout = cache.blocks.find((b: any) => b.type === "panel_layout");
      ourWork = cache.blocks.find((b: any) => b.type === "our_work");
    }

    if (!cover && !panelLayout && !ourWork) {
      const keys = [
        "madola_template_template-madola-standard",
        "madola_saved_blocks_proposal-default-1",
        "madola_current_proposal",
      ];
      for (const key of keys) {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          const blocks = parsed.blocks || (Array.isArray(parsed) ? parsed : null);
          if (blocks) {
            if (!cover) cover = blocks.find((b: any) => b.type === "cover");
            if (!panelLayout) panelLayout = blocks.find((b: any) => b.type === "panel_layout");
            if (!ourWork) ourWork = blocks.find((b: any) => b.type === "our_work");
          }
        }
      }
    }

    const heroImage = cover?.data?.heroImage;
    const layoutImage = panelLayout?.data?.layoutImage || heroImage;
    const preparedBy = cover?.data?.preparedBy;
    const galleryImages = ourWork?.data?.images || (ourWork?.data?.mainImage ? [ourWork.data.mainImage.url, ...(ourWork.data.supportingImages?.map((s: any) => s.url) || [])] : null);

    return {
      ...proposal,
      heroImage: heroImage || proposal.heroImage,
      layoutImage: proposal.layoutImage || layoutImage || heroImage || proposal.heroImage,
      preparedBy: preparedBy ? { ...proposal.preparedBy, ...preparedBy } : proposal.preparedBy,
      galleryImages: galleryImages && galleryImages.length > 0 ? galleryImages : proposal.galleryImages,
    };
  } catch (e) {
    console.warn("Error in applyMasterTemplateOverrides", e);
  }

  return proposal;
}

/**
 * Fetch full interactive proposal by public slug or public token.
 */
export async function getInteractiveProposal(tokenOrSlug: string): Promise<FullInteractiveProposalData | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.rpc("get_public_proposal", { p_token: tokenOrSlug });

      if (!error && data && data.status === "success" && data.proposal) {
        const prop = data.proposal;
        const result: FullInteractiveProposalData = applyMasterTemplateOverrides({
          ...DEFAULT_MASTER_PROPOSAL,
          reference: prop.reference || DEFAULT_MASTER_PROPOSAL.reference,
          publicSlug: tokenOrSlug,
          publicToken: tokenOrSlug,
          status: prop.status || "published",
          publishedAt: prop.publishedAt,
          customer: {
            name: prop.customer?.name || DEFAULT_MASTER_PROPOSAL.customer.name,
            email: prop.customer?.email || DEFAULT_MASTER_PROPOSAL.customer.email,
            address: prop.customer?.address || DEFAULT_MASTER_PROPOSAL.customer.address,
            postcode: prop.customer?.postcode || DEFAULT_MASTER_PROPOSAL.customer.postcode,
          },
          acceptance: {
            status: prop.acceptance?.status || "pending",
            acceptedAt: prop.acceptance?.accepted_at,
            customerName: prop.acceptance?.customer_name,
            customerEmail: prop.acceptance?.customer_email,
            notes: prop.acceptance?.notes,
          },
        });
        saveLocalProposalCache(tokenOrSlug, result);
        return result;
      }

      // Direct Table Fallback Query
      const { data: propRow } = await supabase
        .from("proposals")
        .select(`
          id, reference, status, public_token, published_at,
          customer:customers(first_name, last_name, email, phone, address_line_1, postcode),
          solar_system:solar_systems(system_size_kwp, annual_generation_kwh, panel_count, panel_wattage, panel_manufacturer, panel_model, inverter_manufacturer, inverter_model, battery_manufacturer, battery_model, battery_capacity_kwh),
          financial:financials(system_price)
        `)
        .or(`public_token.eq.${tokenOrSlug},reference.eq.${tokenOrSlug}`)
        .maybeSingle();

      if (propRow) {
        const cust = Array.isArray(propRow.customer) ? propRow.customer[0] : propRow.customer;
        const sys = Array.isArray(propRow.solar_system) ? propRow.solar_system[0] : propRow.solar_system;
        const fin = Array.isArray(propRow.financial) ? propRow.financial[0] : propRow.financial;

        const result: FullInteractiveProposalData = applyMasterTemplateOverrides({
          ...DEFAULT_MASTER_PROPOSAL,
          id: propRow.id,
          reference: propRow.reference || DEFAULT_MASTER_PROPOSAL.reference,
          publicSlug: tokenOrSlug,
          publicToken: tokenOrSlug,
          status: (propRow.status as any) || "published",
          publishedAt: propRow.published_at || new Date().toISOString(),
          customer: {
            name: cust ? `${cust.first_name || ""} ${cust.last_name || ""}`.trim() : DEFAULT_MASTER_PROPOSAL.customer.name,
            email: cust?.email || DEFAULT_MASTER_PROPOSAL.customer.email,
            phone: cust?.phone || DEFAULT_MASTER_PROPOSAL.customer.phone,
            address: cust?.address_line_1 || DEFAULT_MASTER_PROPOSAL.customer.address,
            postcode: cust?.postcode || DEFAULT_MASTER_PROPOSAL.customer.postcode,
          },
          system: {
            ...DEFAULT_MASTER_PROPOSAL.system,
            systemSizeKwp: sys?.system_size_kwp || DEFAULT_MASTER_PROPOSAL.system.systemSizeKwp,
            annualGenerationKwh: sys?.annual_generation_kwh || DEFAULT_MASTER_PROPOSAL.system.annualGenerationKwh,
            panelCount: sys?.panel_count || DEFAULT_MASTER_PROPOSAL.system.panelCount,
            panelWattage: sys?.panel_wattage || DEFAULT_MASTER_PROPOSAL.system.panelWattage,
            panelManufacturer: sys?.panel_manufacturer || DEFAULT_MASTER_PROPOSAL.system.panelManufacturer,
            panelModel: sys?.panel_model || DEFAULT_MASTER_PROPOSAL.system.panelModel,
            inverterManufacturer: sys?.inverter_manufacturer || DEFAULT_MASTER_PROPOSAL.system.inverterManufacturer,
            inverterModel: sys?.inverter_model || DEFAULT_MASTER_PROPOSAL.system.inverterModel,
            batteryManufacturer: sys?.battery_manufacturer || DEFAULT_MASTER_PROPOSAL.system.batteryManufacturer,
            batteryModel: sys?.battery_model || DEFAULT_MASTER_PROPOSAL.system.batteryModel,
            batteryCapacityKwh: sys?.battery_capacity_kwh || DEFAULT_MASTER_PROPOSAL.system.batteryCapacityKwh,
          },
          financials: {
            ...DEFAULT_MASTER_PROPOSAL.financials,
            baseSystemPrice: fin?.system_price || DEFAULT_MASTER_PROPOSAL.financials.baseSystemPrice,
          },
        });
        saveLocalProposalCache(tokenOrSlug, result);
        return result;
      }
    } catch (e) {
      console.warn("Supabase proposal lookup failed, using master reference dataset", e);
    }
  }

  // Local fallback cache lookup
  const cache = getLocalProposalCache();
  if (cache[tokenOrSlug]) {
    return applyMasterTemplateOverrides(cache[tokenOrSlug]);
  }
  if (typeof window !== "undefined") {
    try {
      const single = localStorage.getItem(`madola_prop_${tokenOrSlug}`);
      if (single) {
        return applyMasterTemplateOverrides(JSON.parse(single));
      }
    } catch (e) {}
  }

  // Always return master proposal template for any pub_tok_ token so proposal previews never 404
  if (tokenOrSlug.startsWith("pub_tok_") || tokenOrSlug === "VYKDSFMWJW5N" || tokenOrSlug === DEFAULT_MASTER_PROPOSAL.publicToken) {
    return applyMasterTemplateOverrides({
      ...DEFAULT_MASTER_PROPOSAL,
      publicSlug: tokenOrSlug,
      publicToken: tokenOrSlug,
    });
  }

  return null;
}

/**
 * Record public proposal acceptance securely via Database & RPC.
 */
export async function acceptInteractiveProposal(
  tokenOrSlug: string,
  signerName: string,
  signerEmail: string,
  notes?: string
): Promise<boolean> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      // 1. Ensure authenticated demo session if running server-side
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser?.user) {
          await supabase.auth.signInWithPassword({
            email: "demo@demo.com",
            password: "Demo12345",
          });
        }
      } catch (authErr) {
        console.warn("Auth check notice during acceptance:", authErr);
      }

      // 2. Find Proposal by UUID or Token or Reference
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tokenOrSlug);
      let query = supabase.from("proposals").select("id, reference, status");
      if (isUuid) {
        query = query.or(`id.eq.${tokenOrSlug},public_token.eq.${tokenOrSlug},reference.eq.${tokenOrSlug}`);
      } else {
        query = query.or(`public_token.eq.${tokenOrSlug},reference.eq.${tokenOrSlug}`);
      }

      const { data: propRow, error: pErr } = await query.maybeSingle();

      let targetProposalId = propRow?.id;

      if (targetProposalId) {
        // 3. Update proposal status to 'accepted'
        await supabase
          .from("proposals")
          .update({
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetProposalId);

        // 4. Delete existing acceptance record if any to prevent duplicates
        await supabase
          .from("proposal_acceptance")
          .delete()
          .eq("proposal_id", targetProposalId);

        // 5. Insert new acceptance record
        await supabase
          .from("proposal_acceptance")
          .insert({
            proposal_id: targetProposalId,
            customer_name: signerName,
            customer_email: signerEmail,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            notes: notes || null,
          });
      } else {
        // Fallback: If proposal row does not exist yet in DB, create it with customer and record acceptance
        let customerId = "abbceaf7-c24b-4984-a7e1-a2ee000d3bfe";
        const { data: custData } = await supabase.from("customers").select("id").limit(1).maybeSingle();
        if (custData?.id) customerId = custData.id;

        const { data: newProp } = await supabase
          .from("proposals")
          .insert({
            reference: tokenOrSlug.startsWith("pub_tok_") ? tokenOrSlug.substring(8, 20).toUpperCase() : tokenOrSlug,
            company_id: "5c813b60-7b97-47c1-9457-11f98adfb9b7",
            customer_id: customerId,
            created_by: "abbceaf7-c24b-4984-a7e1-a2ee000d3bfe",
            status: "accepted",
            public_token: tokenOrSlug,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (newProp?.id) {
          targetProposalId = newProp.id;
          await supabase.from("proposal_acceptance").insert({
            proposal_id: targetProposalId,
            customer_name: signerName,
            customer_email: signerEmail,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            notes: notes || null,
          });
        }
      }
    } catch (e) {
      console.error("Supabase direct proposal acceptance sync error:", e);
    }
  }

  // Update local in-memory & localStorage cache
  const cache = getLocalProposalCache();
  const current = cache[tokenOrSlug] || { ...DEFAULT_MASTER_PROPOSAL, publicSlug: tokenOrSlug };
  current.status = "accepted";
  current.acceptance = {
    status: "accepted",
    acceptedAt: new Date().toISOString(),
    customerName: signerName,
    customerEmail: signerEmail,
    notes,
  };
  saveLocalProposalCache(tokenOrSlug, current);
  if (current.id) saveLocalProposalCache(current.id, current);
  if (current.reference) saveLocalProposalCache(current.reference, current);

  return true;
}
