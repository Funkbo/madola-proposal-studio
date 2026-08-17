"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Product } from "@/types/product";
import { Package, Plus, CheckCircle, XCircle } from "lucide-react";

export interface ProductsListProps {
  initialProducts: Product[];
}

export function ProductsList({ initialProducts }: ProductsListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Products & Equipment</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solar PV panels, inverters, battery storage, and EV charger catalog stored in Supabase.
          </p>
        </div>
        <div>
          <Link href="/products/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main View */}
      {initialProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products in catalog yet."
          description="Add approved UK solar hardware, inverters, and battery storage units to your studio catalog."
          actionLabel="Add Product"
          onAction={() => {
            window.location.href = "/products/new";
          }}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model / Product</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description / Capacity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                  {product.model}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-300">{product.manufacturer}</TableCell>
                <TableCell>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                    {product.category.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                  {product.description || (product.capacity ? `${product.capacity} ${product.unit || ""}` : "N/A")}
                </TableCell>
                <TableCell>
                  {product.active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Active Catalog
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                      <XCircle className="w-3.5 h-3.5" /> Inactive
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
