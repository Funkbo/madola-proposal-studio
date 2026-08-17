"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCompanyBranding } from "@/lib/branding";
import { createClient } from "@/lib/supabase/client";
import { FullInteractiveProposalData, InteractiveProposalProductItem } from "@/types/interactiveProposal";
import { calculateProposalPricing } from "@/lib/services/proposalPricing";
import { calculatePaymentMilestones } from "@/lib/services/paymentCalculator";
import {
  Sun,
  Zap,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  PlusCircle,
  Check,
  Car,
  DollarSign,
  Clock,
  Send,
  HelpCircle,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

interface InteractiveProposalViewProps {
  proposal: FullInteractiveProposalData;
  onAccept?: (signerName: string, signerEmail: string, notes?: string) => Promise<boolean>;
}

export function InteractiveProposalView({ proposal: rawProposal, onAccept }: InteractiveProposalViewProps) {
  const branding = useCompanyBranding();
  const [logoError, setLogoError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Dynamic Template Customizations Synchronization via useEffect (prevents SSR hydration mismatch)
  const [proposal, setProposal] = useState<FullInteractiveProposalData>(rawProposal);

  useEffect(() => {
    setIsMounted(true);
    try {
      const cache = (window as any).__MADOLA_MASTER_TEMPLATE_CACHE__;
      let cover: any = null;
      let panelLayout: any = null;
      let ourWork: any = null;

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
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            const blocks = parsed.blocks || (Array.isArray(parsed) ? parsed : null);
            if (blocks) {
              if (!cover) cover = blocks.find((b: any) => b.type === "cover");
              if (!panelLayout) panelLayout = blocks.find((b: any) => b.type === "panel_layout");
              if (!ourWork) ourWork = blocks.find((b: any) => b.type === "our_work");
            }
          }
        }
      }

      const customHero = cover?.data?.heroImage;
      const customLayout = panelLayout?.data?.layoutImage;
      const customPreparedBy = cover?.data?.preparedBy;
      const customGallery = ourWork?.data?.images || (ourWork?.data?.mainImage ? [ourWork.data.mainImage.url, ...(ourWork.data.supportingImages?.map((s: any) => s.url) || [])] : null);

      const isValidImg = (img?: string) => typeof img === "string" && img.length > 50;

      if (customHero || customLayout || customPreparedBy || customGallery) {
        setProposal((prev) => ({
          ...prev,
          heroImage: isValidImg(customHero) ? customHero : prev.heroImage,
          layoutImage: isValidImg(prev.layoutImage)
            ? prev.layoutImage
            : isValidImg(customLayout)
            ? customLayout
            : "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
          preparedBy: {
            ...prev.preparedBy,
            ...(customPreparedBy || {}),
          },
          galleryImages: customGallery && customGallery.length > 0 ? customGallery : prev.galleryImages,
        }));
      }

      // Automatically fetch logged-in user details from Supabase Auth session
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const email = user.email || "";
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (email ? email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : "");

          if (fullName || email) {
            setProposal((prev) => ({
              ...prev,
              preparedBy: {
                name: fullName || prev.preparedBy?.name || "Neil Parry",
                email: email || prev.preparedBy?.email || "nparry@madolaenergy.com",
                profileImage: user.user_metadata?.avatar_url || prev.preparedBy?.profileImage,
              },
            }));
          }
        }
      });
    } catch (e) {
      console.warn("Error reading template cache or user session inside InteractiveProposalView", e);
    }
  }, [rawProposal]);

  const activeHeroImage = isMounted ? proposal.heroImage : rawProposal.heroImage;
  const activePreparedBy = isMounted ? proposal.preparedBy : rawProposal.preparedBy;

  // Product state (Dynamic Inclusion/Exclusion)
  const [productsState, setProductsState] = useState<InteractiveProposalProductItem[]>(proposal.products);
  const [selectedEvId, setSelectedEvId] = useState<string | null>(
    proposal.products.find((p) => p.category === "ev" && p.included)?.id || null
  );

  // Gallery Modal
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Bill Comparison View Mode
  const [billComparisonYear, setBillComparisonYear] = useState<number>(1);

  // Acceptance Form State
  const [signerName, setSignerName] = useState(proposal.customer.name);
  const [signerEmail, setSignerEmail] = useState(proposal.customer.email);
  const [notes, setNotes] = useState("");
  const [acceptanceStatus, setAcceptanceStatus] = useState<"pending" | "accepted">(proposal.acceptance.status === "accepted" ? "accepted" : "pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);

  // Toggle Product Inclusion
  const toggleProduct = (productId: string) => {
    setProductsState((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, included: !p.included } : p))
    );
  };

  // Select EV Charger
  const handleEvSelect = (chargerId: string) => {
    if (selectedEvId === chargerId) {
      setSelectedEvId(null);
      setProductsState((prev) =>
        prev.map((p) => (p.category === "ev" ? { ...p, included: false } : p))
      );
    } else {
      setSelectedEvId(chargerId);
      setProductsState((prev) =>
        prev.map((p) =>
          p.category === "ev" ? { ...p, included: p.id === chargerId } : p
        )
      );
    }
  };

  // Recalculate Pricing Dynamically
  const pricing = useMemo(() => {
    return calculateProposalPricing({
      baseSystemPrice: proposal.financials.baseSystemPrice,
      products: productsState,
      vatRatePercent: proposal.financials.vatRatePercent,
    });
  }, [proposal.financials.baseSystemPrice, proposal.financials.vatRatePercent, productsState]);

  // Recalculate Payment Milestones Dynamically
  const paymentMilestones = useMemo(() => {
    return calculatePaymentMilestones(pricing.finalTotal, proposal.milestones);
  }, [pricing.finalTotal, proposal.milestones]);

  // 25-Year Projection Engine
  const yearProjections = useMemo(() => {
    const years = [];
    const infRate = proposal.financials.inflationRatePercent / 100;
    const baseBill = proposal.financials.annualBillBefore;
    const baseSavings = proposal.financials.firstYearSavings;

    let cumWithoutSolar = 0;
    let cumWithSolar = 0;

    for (let yr = 1; yr <= 25; yr++) {
      const yearMultiplier = Math.pow(1 + infRate, yr - 1);
      const billWithout = baseBill * yearMultiplier;
      const savingThisYear = baseSavings * yearMultiplier;
      const billWith = Math.max(0, billWithout - savingThisYear);

      cumWithoutSolar += billWithout;
      cumWithSolar += billWith;

      years.push({
        year: yr,
        billWithoutSolar: Math.round(billWithout),
        billWithSolar: Math.round(billWith),
        annualSavings: Math.round(savingThisYear),
        cumWithoutSolar: Math.round(cumWithoutSolar),
        cumWithSolar: Math.round(cumWithSolar),
        cumSavings: Math.round(cumWithoutSolar - cumWithSolar),
      });
    }

    return years;
  }, [proposal.financials]);

  // Handle Digital Acceptance
  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAcceptanceError(null);

    try {
      if (onAccept) {
        const ok = await onAccept(signerName, signerEmail, notes);
        if (ok) {
          setAcceptanceStatus("accepted");
        } else {
          setAcceptanceError("Could not submit proposal acceptance. Please try again.");
        }
      } else {
        // Fallback demo simulation
        setAcceptanceStatus("accepted");
      }
    } catch (err: any) {
      setAcceptanceError(err.message || "Failed to submit proposal acceptance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGalleryImages = useMemo(() => {
    if (proposal.galleryImages && proposal.galleryImages.length > 0) {
      return proposal.galleryImages;
    }
    return [
      "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542336391-ae2936d8eff4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592833159057-651427787342?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [proposal.galleryImages]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!logoError && branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName}
                onError={() => setLogoError(true)}
                className="max-w-[150px] sm:max-w-[180px] w-auto max-h-9 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-950">
                  <Sun className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">MADOLA</span>
                  <span className="text-[10px] text-emerald-500 uppercase font-bold ml-1 tracking-wider">
                    ENERGY
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Section Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#section-hero" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Overview</a>
            <a href="#section-stats" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Key Metrics</a>
            <a href="#section-hardware" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">System Hardware</a>
            <a href="#section-performance" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Performance</a>
            <a href="#section-financials" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Financial Return</a>
            <a href="#section-options" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Options</a>
            <a href="#section-payment" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Payment Schedule</a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#section-acceptance"
              className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <span>Accept Proposal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Document Content Container with Right Navigation Sidebar */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Left Proposal Column */}
          <div className="flex-1 min-w-0 space-y-12 w-full">
            {/* ========================================================================= */}
            {/* SECTION 1 — HERO & COVER */}
            {/* ========================================================================= */}
            <section id="section-hero" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-slate-900 dark:text-slate-100 font-sans antialiased relative overflow-hidden animate-fade-in-up">
              {/* Top Banner Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prepared Specifically For You</span>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Ref: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{proposal.reference}</span>
                  {proposal.createdAt && (
                    <span className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                      Valid until {proposal.expiresAt || "30 Days"}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Proposal Headline */}
              <div className="pt-2 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Madola Energy • UK Solar & Storage Proposal
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                  {proposal.customer?.name === "[Customer Name]" ? "Personalised Solar Proposal" : `Solar Proposal for ${proposal.customer.name}`}
                </h1>
                {proposal.customer?.address && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium pt-1">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{proposal.customer.address}</span>
                  </div>
                )}
              </div>

              {/* Hero Image Banner */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] border border-slate-200/80 dark:border-slate-800/80 shadow-md bg-slate-100 dark:bg-slate-950 group">
                <img
                  src={activeHeroImage || "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"}
                  alt="Solar Installation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-end p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="text-white">
                      <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Recommended System</p>
                      <p className="text-xl sm:text-2xl font-extrabold">{proposal.system.systemSizeKwp} kWp Solar & Battery Storage</p>
                    </div>
                    <a
                      href="#section-stats"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-[0.98] flex items-center gap-1.5 min-h-[44px]"
                    >
                      <span>Explore Your Proposal</span>
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Prepared By Advisor Card */}
              <div className="pt-2 flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activePreparedBy?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt="Advisor Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      Prepared by {activePreparedBy?.name || "Neil Parry"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activePreparedBy?.email || "nparry@madolaenergy.com"}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20">
                    MCS Certified Solar Advisor
                  </span>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* SECTION 2 — KEY SYSTEM STATISTICS */}
            {/* ========================================================================= */}
            <section id="section-stats" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Key Proposal Metrics</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Data-driven performance summary tailored to your property</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* System Size */}
                <div className="madola-card madola-card-hover p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">System Size</span>
                    <Sun className="w-4 h-4 fill-amber-400 text-amber-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    {proposal.system.systemSizeKwp} <span className="text-sm font-bold text-slate-500">kWp</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{proposal.system.panelCount} Solar Panels</p>
                </div>

                {/* Annual Generation */}
                <div className="madola-card madola-card-hover p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Annual Output</span>
                    <Zap className="w-4 h-4 fill-emerald-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    {proposal.system.annualGenerationKwh.toLocaleString()} <span className="text-sm font-bold text-slate-500">kWh</span>
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Clean Solar Generation</p>
                </div>

                {/* Energy Independence */}
                <div className="madola-card madola-card-hover p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-teal-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Independence</span>
                    <Battery className="w-4 h-4 text-teal-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    {proposal.performance.selfSufficiencyPercent}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Off-Grid Self Sufficiency</p>
                </div>

                {/* First-Year Savings */}
                <div className="madola-card madola-card-hover p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Year 1 Savings</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    £{proposal.financials.firstYearSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grid Savings & SEG Tariff</p>
                </div>
              </div>
            </section>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* SECTION 2 — WHY CHOOSE MADOLA? */}
        {/* ========================================================================= */}
        <section id="section-why-us" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-slate-900 font-sans antialiased">
          {/* Top Header Row */}
          <div className="flex items-center justify-between">
            <div className="bg-emerald-500 text-white font-extrabold text-xs px-5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              Why Choose Us?
            </div>

            <div className="flex items-center gap-2">
              {!logoError && branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  onError={() => setLogoError(true)}
                  className="h-9 max-w-[180px] w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-base font-black tracking-wider text-slate-900 uppercase">
                    MADOLA ENERGY
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Section Title */}
          <div className="pt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Why Choose Madola?
            </h2>
          </div>

          {/* Body Copy */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Madola Energy is a leading provider of solar power solutions for businesses and homes across the UK. Since our founding in 2013, we've been dedicated to providing high-quality, reliable, and sustainable solar power installations that help our customers save money, reduce their carbon footprint, and make a positive impact on the environment.
            </p>
            <p>
              We are committed to staying at the forefront of new and innovative technologies in the solar power industry, and to deliver tailored solutions that meet the unique needs of each customer.
            </p>
          </div>

          {/* Subheading & Bullets */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              The Madola way
            </h4>
            <ul className="space-y-2.5 pl-1 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>
                  <strong className="text-slate-900 font-bold">Certified and accredited</strong> by leading industry organisations, ensuring the highest standards of quality and performance.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 font-bold">•</span>
                <span>
                  <strong className="text-slate-900 font-bold">Free consultation and support</strong> from our team of experts to help you make informed decisions and choose the best solar power solutions for your needs.
                </span>
              </li>
            </ul>
          </div>

          {/* Tagline */}
          <div className="pt-1">
            <p className="text-xs sm:text-sm font-bold italic text-slate-900">
              Go Solar, with Madola!
            </p>
          </div>

          {/* Accreditation Logos Row */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            {/* HIES */}
            <div className="h-12 px-3 rounded-xl bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center text-center uppercase shadow-sm">
              HIES<br/>Accredited Member
            </div>
            {/* TSI Approved Code */}
            <div className="h-12 px-3 rounded-xl bg-purple-900 text-white font-bold text-[9px] flex flex-col justify-center border border-purple-700">
              <span className="text-pink-300 font-extrabold text-[8px] uppercase">tsi</span>
              <span className="font-black text-[9px] leading-none uppercase">APPROVED CODE</span>
              <span className="text-[7px] text-purple-300">TRADINGSTANDARDS.UK</span>
            </div>
            {/* SafeContractor */}
            <div className="h-12 px-3 rounded-xl bg-slate-900 text-white font-bold text-[9px] flex items-center gap-1.5 border border-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">✓</div>
              <div>
                <div className="font-extrabold text-[9px] leading-none uppercase">SafeContractor</div>
                <div className="text-[8px] text-slate-400 font-medium">APPROVED</div>
              </div>
            </div>
            {/* OLEV */}
            <div className="h-12 px-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 font-extrabold text-[10px] flex flex-col justify-center uppercase">
              <div className="font-black tracking-wider text-xs leading-none">OLEV</div>
              <div className="text-[7px] text-emerald-700 font-semibold tracking-tight">approved installer</div>
            </div>
            {/* TRUSTMARK */}
            <div className="h-12 px-3.5 rounded-xl bg-teal-800 text-white font-extrabold text-[10px] flex flex-col justify-center uppercase shadow-sm">
              <div className="font-black tracking-wider text-xs leading-none text-teal-300">TRUSTMARK</div>
              <div className="text-[7px] text-teal-100 font-medium">Government Endorsed Quality</div>
            </div>
            {/* NAPIT */}
            <div className="h-12 px-4 rounded-xl bg-blue-950 text-white font-black text-sm flex items-center gap-1 border border-blue-800 shadow-sm">
              <span className="text-red-500 text-lg">✓</span>
              <span className="tracking-wider">NAPIT</span>
            </div>
            {/* City & Guilds */}
            <div className="h-12 px-3 rounded-xl bg-red-700 text-white font-bold text-[9px] flex flex-col justify-center uppercase shadow-sm">
              <div className="font-black text-[10px] leading-none">City & Guilds</div>
              <div className="text-[7px] text-red-100 font-medium mt-0.5">Accredited Programme</div>
            </div>
          </div>
        </section>

        {/* DARK CEO MISSION CARD */}
        <section className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activePreparedBy?.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt="Neil Parry"
                className="w-11 h-11 rounded-full object-cover border border-slate-700 shadow-sm shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  {activePreparedBy?.name || "Neil Parry"}
                </h4>
                <p className="text-xs text-slate-400 font-medium">{activePreparedBy?.email || "nparry@madolaenergy.com"}</p>
                <span className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors block cursor-pointer">
                  Click to learn more about me
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!logoError && branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  onError={() => setLogoError(true)}
                  className="h-8 max-w-[150px] w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-sm font-black tracking-wider text-white uppercase">
                    MADOLA ENERGY
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            Madola Energy, our mission is to protect our planet and our children's future by providing innovative and sustainable solar power solutions that help businesses and households reduce their carbon footprint and save money on their energy bills.
          </p>

          <p className="text-xs font-bold text-white pt-1">
            Neil Parry - CEO, Madola Energy.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — TRUSTPILOT REVIEW WIDGET */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-2xl">
              4.9★
            </div>
            <div>
              <div className="flex items-center gap-1 text-emerald-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-emerald-500" />
                ))}
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">Excellent Trustpilot Rating</h3>
              <p className="text-xs text-slate-500">Based on verified UK homeowner installations</p>
            </div>
          </div>
          <blockquote className="text-xs text-slate-600 italic border-l-2 border-emerald-500 pl-4 max-w-md">
            "Madola Energy completed our 12-panel installation in a single day. The battery storage has slashed our winter energy bills significantly!"
          </blockquote>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — INSTALLATION GALLERY */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Installation Quality Gallery</h2>
              <p className="text-xs text-slate-500">Recent Madola Energy installations across the UK</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeGalleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImage(img)}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <img src={img} alt={`Installation ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
              </button>
            ))}
          </div>

          {/* Lightbox Modal */}
          {lightboxImage && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
              <div className="max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl relative">
                <img src={lightboxImage} alt="Expanded Installation" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — SOLAR PANEL LAYOUT & SYSTEM OUTPUT */}
        {/* ========================================================================= */}
        <section id="section-panel-layout" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 text-slate-900 font-sans antialiased">
          {/* 1. Top Header Row: Green Rounded Pill on LEFT, Madola Logo on RIGHT */}
          <div className="flex items-center justify-between">
            <div className="bg-emerald-500 text-white font-extrabold text-xs px-5 py-1.5 rounded-full shadow-sm uppercase tracking-wider">
              Panel layout
            </div>

            <div className="flex items-center gap-2">
              {!logoError && branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.companyName}
                  onError={() => setLogoError(true)}
                  className="h-9 max-w-[180px] w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-base font-black tracking-wider text-slate-900 uppercase">
                    MADOLA ENERGY
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Main Title */}
          <div className="pt-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Solar panel layout & system output
            </h2>
          </div>

          {/* 3. Dynamic Description Copy */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This system includes <strong className="text-slate-900 font-bold">{proposal.system.panelCount} {proposal.system.panelManufacturer} solar panels</strong> installed on a single roof. It's powered by a <strong className="text-slate-900 font-bold">{proposal.system.inverterManufacturer} inverter</strong> and backed up by a <strong className="text-slate-900 font-bold">{proposal.system.batteryManufacturer} battery</strong> for reliable energy storage.
          </p>

          {/* 4. Roof Image / Solar Panel Layout Diagram */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/10] border border-slate-200/80 shadow-md bg-slate-100 group">
            <img
              src={proposal.layoutImage || activeHeroImage || "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=1200&q=80"}
              alt="Solar Panel Roof Layout"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* 5. Production Yield Output Banner */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <p className="text-xs text-slate-500 font-medium">
              Using MCS certified calculations we estimate that your panels will produce:
            </p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {proposal.system.annualGenerationKwh.toLocaleString()} kWh per year
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — SYSTEM HARDWARE */}
        {/* ========================================================================= */}
        <section id="section-hardware" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">System Hardware Highlights</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Premium MCS-certified components specified for long-term durability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panels */}
            <div className="madola-card madola-card-hover p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sun className="w-6 h-6 fill-amber-400" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{proposal.system.panelManufacturer}</h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{proposal.system.panelModel}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  High efficiency N-Type TOPCon panels engineered for optimal performance in UK light conditions.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                <span>Warranty</span>
                <span className="text-emerald-600 dark:text-emerald-400">25 Years</span>
              </div>
            </div>

            {/* Inverter */}
            <div className="madola-card madola-card-hover p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{proposal.system.inverterManufacturer}</h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{proposal.system.inverterModel}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bespoke hybrid inverter with EPS emergency backup capability and dual MPPT tracking.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                <span>Warranty</span>
                <span className="text-emerald-600 dark:text-emerald-400">{proposal.system.inverterWarranty}</span>
              </div>
            </div>

            {/* Battery */}
            <div className="madola-card madola-card-hover p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex p-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white">
                  <Battery className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{proposal.system.batteryManufacturer}</h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{proposal.system.batteryModel}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Safe LFP (Lithium Iron Phosphate) battery chemistry with high depth of discharge.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                <span>Warranty</span>
                <span className="text-emerald-600 dark:text-emerald-400">{proposal.system.batteryWarranty}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — TECHNICAL DETAILS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Technical Array Specifications</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Roof Array</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{proposal.technical.roofGroup}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Orientation</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{proposal.technical.orientation}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Pitch</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{proposal.technical.pitch}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Specific Yield</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{proposal.technical.kwhPerKwp} kWh/kWp</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 — PERFORMANCE ESTIMATES */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Estimated Annual Energy Performance</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Self-Sufficiency</span>
                <span className="text-2xl font-extrabold text-emerald-700">{proposal.performance.selfSufficiencyPercent}%</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Percentage of your home's total electricity demand met directly by solar PV and battery storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Self-Consumption</span>
                <span className="text-2xl font-extrabold text-amber-300">{proposal.performance.selfConsumptionPercent}%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Percentage of generated solar energy consumed directly inside your home rather than exported.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 11 — EXPERT DISCLAIMER */}
        {/* ========================================================================= */}
        <section className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <HelpCircle className="w-4 h-4" />
            <span>MCS Standard Performance Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            Solar PV generation estimates are calculated in accordance with MCS standards (PVGIS / SAP methodology). Actual output varies depending on localized weather, shading changes, and seasonal irradiance.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12 — YOUR ELECTRICITY USAGE */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Annual Electricity Profile</h2>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Baseline Annual Usage</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{proposal.performance.annualConsumptionKwh.toLocaleString()} kWh</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500 uppercase font-semibold">Estimated Bill Without Solar</p>
              <p className="text-2xl font-extrabold text-rose-600 mt-0.5">£{proposal.financials.annualBillBefore.toLocaleString()} / yr</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 13 — WHERE WILL YOUR SOLAR GO? */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Where Will Your Solar Energy Go?</h2>
            <p className="text-xs text-slate-500">Distribution breakdown of your 4,927 kWh annual solar generation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <p className="text-xs font-bold text-emerald-800">Direct to Home</p>
              <p className="text-2xl font-extrabold text-emerald-700">{proposal.performance.directToHomeKwh} kWh</p>
              <p className="text-xs text-emerald-600">Immediate Daytime Usage</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1">
              <p className="text-xs font-bold text-slate-300">Stored in Battery</p>
              <p className="text-2xl font-extrabold text-amber-300">{proposal.performance.batteryToHomeKwh} kWh</p>
              <p className="text-xs text-slate-400">Evening Household Power</p>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-1">
              <p className="text-xs font-bold text-sky-800">Exported to Grid</p>
              <p className="text-2xl font-extrabold text-sky-700">{proposal.performance.exportToGridKwh} kWh</p>
              <p className="text-xs text-sky-600">Smart Export Guarantee (SEG)</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 14 — ENERGY BILL BEFORE & AFTER */}
        {/* ========================================================================= */}
        <section id="section-financials" className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Energy Bill Comparison: Before vs After</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <p className="text-xs font-bold text-rose-800 uppercase">Without Solar System</p>
              <p className="text-3xl font-extrabold text-rose-700">£{proposal.financials.annualBillBefore.toLocaleString()}</p>
              <p className="text-xs text-rose-600">Annual grid electricity expenditure</p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <p className="text-xs font-bold text-emerald-800 uppercase">With Solar & Storage</p>
              <p className="text-3xl font-extrabold text-emerald-700">£{proposal.financials.annualBillAfter.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">Net annual grid bill after export credits</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 15 — ENERGY BILL COMPARISON (25 YEARS) */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">25-Year Cumulative Financial Projections</h2>
              <p className="text-xs text-slate-500">Assuming {proposal.financials.inflationRatePercent}% compounded energy inflation</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              {[1, 5, 10, 25].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setBillComparisonYear(yr)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    billComparisonYear === yr ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Year {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Cumulative Savings By Year {billComparisonYear}</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                £{yearProjections[billComparisonYear - 1]?.cumSavings.toLocaleString()}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">Without Solar: £{yearProjections[billComparisonYear - 1]?.cumWithoutSolar.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">With Solar: £{yearProjections[billComparisonYear - 1]?.cumWithSolar.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 16 — PRINCIPAL & ANCILLARY PRODUCTS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Included System Components</h2>

          <div className="divide-y divide-slate-200">
            {productsState
              .filter((p) => p.category === "principal" || p.category === "ancillary")
              .map((p) => (
                <div key={p.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-slate-500">{p.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      Qty: {p.quantity}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 17 — SAVING SUMMARY */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">First-Year Financial Breakdown</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 uppercase font-semibold">Grid Savings</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">£{proposal.financials.gridSavings}</p>
              <p className="text-xs text-slate-500 mt-0.5">Reduced grid import</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-500 uppercase font-semibold">Export Income</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">£{proposal.financials.exportIncome}</p>
              <p className="text-xs text-slate-500 mt-0.5">SEG Export Tariff</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-600 text-white text-center shadow-md">
              <p className="text-xs text-emerald-100 uppercase font-semibold">Total Year 1 Savings</p>
              <p className="text-2xl font-extrabold text-white mt-1">£{proposal.financials.firstYearSavings}</p>
              <p className="text-xs text-emerald-100 mt-0.5">Combined Value</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 18 — RETURN ON INVESTMENT */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Return on Investment (ROI)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-1">
              <p className="text-xs text-slate-400 uppercase font-semibold">Year 1 ROI</p>
              <p className="text-3xl font-extrabold text-emerald-400">{proposal.financials.roiPercent}%</p>
              <p className="text-xs text-slate-400">Annual Return</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-xs text-slate-500 uppercase font-semibold">Break-Even Point</p>
              <p className="text-3xl font-extrabold text-slate-900">Year {proposal.financials.breakEvenYear}</p>
              <p className="text-xs text-slate-500">Payback Period</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-xs text-slate-500 uppercase font-semibold">25-Year Total Return</p>
              <p className="text-3xl font-extrabold text-emerald-600">£{proposal.financials.lifetime25YearSavings.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Estimated Net Benefit</p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 19 — FINANCIAL DISCLAIMER */}
        {/* ========================================================================= */}
        <section className="p-5 rounded-2xl bg-slate-100 text-slate-600 text-xs space-y-1">
          <p className="font-bold text-slate-800">Financial Assumptions Disclaimer</p>
          <p className="leading-relaxed">
            Financial returns and inflation figures are illustrative based on current UK retail electricity tariffs and historical inflation trends ({proposal.financials.inflationRatePercent}% per annum). Tariff rates and export tariffs are governed by energy suppliers.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 20 — OPTIONAL PRODUCTS / EXTRAS */}
        {/* ========================================================================= */}
        <section id="section-options" className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Optional System Upgrades</h2>
            <p className="text-xs text-slate-500">Select optional additions to customize your system</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {productsState
              .filter((p) => p.category === "optional")
              .map((p) => (
                <div
                  key={p.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    p.included ? "bg-emerald-50/50 border-emerald-500 shadow-sm" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <span className="text-sm font-extrabold text-slate-900">£{p.price}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                  </div>

                  <button
                    onClick={() => toggleProduct(p.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      p.included ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p.included ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Included in Quote</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4 text-emerald-600" />
                        <span>Add to Proposal (+£{p.price})</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 21 — ADD AN EV CHARGER? */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add an Electric Vehicle Charger?</h2>
                <p className="text-xs text-slate-500">Integrate 7kW smart EV charging powered directly by your solar panels</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productsState
              .filter((p) => p.category === "ev")
              .map((charger) => {
                const isSelected = selectedEvId === charger.id;
                return (
                  <div
                    key={charger.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected ? "bg-sky-50 border-sky-500 shadow-md ring-2 ring-sky-500/20" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{charger.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{charger.description}</p>
                      <p className="text-base font-extrabold text-slate-900 mt-2">£{charger.price}</p>
                    </div>

                    <button
                      onClick={() => handleEvSelect(charger.id)}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select (+£{charger.price})</span>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 22 — ADDITIONAL PRODUCTS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Additional System Hardware</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {productsState
              .filter((p) => p.category === "additional")
              .map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{p.name}</h3>
                    <p className="text-[11px] text-slate-500">{p.description}</p>
                  </div>
                  <button
                    onClick={() => toggleProduct(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      p.included ? "bg-emerald-600 text-white" : "bg-white border text-slate-700"
                    }`}
                  >
                    {p.included ? "Included" : `Add £${p.price}`}
                  </button>
                </div>
              ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 23 — NEXT STEPS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Your 5-Step Installation Timeline</h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: 1, title: "Survey & Design", desc: "Detailed technical site survey & DNO approval." },
              { step: 2, title: "Deposit & Schedule", desc: "Accept proposal & schedule installation date." },
              { step: 3, title: "Installation", desc: "1-day expert mounting & electrical wiring." },
              { step: 4, title: "Completion", desc: "Testing, commissioning & MCS certification." },
              { step: 5, title: "Aftercare", desc: "App monitoring setup & ongoing support." },
            ].map((st) => (
              <div key={st.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-xs mx-auto flex items-center justify-center">
                  {st.step}
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{st.title}</h3>
                <p className="text-[11px] text-slate-500 leading-tight">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 24 — PAYMENT SCHEDULE */}
        {/* ========================================================================= */}
        <section id="section-payment" className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Payment Schedule</h2>
            <p className="text-xs text-slate-500">Transparent payment milestones linked dynamically to system total</p>
          </div>

          <div className="divide-y divide-slate-200">
            {paymentMilestones.map((ms) => (
              <div key={ms.id || ms.label} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{ms.label}</h3>
                  <p className="text-xs text-slate-500">{ms.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900">£{ms.amount.toLocaleString()}</span>
                  <p className="text-xs text-emerald-600 font-semibold">{ms.percentage}% of Total</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 25 — FINAL PRICING */}
        {/* ========================================================================= */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">Final Proposal Investment Summary</h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Base Solar & Storage System</span>
              <span className="font-semibold text-white">£{pricing.baseSystemPrice.toLocaleString()}</span>
            </div>

            {pricing.evChargerPrice > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-800 text-sky-400">
                <span>Selected EV Charger</span>
                <span className="font-semibold">+£{pricing.evChargerPrice.toLocaleString()}</span>
              </div>
            )}

            {pricing.optionalProductsPrice > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-800 text-emerald-400">
                <span>Optional Upgrades</span>
                <span className="font-semibold">+£{pricing.optionalProductsPrice.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">VAT ({pricing.vatRatePercent}%)</span>
              <span className="font-semibold text-white">£{pricing.vatAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center pt-4 text-base sm:text-lg font-bold text-emerald-400">
              <span>Final Total Investment</span>
              <span className="text-3xl font-extrabold text-white">£{pricing.finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 26 — ACCEPTANCE */}
        {/* ========================================================================= */}
        <section id="section-acceptance" className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-lg space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-700 mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Accept Your Proposal Online</h2>
            <p className="text-xs text-slate-500">
              Review and confirm your agreement to proceed with your Madola Energy installation.
            </p>
          </div>

          {acceptanceStatus === "accepted" ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold text-emerald-900">Proposal Accepted!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you, <span className="font-semibold">{signerName}</span>. Your acceptance has been recorded. Our installation coordinator will contact you shortly to schedule your survey.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-800">
                Reference: {proposal.reference} | Total: £{pricing.finalTotal.toLocaleString()}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAcceptSubmit} className="max-w-xl mx-auto space-y-4 pt-2">
              {acceptanceError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {acceptanceError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="signerName">
                  Full Name (Signer)
                </label>
                <input
                  id="signerName"
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="signerEmail">
                  Email Address
                </label>
                <input
                  id="signerEmail"
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="notes">
                  Additional Installation Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. preferred installation days or access instructions..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                By clicking "Accept Proposal", you confirm acceptance of the quoted scope of work for £{pricing.finalTotal.toLocaleString()} subject to survey confirmation.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-sm font-bold rounded-2xl bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Recording Acceptance...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Accept Proposal (£{pricing.finalTotal.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* STICKY RIGHT SIDEBAR NAVIGATION PANEL */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-20 bg-white border border-slate-200 rounded-3xl p-5 shadow-lg space-y-5 text-slate-900 font-sans">
        {/* Header: Brand Logo + Proposal Reference */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[var(--brand-primary,#10b981)] fill-current" />
            <span className="font-extrabold text-xs tracking-wider text-slate-900">{branding.companyName || "MADOLA"}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proposal</p>
            <p className="text-xs font-extrabold text-slate-900">{proposal.reference || "2C1BFH47BMWY"}</p>
          </div>
        </div>

        {/* Navigation List Items */}
        <nav className="space-y-1 text-xs font-semibold text-slate-700">
          <a href="#section-cover" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Cover</span>
          </a>
          <a href="#section-why-us" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Why Choose Us?</span>
          </a>
          <a href="#section-intro" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Text</span>
          </a>
          <a href="#section-our-work" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Our Work</span>
          </a>
          <a href="#section-panel-layout" className="flex flex-col px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span className="font-extrabold text-slate-900">Panel layout</span>
            <span className="text-[10px] text-slate-400 font-normal">Proposed panel positions</span>
          </a>
          <a href="#section-whats-included" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>What's Included</span>
          </a>
          <a href="#section-ev-charger" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Add an EV?</span>
          </a>
          <a href="#section-options" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Extra products</span>
          </a>
          <a href="#section-notes" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Text</span>
          </a>
          <a href="#section-payment" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Payment schedule</span>
          </a>
          <a href="#section-financials" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Final price summary</span>
          </a>
          <a href="#section-acceptance" className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[var(--brand-primary,#10b981)] transition-colors">
            <span>Acceptance</span>
          </a>
        </nav>

        {/* Download PDF Pill Button */}
        <div className="pt-1">
          <button
            onClick={() => window.print()}
            className="w-full py-2.5 px-4 rounded-full bg-[var(--brand-button,#10b981)] text-[var(--brand-button-text,#ffffff)] hover:brightness-110 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Download PDF</span>
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dark Price Summary Box at Bottom */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TOTAL PRICE</p>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-white">
              £{pricing.finalTotal.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-400">NO VAT</span>
          </div>
          <div className="pt-2 border-t border-slate-800 space-y-1 text-[10px] font-medium text-slate-400">
            <a href="#section-payment" className="block hover:text-emerald-400 underline decoration-slate-700">
              Manage finance options
            </a>
            <a href="#section-payment" className="block hover:text-emerald-400 underline decoration-slate-700">
              Manage payment schedule
            </a>
          </div>
        </div>
      </aside>
    </div>
  </main>

      {/* Clean Footer */}
      <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-white">Madola Energy Proposal Studio</span>
          </div>
          <p>© {new Date().getFullYear()} Madola Energy Ltd. All rights reserved. MCS Accredited UK Installer.</p>
        </div>
      </footer>
    </div>
  );
}
