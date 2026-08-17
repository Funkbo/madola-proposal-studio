"use client";

import React from "react";
import { ProposalBlock } from "@/types/block-proposal";
import { FileText, CheckCircle2 } from "lucide-react";

export interface BlockComponentProps {
  block: ProposalBlock;
}

export function TextBlockComponent({ block }: BlockComponentProps) {
  const { heading, bodyText, bulletPoints } = block.data || {};

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      {heading && (
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" />
          <span>{heading}</span>
        </h3>
      )}

      {bodyText && (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {bodyText}
        </p>
      )}

      {bulletPoints && bulletPoints.length > 0 && (
        <ul className="space-y-3 pt-2">
          {bulletPoints.map((point: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
