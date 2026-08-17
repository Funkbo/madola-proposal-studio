import { Customer } from "@/types/customer";

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    firstName: "Amanda",
    lastName: "Ratucoko",
    email: "amanda.r@example.co.uk",
    phone: "+44 7700 900077",
    addressLine1: "14 Primrose Lane",
    city: "London",
    postcode: "SW1A 1AA",
    country: "United Kingdom",
    createdBy: "user-1",
    proposalsCount: 1,
    createdAt: "2026-08-08",
    updatedAt: "2026-08-08",
  },
  {
    id: "cust-2",
    firstName: "James",
    lastName: "Harrison",
    email: "j.harrison@example.co.uk",
    phone: "+44 7700 900142",
    addressLine1: "88 Deansgate",
    city: "Manchester",
    postcode: "M1 1AE",
    country: "United Kingdom",
    createdBy: "user-1",
    proposalsCount: 2,
    createdAt: "2026-08-07",
    updatedAt: "2026-08-07",
  },
];
