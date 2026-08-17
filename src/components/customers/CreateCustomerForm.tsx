"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCustomerAction } from "@/app/customers/actions";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreateCustomerForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCustomerAction(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Customers
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <UserPlus className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">New Customer Record</span>
          </div>
          <CardTitle>Add UK Customer</CardTitle>
          <CardDescription>
            Enter client contact details and installation address to store in Supabase PostgreSQL.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name *
                </label>
                <Input name="firstName" placeholder="e.g. Amanda" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name *
                </label>
                <Input name="lastName" placeholder="e.g. Ratucoko" required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <Input name="email" type="email" placeholder="amanda@example.co.uk" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <Input name="phone" placeholder="+44 7700 900077" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Address Line 1 *
              </label>
              <Input name="addressLine1" placeholder="e.g. 14 Primrose Lane" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Address Line 2 (Optional)
              </label>
              <Input name="addressLine2" placeholder="e.g. Flat 3B" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Town *
                </label>
                <Input name="city" placeholder="e.g. London" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Postcode *
                </label>
                <Input name="postcode" placeholder="e.g. SW1A 1AA" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Country
                </label>
                <Input name="country" defaultValue="United Kingdom" disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Link href="/customers">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? "Saving Customer..." : "Save Customer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
