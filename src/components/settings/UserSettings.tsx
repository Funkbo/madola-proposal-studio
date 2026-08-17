import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function UserSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile & Preferences</CardTitle>
        <CardDescription>
          Placeholder preferences for staff accounts and operational roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Full Name
          </label>
          <Input defaultValue="Madola Staff Member" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Role
          </label>
          <Input defaultValue="Lead Solar Technical Estimator" disabled />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notification Channel
          </label>
          <Input defaultValue="In-App & Email Digest" disabled />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-slate-500">
        <span>User profiles will be integrated when Supabase Auth is enabled.</span>
        <Button variant="secondary" size="sm" onClick={() => alert("User preferences save disabled in Day 1 MVP.")}>
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}
