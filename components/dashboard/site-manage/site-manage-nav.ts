import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  Mail,
  SlidersHorizontal,
} from "lucide-react";

export type SiteManageNavId =
  | "overview"
  | "forms"
  | "blog"
  | "domain"
  | "billing"
  | "settings";

export interface SiteManageNavItem {
  id: SiteManageNavId;
  label: string;
  href: (websiteId: string) => string;
  icon: LucideIcon;
  soon?: boolean;
}

export const SITE_MANAGE_NAV: SiteManageNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: (id) => `/dashboard/sites/${id}`,
    icon: LayoutDashboard,
  },
  {
    id: "forms",
    label: "Forms",
    href: (id) => `/dashboard/sites/${id}/forms`,
    icon: Mail,
  },
  {
    id: "blog",
    label: "Blog",
    href: (id) => `/dashboard/sites/${id}/blog`,
    icon: FileText,
    soon: true,
  },
  {
    id: "domain",
    label: "Domain",
    href: (id) => `/dashboard/sites/${id}/domain`,
    icon: Globe,
  },
  {
    id: "billing",
    label: "Plan & Billing",
    href: (id) => `/dashboard/sites/${id}/billing`,
    icon: CreditCard,
  },
  {
    id: "settings",
    label: "Settings",
    href: (id) => `/dashboard/sites/${id}/settings`,
    icon: SlidersHorizontal,
  },
];
