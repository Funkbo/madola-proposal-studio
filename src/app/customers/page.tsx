import React from "react";
import { CustomersList } from "@/components/customers/CustomersList";
import { getCustomers } from "@/lib/services/customers";
import { getProposals } from "@/lib/services/proposals";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  // Latest proposal status per customer (customers only display details + status).
  // Bounded + resilient: a proposals query failure must never break the customers page.
  let statusByCustomerId = new Map<string, string>();
  try {
    const proposals = await getProposals(500);
    statusByCustomerId = new Map<string, string>();
    for (const p of proposals) {
      if (p.customerId && !statusByCustomerId.has(p.customerId)) {
        statusByCustomerId.set(p.customerId, p.status);
      }
    }
  } catch (e) {
    console.warn("Customers page: failed to load proposal statuses", e);
  }

  const statuses = customers.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = statusByCustomerId.get(c.id) || "no_proposal";
    return acc;
  }, {});

  return <CustomersList initialCustomers={customers} initialSearch={q || ""} initialStatuses={statuses} />;
}
