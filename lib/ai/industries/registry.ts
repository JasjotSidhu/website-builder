import { medicalIndustry } from "@/lib/ai/industries/medical";
import type {
  AiIndustryDefinition,
  AiIndustryPageDefinition,
  AiPageOption,
} from "@/lib/ai/industries/types";
import { toPageOptions } from "@/lib/ai/industries/types";

import type { AiIndustryId } from "@/lib/ai/industries/types";

/** Industries with full page + generation definitions */
const DEFINED_INDUSTRIES: Partial<Record<AiIndustryId, AiIndustryDefinition>> = {
  medical: medicalIndustry,
};

/** Lightweight page lists for industries not yet fully defined */
function basicPages(extra: AiPageOption[] = []): AiPageOption[] {
  return [
    { id: "home", label: "Home", required: true },
    { id: "about", label: "About Us" },
    { id: "services", label: "Services" },
    ...extra,
    { id: "contact", label: "Contact" },
  ];
}

interface LegacyIndustryEntry {
  id: AiIndustryId;
  label: string;
  pages: AiPageOption[];
  recommendedPageIds: string[];
}

/** Placeholder configs until each industry gets a dedicated file like medical.ts */
const LEGACY_INDUSTRIES: LegacyIndustryEntry[] = [
  {
    id: "real-estate",
    label: "Real Estate",
    pages: basicPages([
      { id: "listings", label: "Listings" },
      { id: "agents", label: "Our Agents" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
      { id: "blog", label: "Blog" },
    ]),
    recommendedPageIds: ["home", "about", "listings", "contact"],
  },
  {
    id: "spa-salon",
    label: "Spa & Salon",
    pages: basicPages([
      { id: "pricing", label: "Pricing" },
      { id: "gallery", label: "Gallery" },
      { id: "team", label: "Our Team" },
      { id: "book", label: "Book Online" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "photography",
    label: "Photography",
    pages: basicPages([
      { id: "portfolio", label: "Portfolio" },
      { id: "pricing", label: "Pricing" },
      { id: "blog", label: "Blog" },
      { id: "testimonials", label: "Testimonials" },
    ]),
    recommendedPageIds: ["home", "about", "portfolio", "contact"],
  },
  {
    id: "wedding-planner",
    label: "Wedding Planner",
    pages: basicPages([
      { id: "gallery", label: "Gallery" },
      { id: "packages", label: "Packages" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "it",
    label: "Information Technology",
    pages: basicPages([
      { id: "solutions", label: "Solutions" },
      { id: "case-studies", label: "Case Studies" },
      { id: "blog", label: "Blog" },
      { id: "careers", label: "Careers" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "logistics",
    label: "Logistics",
    pages: basicPages([
      { id: "tracking", label: "Track Shipment" },
      { id: "coverage", label: "Coverage Areas" },
      { id: "faq", label: "FAQ" },
      { id: "quote", label: "Get a Quote" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "life-coach",
    label: "Life Coach",
    pages: basicPages([
      { id: "testimonials", label: "Testimonials" },
      { id: "blog", label: "Blog" },
      { id: "booking", label: "Book a Session" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "ngo",
    label: "NGO",
    pages: basicPages([
      { id: "mission", label: "Our Mission" },
      { id: "programs", label: "Programs" },
      { id: "donate", label: "Donate" },
      { id: "blog", label: "News" },
      { id: "volunteer", label: "Volunteer" },
    ]),
    recommendedPageIds: ["home", "about", "programs", "contact"],
  },
  {
    id: "marketing",
    label: "Marketing",
    pages: basicPages([
      { id: "case-studies", label: "Case Studies" },
      { id: "pricing", label: "Pricing" },
      { id: "blog", label: "Blog" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
  {
    id: "law",
    label: "Law",
    pages: basicPages([
      { id: "practice-areas", label: "Practice Areas" },
      { id: "team", label: "Our Team" },
      { id: "consultation", label: "Free Consultation" },
      { id: "faq", label: "FAQ" },
      { id: "blog", label: "Legal Blog" },
    ]),
    recommendedPageIds: ["home", "about", "practice-areas", "contact"],
  },
  {
    id: "travel",
    label: "Travel",
    pages: basicPages([
      { id: "destinations", label: "Destinations" },
      { id: "packages", label: "Packages" },
      { id: "blog", label: "Travel Blog" },
      { id: "testimonials", label: "Testimonials" },
      { id: "faq", label: "FAQ" },
    ]),
    recommendedPageIds: ["home", "about", "destinations", "contact"],
  },
  {
    id: "others",
    label: "Others",
    pages: [
      { id: "home", label: "Home", required: true },
      { id: "about", label: "About Us" },
      { id: "services", label: "Services" },
      { id: "contact", label: "Contact" },
    ],
    recommendedPageIds: ["home", "about", "services", "contact"],
  },
];

function legacyToDefinition(entry: LegacyIndustryEntry): AiIndustryDefinition {
  return {
    id: entry.id,
    label: entry.label,
    recommendedPageIds: entry.recommendedPageIds,
    generationReady: false,
    pages: entry.pages.map((page) => ({
      id: page.id,
      label: page.label,
      slug: page.id === "home" ? "/" : `/${page.id}`,
      required: page.required,
      purpose: `${page.label} page for a ${entry.label.toLowerCase()} website.`,
      suggestedSections: [],
    })),
  };
}

const ALL_INDUSTRIES: AiIndustryDefinition[] = [
  medicalIndustry,
  ...LEGACY_INDUSTRIES.map(legacyToDefinition),
];

export function getIndustryDefinition(id: AiIndustryId | null | undefined): AiIndustryDefinition {
  return ALL_INDUSTRIES.find((entry) => entry.id === id) ?? ALL_INDUSTRIES[ALL_INDUSTRIES.length - 1]!;
}

/** @deprecated Use getIndustryDefinition */
export function getIndustryConfig(id: AiIndustryId | null | undefined) {
  const industry = getIndustryDefinition(id);
  return {
    id: industry.id,
    label: industry.label,
    pages: toPageOptions(industry.pages),
    recommendedPageIds: industry.recommendedPageIds,
  };
}

export function getIndustryPageOptions(id: AiIndustryId | null | undefined): AiPageOption[] {
  return toPageOptions(getIndustryDefinition(id).pages);
}

export function resolveIndustryPages(
  industryId: AiIndustryId,
  selectedPageIds: string[],
): AiIndustryPageDefinition[] {
  const industry = getIndustryDefinition(industryId);
  const selected = new Set(selectedPageIds);
  return industry.pages.filter((page) => selected.has(page.id));
}

export function listIndustryIds(): AiIndustryId[] {
  return ALL_INDUSTRIES.map((entry) => entry.id);
}

export { DEFINED_INDUSTRIES, medicalIndustry };
