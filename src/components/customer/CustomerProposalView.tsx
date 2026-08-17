"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Zap,
  Battery,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  TreePine,
  TrendingUp,
  FileCheck,
  Check,
  Award,
  ChevronDown,
  Clock,
  MapPin,
  Mail,
  Phone,
  HelpCircle,
} from "lucide-react";

export interface CustomerProposalViewProps {
  proposalId: string;
}

export function CustomerProposalView({ proposalId }: CustomerProposalViewProps) {
  // State loaded from localStorage or mock proposal fallback
  const [proposalData, setProposalData] = useState({
    reference: "MAD-2026-00001",
    customerName: "Amanda Ratucoko",
    customerEmail: "amanda@example.co.uk",
    address: "14 Primrose Lane, London, SW1A 1AA",
    panelCount: 12,
    panelWattage: 450,
    systemSizeKw: "5.4",
    batteryCapacity: 9.4,
    inverterRating: 5.0,
    estimatedPrice: 8950,
    createdDate: "11 August 2026",
  });

  // Interactive CTA States
  const [isAccepted, setIsAccepted] = useState(false);
  const [isCallRequested, setIsCallRequested] = useState(false);

  // Load saved draft from localStorage on mount
  useEffect(() => {
    try {
      // Check current active draft or saved list
      const savedDraft = localStorage.getItem("madola_current_proposal");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setProposalData((prev) => ({
          ...prev,
          reference: parsed.reference || prev.reference,
          customerName: parsed.customerName || prev.customerName,
          customerEmail: parsed.customerEmail || prev.customerEmail,
          panelCount: Number(parsed.panelCount) || prev.panelCount,
          panelWattage: Number(parsed.panelWattage) || prev.panelWattage,
          systemSizeKw: parsed.systemSizeKw || ((Number(parsed.panelCount || 12) * Number(parsed.panelWattage || 450)) / 1000).toFixed(1),
          batteryCapacity: Number(parsed.batteryCapacity) || prev.batteryCapacity,
          inverterRating: Number(parsed.inverterRating) || prev.inverterRating,
          estimatedPrice: Number(parsed.estimatedPrice) || prev.estimatedPrice,
        }));
      }
    } catch (e) {
      console.error("Failed to load proposal from localStorage", e);
    }
  }, [proposalId]);

  const numSystemKw = parseFloat(proposalData.systemSizeKw);
  const annualGenerationKwh = Math.round(numSystemKw * 920);
  const annualSavingsGbp = Math.round(numSystemKw * 265);
  const paybackYears = (proposalData.estimatedPrice / annualSavingsGbp).toFixed(1);
  const twentyFiveYearBenefit = (annualSavingsGbp * 25).toLocaleString();
  const co2SavingsTonnes = (numSystemKw * 0.35).toFixed(1);
  const treesEquivalent = Math.round(numSystemKw * 15);

  const scrollToOverview = () => {
    const el = document.getElementById("system-overview");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-20">
      
      {/* 1. PUBLIC BRAND HEADER (NO ADMIN SIDEBAR/NAV) */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-slate-900 dark:text-slate-50 uppercase">
                MADOLA<span className="text-emerald-500">ENERGY</span>
              </span>
              <span className="text-[10px] text-slate-400 block tracking-widest font-semibold uppercase">
                Interactive Solar Proposals
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <span>Proposal Ref: <strong className="font-mono text-slate-700 dark:text-slate-300">{proposalData.reference}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>{proposalData.address}</span>
            </div>
          </div>

          <div>
            <a href="#investment">
              <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5">
                <span>View Investment</span>
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white pt-16 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
            <span>Personalised UK Solar Proposal • 0% VAT Residential Rate</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Your Bespoke <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{proposalData.systemSizeKw} kW</span> Solar & Storage Proposal
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Prepared exclusively for <strong className="text-white font-semibold">{proposalData.customerName}</strong>. This custom turnkey specification has been designed to maximize self-consumption and lower your grid energy dependence.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToOverview}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <span>Explore Your Proposal</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <a
              href="#investment"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700 text-center"
            >
              Skip to Pricing & Acceptance
            </a>
          </div>
        </div>
      </section>

      {/* 3. SYSTEM OVERVIEW CARDS */}
      <section id="system-overview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Solar Array */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Solar Array Capacity</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
                {proposalData.systemSizeKw} kWp
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                {proposalData.panelCount} × Tier-1 {proposalData.panelWattage}W Monocrystalline PV Panels
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Annual Output</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">~{annualGenerationKwh.toLocaleString()} kWh/yr</span>
            </div>
          </div>

          {/* Card 2: Battery Storage */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <Battery className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Battery Storage</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
                {proposalData.batteryCapacity} kWh
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                High-cycle LFP Battery Unit for evening & off-peak power storage
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Chemistry</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Lithium Iron Phosphate</span>
            </div>
          </div>

          {/* Card 3: Hybrid Inverter */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hybrid Inverter</span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
                {proposalData.inverterRating} kW
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Dual-MPPT Smart Hybrid Inverter with real-time mobile app monitoring
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>App Control</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FINANCIAL SUMMARY & SAVINGS ESTIMATOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Financial Return</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">Projected Savings & Payback</h2>
          <p className="text-sm text-slate-500 mt-2">
            Based on current UK domestic electricity tariffs and Smart Export Guarantee (SEG) rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">Est. Annual Savings</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">£{annualSavingsGbp.toLocaleString()}</p>
            <span className="text-[11px] text-slate-400 block">per year saved</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">25-Year Benefit</span>
            <p className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">£{twentyFiveYearBenefit}</p>
            <span className="text-[11px] text-slate-400 block">cumulative return</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">Est. System Payback</span>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{paybackYears} Yrs</p>
            <span className="text-[11px] text-slate-400 block">break-even timeline</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">UK VAT Rate</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">0% VAT</p>
            <span className="text-[11px] text-slate-400 block">government incentive</span>
          </div>
        </div>
      </section>

      {/* 5. SOLAR PERFORMANCE & SELF-CONSUMPTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Energy Independence</span>
              <h3 className="text-2xl font-bold text-white mt-1">Solar Performance Breakdown</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>78% Estimated Self-Consumption</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Direct Home Self-Consumption</span>
                <span className="font-semibold text-emerald-400 font-mono">78%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "78%" }} />
              </div>
              <p className="text-[11px] text-slate-400">Power used directly by your home appliances and battery storage.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Smart Export Guarantee (SEG)</span>
                <span className="font-semibold text-amber-400 font-mono">22%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: "22%" }} />
              </div>
              <p className="text-[11px] text-slate-400">Surplus energy exported back to the UK grid for SEG payments.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Grid Dependency Reduction</span>
                <span className="font-semibold text-blue-400 font-mono">75%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "75%" }} />
              </div>
              <p className="text-[11px] text-slate-400">Reduction in electricity purchased from your energy supplier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ENVIRONMENTAL IMPACT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 to-emerald-900 text-white shadow-xl border border-teal-800/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 uppercase tracking-widest">
                <TreePine className="w-4 h-4" />
                <span>Environmental Contribution</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Reduce Your Carbon Footprint</h3>
              <p className="text-sm text-teal-100">
                By generating clean renewable power, your solar array directly reduces fossil-fuel emissions across the UK electricity network.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-3xl font-black text-white font-mono">{co2SavingsTonnes}</span>
                <span className="text-xs text-teal-200 block mt-1">Tonnes CO₂ Saved/yr</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-3xl font-black text-white font-mono">{treesEquivalent}</span>
                <span className="text-xs text-teal-200 block mt-1">Trees Planted Equiv.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HARDWARE SPECIFICATIONS CATALOG CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Premium Hardware</span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">Included Equipment Specifications</h2>
          <p className="text-sm text-slate-500 mt-2">
            Tier-1 MCS-approved hardware with extended performance warranties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hardware Card 1: Solar Panels */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sun className="w-3.5 h-3.5" /> High-Efficiency PV Panels
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {proposalData.panelWattage}W Monocrystalline PV
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ultra-high efficiency monocrystalline cell technology with anti-reflective glass coating for maximum light absorption even on overcast UK days.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Warranty:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">25-Year Performance</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">MCS Approved:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Yes (MCS-012)</span>
              </div>
            </div>
          </div>

          {/* Hardware Card 2: Battery */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Battery className="w-3.5 h-3.5" /> Battery Storage
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {proposalData.batteryCapacity} kWh LFP Storage
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cobalt-free Lithium Iron Phosphate (LFP) chemistry designed for over 6,000 charge cycles and safe indoor or outdoor residential installation.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Warranty:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">10-Year Warranty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cycle Life:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">6000+ Cycles</span>
              </div>
            </div>
          </div>

          {/* Hardware Card 3: Hybrid Inverter */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" /> Hybrid Inverter
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {proposalData.inverterRating} kW Hybrid Inverter
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intelligent dual-MPPT hybrid inverter with built-in Wi-Fi monitoring, automated grid export management, and EPS emergency backup compatibility.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Warranty:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">10-Year Warranty</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">App Monitoring:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">iOS & Android</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. INSTALLATION & COMPLIANCE TIMELINE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">MCS Certified Installation Process</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Technical Survey & DNO</h4>
              <p className="text-xs text-slate-500">Full roof structural assessment & DNO grid application handled on your behalf.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">1-Day Roof & Electrical</h4>
              <p className="text-xs text-slate-500">Safe scaffolding setup, panel mounting, and electrical inverter wiring.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Commissioning & SEG</h4>
              <p className="text-xs text-slate-500">System testing, mobile app configuration, and MCS certificate issuance.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">25-Year Warranty Support</h4>
              <p className="text-xs text-slate-500">Ongoing system performance monitoring and UK customer aftercare support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. PROPOSAL INVESTMENT & CTAs */}
      <section id="investment" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-2xl border-2 border-emerald-500/30 text-center space-y-8">
          
          <div className="space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Turnkey Fixed Price</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Ready To Take The Next Step?</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Accept your bespoke proposal today to lock in your system pricing and schedule your technical survey.
            </p>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-md mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <span className="text-xs text-slate-300">Turnkey Fixed Price</span>
              <span className="text-3xl font-black text-white font-mono">£{proposalData.estimatedPrice.toLocaleString()}</span>
            </div>
            <ul className="text-xs text-slate-300 text-left space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{proposalData.panelCount} × {proposalData.panelWattage}W PV Panels ({proposalData.systemSizeKw} kW total)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{proposalData.batteryCapacity} kWh LFP Battery Storage + {proposalData.inverterRating} kW Inverter</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Complete MCS Certified Installation & DNO Registration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>0% VAT Zero Rated Scheme Applied</span>
              </li>
            </ul>
          </div>

          {/* Interactive Confirmation States */}
          {isAccepted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 max-w-md mx-auto space-y-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-lg text-white">Proposal Accepted!</h4>
              <p className="text-xs text-emerald-200">
                Thank you, {proposalData.customerName}. Your acceptance has been logged for proposal <strong>{proposalData.reference}</strong>. A Madola Energy specialist will contact you shortly to confirm your technical survey date.
              </p>
            </div>
          ) : isCallRequested ? (
            <div className="p-6 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-200 max-w-md mx-auto space-y-2 animate-in fade-in duration-300">
              <PhoneCall className="w-8 h-8 text-blue-400 mx-auto" />
              <h4 className="font-bold text-lg text-white">Call Requested!</h4>
              <p className="text-xs text-blue-200">
                We have received your callback request for <strong>{proposalData.customerName}</strong>. Our solar engineering team will call you at your earliest convenience.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button
                onClick={() => setIsAccepted(true)}
                className="w-full sm:w-1/2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Proposal</span>
              </button>

              <button
                onClick={() => setIsCallRequested(true)}
                className="w-full sm:w-1/2 px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Request a Call</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 10. PUBLIC CUSTOMER FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider block mb-1">
              Madola Energy Ltd
            </span>
            <p>Bespoke Interactive Solar Proposals • MCS Certified Installer • RECC Member</p>
          </div>

          <div className="flex items-center gap-6">
            <span>MCS Certified</span>
            <span>RECC Compliant</span>
            <span>0% VAT Residential</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
