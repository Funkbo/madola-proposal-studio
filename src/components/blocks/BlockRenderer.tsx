"use client";

import React from "react";
import { BlockProposal, ProposalBlock } from "@/types/block-proposal";
import { CoverBlockComponent } from "./CoverBlockComponent";
import { WhyChooseUsBlockComponent } from "./WhyChooseUsBlockComponent";
import { TextBlockComponent } from "./TextBlockComponent";
import { OurWorkBlockComponent } from "./OurWorkBlockComponent";
import { PanelLayoutBlockComponent } from "./PanelLayoutBlockComponent";
import { ProductHighlightsBlockComponent } from "./ProductHighlightsBlockComponent";
import { TechnicalDetailsBlockComponent } from "./TechnicalDetailsBlockComponent";
import { PerformanceEstimatesBlockComponent } from "./PerformanceEstimatesBlockComponent";
import { EnergyUsageBlockComponent } from "./EnergyUsageBlockComponent";
import { SelfConsumptionBlockComponent } from "./SelfConsumptionBlockComponent";
import { BeforeAfterSolarBlockComponent } from "./BeforeAfterSolarBlockComponent";
import { PricingBlockComponent } from "./PricingBlockComponent";
import { SavingsBlockComponent } from "./SavingsBlockComponent";
import { ReturnOnInvestmentBlockComponent } from "./ReturnOnInvestmentBlockComponent";
import { WhatsIncludedBlockComponent } from "./WhatsIncludedBlockComponent";
import { EvChargerBlockComponent } from "./EvChargerBlockComponent";
import { ExtraProductsBlockComponent } from "./ExtraProductsBlockComponent";
import { NextStepsBlockComponent } from "./NextStepsBlockComponent";
import { PaymentScheduleBlockComponent } from "./PaymentScheduleBlockComponent";
import { FinalPriceSummaryBlockComponent } from "./FinalPriceSummaryBlockComponent";
import { AcceptanceBlockComponent } from "./AcceptanceBlockComponent";

export interface BlockRendererProps {
  block: ProposalBlock;
  proposal: BlockProposal;
  isAdmin?: boolean;
  onToggleEvCharger?: (included: boolean) => void;
  onToggleExtraProduct?: (productId: string, included: boolean) => void;
  onAcceptProposal?: (signerName?: string, signerEmail?: string, notes?: string) => void;
  onRequestCall?: () => void;
}

export function BlockRenderer({
  block,
  proposal,
  isAdmin = false,
  onToggleEvCharger,
  onToggleExtraProduct,
  onAcceptProposal,
  onRequestCall,
}: BlockRendererProps) {
  if (!block.enabled && !isAdmin) return null;

  switch (block.type) {
    case "cover":
      return <CoverBlockComponent block={block} proposal={proposal} isAdmin={isAdmin} />;
    case "why_choose_us":
      return <WhyChooseUsBlockComponent block={block} proposal={proposal} isAdmin={isAdmin} />;
    case "text":
      return <TextBlockComponent block={block} />;
    case "our_work":
      return <OurWorkBlockComponent block={block} />;
    case "panel_layout":
      return <PanelLayoutBlockComponent block={block} proposal={proposal} isAdmin={isAdmin} />;
    case "product_highlights":
      return <ProductHighlightsBlockComponent block={block} proposal={proposal} />;
    case "technical_details":
      return <TechnicalDetailsBlockComponent block={block} proposal={proposal} />;
    case "performance_estimates":
      return <PerformanceEstimatesBlockComponent block={block} proposal={proposal} />;
    case "energy_usage":
      return <EnergyUsageBlockComponent block={block} proposal={proposal} />;
    case "self_consumption":
      return <SelfConsumptionBlockComponent block={block} proposal={proposal} />;
    case "before_after_solar":
      return <BeforeAfterSolarBlockComponent block={block} proposal={proposal} />;
    case "pricing":
      return <PricingBlockComponent block={block} proposal={proposal} />;
    case "savings":
      return <SavingsBlockComponent block={block} proposal={proposal} />;
    case "return_on_investment":
      return <ReturnOnInvestmentBlockComponent block={block} proposal={proposal} />;
    case "whats_included":
      return <WhatsIncludedBlockComponent block={block} proposal={proposal} />;
    case "ev_charger":
      return (
        <EvChargerBlockComponent
          block={block}
          proposal={proposal}
          onToggleEvCharger={onToggleEvCharger}
        />
      );
    case "extra_products":
      return (
        <ExtraProductsBlockComponent
          block={block}
          proposal={proposal}
          onToggleExtraProduct={onToggleExtraProduct}
        />
      );
    case "next_steps":
      return <NextStepsBlockComponent block={block} />;
    case "payment_schedule":
      return <PaymentScheduleBlockComponent block={block} proposal={proposal} />;
    case "final_price_summary":
      return <FinalPriceSummaryBlockComponent block={block} proposal={proposal} />;
    case "acceptance":
      return (
        <AcceptanceBlockComponent
          block={block}
          proposal={proposal}
          onAcceptProposal={onAcceptProposal}
          onRequestCall={onRequestCall}
        />
      );
    default:
      return (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Unknown block type: {block.type}
        </div>
      );
  }
}
