import React from "react";
import { AlertTriangle, Server, Key, Terminal } from "lucide-react";

export function ConfigErrorBanner() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-slate-100 shadow-xl">
      <div className="flex items-center gap-3 text-amber-400 mb-4">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <h2 className="text-xl font-bold">Supabase Configuration Required</h2>
      </div>
      <p className="text-sm text-slate-300 mb-4">
        Madola Proposal Studio is configured for <strong>Day 2 database-only operational mode</strong>. Live Supabase credentials are required to render real operational data.
      </p>
      <div className="space-y-3 text-xs bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono text-slate-200">
        <p className="font-semibold text-emerald-400 font-sans text-sm mb-1">
          Required Environment Variables (.env.local):
        </p>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400" />
          <span>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</span>
        </div>
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-400" />
          <span>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key</span>
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-amber-400" />
        <span>After updating <code>.env.local</code>, restart the Next.js dev server (<code>npm run dev</code>).</span>
      </div>
    </div>
  );
}
