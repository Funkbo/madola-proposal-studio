export interface NavItem {
  name: string;
  href: string;
  iconName: "LayoutDashboard" | "FileText" | "Users" | "Package" | "LayoutTemplate" | "Settings";
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
  { name: "Proposals", href: "/proposals", iconName: "FileText" },
  { name: "Customers", href: "/customers", iconName: "Users" },
  { name: "Products", href: "/products", iconName: "Package" },
  { name: "Templates", href: "/templates", iconName: "LayoutTemplate" },
  { name: "Settings", href: "/settings", iconName: "Settings" },
];

export const COMPANY_INFO = {
  name: "Madola Proposal Studio",
  subtitle: "UK Solar Engineering Platform",
  region: "UK Operations",
  version: "v0.1.0 MVP (Day 1)",
};
