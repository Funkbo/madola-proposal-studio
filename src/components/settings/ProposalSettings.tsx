import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProposalSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Defaults & Rules</CardTitle>
        <CardDescription>
          Placeholder defaults for UK solar calculations, VAT rates (0% solar install), and proposal expiry windows.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Proposal Validity (Days)
          </label>
          <Input defaultValue="30 Days" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            UK Residential Solar VAT Rate
          </label>
          <Input defaultValue="0% (UK Energy Saving Material relief)" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Smart Export Guarantee (SEG) Export Rate
          </label>
          <Input defaultValue="15.0 p/kWh" disabled />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-slate-500">
        <span>Proposal calculation engines will be configured in subsequent sprints.</span>
        <Button variant="secondary" size="sm" onClick={() => alert("Proposal defaults save disabled in Day 1 MVP.")}>
          Save Rules
        </Button>
      </CardFooter>
    </Card>
  );
}
