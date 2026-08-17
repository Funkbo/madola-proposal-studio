"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Customer } from "@/types/customer";
import { deleteCustomer, updateCustomer } from "@/lib/repositories/customerRepository";
import { Users, Plus, Mail, Phone, MapPin, Search, Filter, Trash2, Edit, Save, X, AlertTriangle } from "lucide-react";

export interface CustomersListProps {
  initialCustomers: Customer[];
  initialSearch?: string;
}

export function CustomersList({ initialCustomers, initialSearch = "" }: CustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Deletion state
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.postcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(customerToDelete.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
    } catch (err) {
      console.error("Failed to delete customer", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSaving(true);

    try {
      const { customer: updated } = await updateCustomer(editingCustomer.id, editingCustomer);
      if (updated) {
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
      setEditingCustomer(null);
    } catch (err) {
      console.error("Failed to update customer", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Customers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directory of UK solar clients and prospective leads stored in Supabase.
          </p>
        </div>
        <div>
          <Link href="/customers/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search name, email, postcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredCustomers.length} customer(s)</span>
        </div>
      </div>

      {/* Main View */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers found in database."
          description="Add your first UK solar customer to populate the database records."
          actionLabel="Add Customer"
          onAction={() => {
            window.location.href = "/customers/new";
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Contact Information</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => (
                  <TableRow key={cust.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${cust.id}`}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        <span>{cust.firstName} {cust.lastName}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cust.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cust.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-xs font-bold">{cust.postcode}</span>
                      </div>
                      <div className="text-xs text-slate-500">{cust.addressLine1}, {cust.city}</div>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCustomer({ ...cust })}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <Link href={`/proposals/new?customerId=${cust.id}`}>
                        <Button variant="outline" size="sm">
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Proposal
                        </Button>
                      </Link>

                      <button
                        onClick={() => setCustomerToDelete(cust)}
                        className="p-2.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View (Eliminates horizontal scrolling on 375px) */}
          <div className="block sm:hidden space-y-3">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="madola-card p-4 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <Link
                    href={`/customers/${cust.id}`}
                    className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {cust.firstName} {cust.lastName}
                  </Link>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {cust.postcode}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  {cust.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.addressLine1}, {cust.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setEditingCustomer({ ...cust })}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <Link href={`/proposals/new?customerId=${cust.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full min-h-[44px]">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Proposal
                    </Button>
                  </Link>

                  <button
                    onClick={() => setCustomerToDelete(cust)}
                    className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 min-h-[44px] min-w-[44px] flex items-center justify-center border border-rose-200 dark:border-rose-900"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-modal-enter">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Delete Customer Record?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete customer <strong>"{customerToDelete.firstName} {customerToDelete.lastName}"</strong> ({customerToDelete.email}) from the database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Customer"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-white">Edit Customer Information</h3>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.firstName || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.lastName || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingCustomer.email || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingCustomer.phone || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editingCustomer.addressLine1 || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, addressLine1: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={editingCustomer.city || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editingCustomer.postcode || ""}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, postcode: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1.5" />
                  <span>{isSaving ? "Saving..." : "Save Customer Changes"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
