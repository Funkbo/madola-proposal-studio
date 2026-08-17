import React from "react";
import { CustomersList } from "@/components/customers/CustomersList";
import { getCustomers } from "@/lib/services/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return <CustomersList initialCustomers={customers} initialSearch={q || ""} />;
}
