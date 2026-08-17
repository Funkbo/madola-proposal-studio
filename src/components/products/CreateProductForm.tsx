"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProductAction } from "@/app/products/actions";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CreateProductForm() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createProductAction(formData);

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Package className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">New Hardware Product</span>
          </div>
          <CardTitle>Add Hardware Item</CardTitle>
          <CardDescription>
            Add solar panels, inverters, or battery storage items to your studio catalog in Supabase.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Product Category *
              </label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="panel">Solar Panel</option>
                <option value="inverter">Inverter</option>
                <option value="battery">Battery Storage</option>
                <option value="ev_charger">EV Charger</option>
                <option value="other">Other Component</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturer *
                </label>
                <Input name="manufacturer" placeholder="e.g. GivEnergy" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Model Name *
                </label>
                <Input name="model" placeholder="e.g. All-in-One 13.5kWh" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <Input name="description" placeholder="e.g. 13.5kWh LFP Storage with 6kW peak discharge" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Capacity (Numeric)
                </label>
                <Input name="capacity" type="number" step="0.1" placeholder="e.g. 13.5" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit
                </label>
                <Input name="unit" placeholder="e.g. kWh or W" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Link href="/products">
              <Button variant="outline" size="md">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="md" type="submit" disabled={loading}>
              {loading ? "Saving Product..." : "Save Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
