import { Product } from "@/types/product";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    model: "Smart Module 415W",
    manufacturer: "SolarEdge",
    category: "panel",
    description: "415W Monocrystalline, Integrated Optimizer",
    capacity: 415,
    unit: "W",
    active: true,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
  },
  {
    id: "prod-2",
    model: "All-in-One 13.5kWh",
    manufacturer: "GivEnergy",
    category: "battery",
    description: "13.5kWh LFP Storage, 6kW Peak Output",
    capacity: 13.5,
    unit: "kWh",
    active: true,
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01",
  },
];
