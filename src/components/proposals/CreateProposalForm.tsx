"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "@/types/customer";
import { ProposalTemplate } from "@/types/template";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProposalAction } from "@/app/proposals/actions";
import {
  FileText,
  ArrowLeft,
  Plus,
  Sun,
  Zap,
  Battery,
  Save,
  Eye,
  Check,
  ShieldCheck,
  X,
  Sparkles,
  User,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface CreateProposalFormProps {
  customers: Customer[];
  templates: ProposalTemplate[];
}

export function CreateProposalForm({ customers, templates }: CreateProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerNameInput, setCustomerNameInput] = useState<string>("Amanda Ratucoko");
  const [customerEmailInput, setCustomerEmailInput] = useState<string>("amanda@example.co.uk");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  // Solar Spec Calculation Inputs
  const [panelCount, setPanelCount] = useState<number>(12);
  const [panelWattage, setPanelWattage] = useState<number>(450);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(9.4);
  const [inverterRating, setInverterRating] = useState<number>(5.0);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(8950);

  // Computed System Capacity (kW)
  const systemSizeKw = ((panelCount * panelWattage) / 1000).toFixed(1);

  // Restore saved draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("madola_current_proposal");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.panelCount !== undefined) setPanelCount(Number(parsed.panelCount));
        if (parsed.panelWattage !== undefined) setPanelWattage(Number(parsed.panelWattage));
        if (parsed.batteryCapacity !== undefined) setBatteryCapacity(Number(parsed.batteryCapacity));
        if (parsed.inverterRating !== undefined) setInverterRating(Number(parsed.inverterRating));
        if (parsed.estimatedPrice !== undefined) setEstimatedPrice(Number(parsed.estimatedPrice));
        if (parsed.customerName) setCustomerNameInput(parsed.customerName);
        if (parsed.customerEmail) setCustomerEmailInput(parsed.customerEmail);
        if (parsed.customerId) setSelectedCustomerId(parsed.customerId);
      }
    } catch (e) {
      console.error("Failed to load saved draft from localStorage", e);
    }
  }, []);

  // Sync customer selection details
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerNameInput(`${found.firstName} ${found.lastName}`);
      setCustomerEmailInput(found.email);
    }
  };

  // Save Proposal to localStorage
  const handleSaveToLocalStorage = () => {
    try {
      const proposalPayload = {
        id: "draft-latest",
        reference: "MAD-2026-00001",
        customerId: selectedCustomerId,
        customerName: customerNameInput,
        customerEmail: customerEmailInput,
        panelCount,
        panelWattage,
        systemSizeKw,
        batteryCapacity,
        inverterRating,
        estimatedPrice,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("madola_current_proposal", JSON.stringify(proposalPayload));
      
      const existingList = localStorage.getItem("madola_saved_proposals_list");
      const list = existingList ? JSON.parse(existingList) : [];
      const updatedList = [proposalPayload, ...list.filter((p: any) => p.reference !== proposalPayload.reference)];
      localStorage.setItem("madola_saved_proposals_list", JSON.stringify(updatedList));

      setSaveSuccessMsg(`Proposal ${proposalPayload.reference} saved to localStorage!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      return proposalPayload;
    } catch (err) {
      console.error("Error saving proposal to localStorage:", err);
      return null;
    }
  };

  // Launch standalone customer-facing route /p/[proposalId]
  const handleLaunchCustomerPage = () => {
    const saved = handleSaveToLocalStorage();
    const ref = saved?.reference || "MAD-2026-00001";
    window.open(`/p/${ref}`, "_blank");
  };

  // Server Action Database Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    handleSaveToLocalStorage();

    const formData = new FormData(e.currentTarget);
    const res = await createProposalAction(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/proposals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Proposals
            </Button>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-500 hidden sm:block">
            Proposal Configurator Studio
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleSaveToLocalStorage} type="button">
            <Save className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            Save Draft
          </Button>
          <Button variant="primary" size="sm" onClick={handleLaunchCustomerPage} type="button">
            <ExternalLink className="w-4 h-4 mr-1.5" />
            Preview Customer Proposal
          </Button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Persisted in localStorage</span>
        </div>
      )}

      {/* Two-Column Grid: Configurator Form (Left) & Live Draft Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Configurator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                <FileText className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">System Configurator</span>
              </div>
              <CardTitle className="text-xl">Build Solar System Proposal</CardTitle>
              <CardDescription>
                Configure hardware specs and pricing. The live calculations update dynamically in real time.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                {errorMsg && (
                  <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Section 1: Customer & Template */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Customer & Layout Template</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Target UK Customer *
                    </label>
                    {customers.length === 0 ? (
                      <div className="space-y-3">
                        <Input
                          name="customerName"
                          value={customerNameInput}
                          onChange={(e) => setCustomerNameInput(e.target.value)}
                          placeholder="Customer Full Name"
                          required
                        />
                        <Input
                          name="customerEmail"
                          value={customerEmailInput}
                          onChange={(e) => setCustomerEmailInput(e.target.value)}
                          placeholder="Customer Email Address"
                          type="email"
                          required
                        />
                      </div>
                    ) : (
                      <select
                        name="customerId"
                        value={selectedCustomerId}
                        onChange={handleCustomerChange}
                        className="w-full rounded-lg border border-emerald-500/40 dark:border-emerald-500/30 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                      >
                        <option value="">⚡ Auto-Extract & Match Customer from PDF (Default)</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.lastName} ({c.postcode}) - {c.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Proposal Template Layout
                    </label>
                    <select
                      name="templateId"
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="">UK Residential Solar + Storage (Standard)</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 2: PV Array Hardware & Calculations */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>PV Array & Power Calculations</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Number of PV Panels *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={panelCount}
                        onChange={(e) => setPanelCount(Math.max(1, parseInt(e.target.value) || 0))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Panel Rating (Watts) *
                      </label>
                      <Input
                        type="number"
                        step="5"
                        min="100"
                        max="800"
                        value={panelWattage}
                        onChange={(e) => setPanelWattage(Math.max(100, parseInt(e.target.value) || 0))}
                        required
                      />
                    </div>
                  </div>

                  {/* Calculated Peak Capacity Display Box */}
                  <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
                        Calculated System Size
                      </span>
                      <p className="text-xs text-slate-500">
                        {panelCount} panels × {panelWattage}W
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {systemSizeKw} kW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Storage & Inverter Specs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800">
                    <Battery className="w-4 h-4 text-blue-500" />
                    <span>Battery & Electrical Inverter</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Battery Storage (kWh)
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        value={batteryCapacity}
                        onChange={(e) => setBatteryCapacity(parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Inverter Rating (kW)
                      </label>
                      <Input
                        type="number"
                        step="0.5"
                        value={inverterRating}
                        onChange={(e) => setInverterRating(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Turnkey Proposal Investment (£)
                    </label>
                    <Input
                      type="number"
                      step="50"
                      value={estimatedPrice}
                      onChange={(e) => setEstimatedPrice(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
                <Button variant="outline" size="md" onClick={handleSaveToLocalStorage} type="button">
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Draft
                </Button>

                <Button variant="primary" size="md" type="submit" disabled={loading}>
                  {loading ? "Saving Record..." : "Save Proposal Record"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Builder Draft Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-24 border-2 border-slate-300 dark:border-slate-700 shadow-md">
            {/* Explicit Preview Header */}
            <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Configurator Draft Preview
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  Live Builder Draft
                </span>
              </div>
              <CardTitle className="text-lg text-white mt-2">
                {systemSizeKw} kW System Summary
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs">
                Real-time draft overview for {customerNameInput || "Selected Customer"}.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Primary Action Button - Opens /p/[proposalId] */}
              <Button
                variant="primary"
                size="md"
                className="w-full shadow-sm"
                onClick={handleLaunchCustomerPage}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Customer Proposal
              </Button>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200">
                <span>Click </span>
                <strong className="underline cursor-pointer" onClick={handleLaunchCustomerPage}>
                  Preview Customer Proposal
                </strong>
                <span> to open the standalone customer portal view at </span>
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-amber-500/20">/p/MAD-2026-00001</code>.
              </div>

              {/* Dynamic Calculation Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold block flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" /> Total Solar Power
                  </span>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-200 mt-1 font-mono">
                    {systemSizeKw} kW
                  </p>
                  <span className="text-[10px] text-slate-500">({panelCount} × {panelWattage}W)</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold block flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" /> Battery Storage
                  </span>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-200 mt-1 font-mono">
                    {batteryCapacity} kWh
                  </p>
                  <span className="text-[10px] text-slate-500">Storage Capacity</span>
                </div>
              </div>

              {/* Specs Summary List */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Panel Model:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {panelWattage}W Monocrystalline PV
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Inverter Capacity:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {inverterRating} kW Hybrid Inverter
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Est. Annual Generation:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    ~{(parseFloat(systemSizeKw) * 920).toFixed(0)} kWh / year
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Turnkey Proposal Price:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                    £{estimatedPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 dark:bg-slate-900/60 rounded-b-xl border-t border-slate-200 dark:border-slate-800 pt-3 pb-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleLaunchCustomerPage}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Launch Full Customer Presentation (/p/MAD-2026-00001)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
