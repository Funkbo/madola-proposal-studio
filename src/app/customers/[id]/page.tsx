import React from "react";
import { getCustomerById } from "@/lib/repositories/customerRepository";
import { getProposalsByCustomerId } from "@/lib/services/proposals";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatUKDate } from "@/lib/utils";
import { User, Mail, Phone, MapPin, ArrowLeft, Plus, FileText, Calendar, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const proposals = await getProposalsByCustomerId(customer.id);
  const latestStatus = proposals.length > 0 ? proposals[0].status : "No proposals";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Customers</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/proposals/new?customerId=${customer.id}`}>
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Create Proposal for Customer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Customer Info Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {customer.firstName} {customer.lastName}
                </CardTitle>
                <CardDescription>
                  Registered UK Solar Customer Record
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block uppercase font-semibold">Latest Status</span>
              <div className="mt-1">
                {proposals.length > 0 ? (
                  <Badge status={proposals[0].status} />
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    No proposals
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{customer.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{customer.phone || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address
              </span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {customer.addressLine1}, {customer.city}
              </p>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{customer.postcode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Proposals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Customer Proposals ({proposals.length})</CardTitle>
              <CardDescription>All interactive solar proposals generated for this customer</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No proposals created yet.</p>
              <Link href={`/proposals/new?customerId=${customer.id}`}>
                <Button variant="primary" size="sm">
                  Create First Proposal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {proposals.map((p) => (
                <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{p.reference}</span>
                      <Badge status={p.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Created: {formatUKDate(p.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/proposals/${p.id}`}>
                      <Button variant="outline" size="sm">
                        Manage Proposal
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
