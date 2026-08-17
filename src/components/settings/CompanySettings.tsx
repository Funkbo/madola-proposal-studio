import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CompanySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
        <CardDescription>
          Placeholder configuration for Madola Energy UK company branding, registration, and contact details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Company Name
          </label>
          <Input defaultValue="Madola Energy UK" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Support Email
          </label>
          <Input defaultValue="proposals@example.co.uk" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            UK Accreditation / MCS Number (Placeholder)
          </label>
          <Input defaultValue="MCS-UK-90210" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Currency
          </label>
          <Input defaultValue="GBP (£)" disabled />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-slate-500">
        <span>Settings persistence will be connected in future database phases.</span>
        <Button variant="secondary" size="sm" onClick={() => alert("Company settings save disabled in Day 1 MVP.")}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
