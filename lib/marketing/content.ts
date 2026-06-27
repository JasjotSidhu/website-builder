export const marketingNavLinks = [
  { label: "Home", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "mailto:hello@webeix.com" },
] as const;

export const templateCategories = [
  "All",
  "Medical",
  "Real Estate",
  "Photography",
  "Life Coach",
  "Restaurant",
  "IT & SaaS",
  "Legal",
] as const;

export type TemplateCategory = (typeof templateCategories)[number];

export interface MarketingTemplate {
  name: string;
  category: Exclude<TemplateCategory, "All">;
  accent: string;
  tint: string;
}

export const marketingTemplates: MarketingTemplate[] = [
  { name: "Dental Clinic Modern", category: "Medical", accent: "#0EA5A4", tint: "#ecfbfa" },
  { name: "Realtor Modern", category: "Real Estate", accent: "#E0552B", tint: "#fdf0ea" },
  { name: "Photography Modern", category: "Photography", accent: "#7C6FF0", tint: "#f2f0fe" },
  { name: "IT Company Modern", category: "IT & SaaS", accent: "#2563EB", tint: "#eef3fe" },
  { name: "Spa & Salon Modern", category: "Restaurant", accent: "#B45309", tint: "#fbf3e8" },
  { name: "Law Firm Modern", category: "Legal", accent: "#334155", tint: "#eef1f5" },
  { name: "Life Coach Modern", category: "Life Coach", accent: "#059669", tint: "#eafaf3" },
  { name: "Wedding Planner", category: "Photography", accent: "#DB2777", tint: "#fdeef6" },
  { name: "Hospital Website", category: "Medical", accent: "#0284C7", tint: "#eaf5fd" },
  { name: "Real Estate Classic", category: "Real Estate", accent: "#C2410C", tint: "#fcf0e9" },
  { name: "Digital Marketing", category: "IT & SaaS", accent: "#6366F1", tint: "#eef0fe" },
  { name: "Courier Company", category: "Restaurant", accent: "#B91C1C", tint: "#fcecec" },
];

export const heroExamples = [
  "Modern dental clinic",
  "Real estate agency",
  "Photography portfolio",
] as const;

export type HeroVariant = "ai" | "category";

export const heroCategories = [
  { label: "Medical", icon: "plus" as const, tint: "#ecfbfa", accent: "#0EA5A4" },
  { label: "Real Estate", icon: "home" as const, tint: "#fdf0ea", accent: "#E0552B" },
  { label: "Photography", icon: "image" as const, tint: "#f2f0fe", accent: "#7C6FF0" },
  { label: "Restaurant", icon: "grid" as const, tint: "#fbf3e8", accent: "#B45309" },
  { label: "IT & SaaS", icon: "bolt" as const, tint: "#eef3fe", accent: "#2563EB" },
  { label: "Life Coach", icon: "users" as const, tint: "#eafaf3", accent: "#059669" },
  { label: "Legal", icon: "file" as const, tint: "#eef1f5", accent: "#334155" },
  { label: "Wellness", icon: "sparkles" as const, tint: "#eafaf3", accent: "#10B981" },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Describe it",
    body: "Tell Webeix what your business does in a sentence. Add a tone or style if you like.",
    icon: "sparkles" as const,
  },
  {
    step: "02",
    title: "Generate",
    body: "A complete multi-page website appears — structure, sections, copy and branding included.",
    icon: "zap" as const,
  },
  {
    step: "03",
    title: "Refine",
    body: "Edit anything inline, drag sections, swap images and colors. Publish when it feels right.",
    icon: "pencil" as const,
  },
];

export const howItWorksByVariant = {
  ai: {
    title: "From a sentence to a site,",
    titleEm: "then yours to refine.",
    steps: howItWorksSteps,
  },
  category: {
    title: "From template to published site,",
    titleEm: "in three simple steps.",
    steps: [
      {
        step: "01",
        title: "Choose a template",
        body: "Pick a professionally designed template made for your industry — already complete.",
        icon: "grid" as const,
      },
      {
        step: "02",
        title: "Customize it",
        body: "Swap colors, logo and fonts to match your brand. Rearrange sections with drag & drop.",
        icon: "brush" as const,
      },
      {
        step: "03",
        title: "Add content & publish",
        body: "Edit any text or image inline, then publish to your free Webeix address or custom domain.",
        icon: "pencil" as const,
      },
    ],
  },
} as const;

export const editPoints = [
  "Click-to-edit text, everywhere",
  "Drag & drop section reordering",
  "One-click brand colors, logo & fonts",
];

export const heroTemplates = [
  { name: "Dental Clinic Modern", category: "Medical", accent: "#0EA5A4", tint: "#0f2e2e" },
  { name: "Realtor Modern", category: "Real Estate", accent: "#F79433", tint: "#33260f" },
  { name: "Photography Modern", category: "Photography", accent: "#9b8cff", tint: "#221f3a" },
  { name: "IT Company Modern", category: "IT & SaaS", accent: "#4f8bf5", tint: "#15233a" },
];

export const planFeatures = [
  "Access to all website templates",
  "AI website generation",
  "50 pages (extendable)",
  "100 GB traffic / month",
  "Unlimited sections",
  "Real-time inline editing",
  "Drag & drop sections",
  "Custom branding (logo, colors, fonts)",
  "SEO-friendly structure",
];

export const addOns = [
  {
    name: "Website Setup Service",
    tag: "ONE-TIME",
    price: "$149",
    sub: "We build it for you",
    points: [
      "Up to 5 pages with your content",
      "Custom design (logo, colors, layout)",
      "Live in 48 hours",
      "Great for busy owners",
    ],
  },
  {
    name: "Ongoing Maintenance",
    tag: "MONTHLY",
    price: "$99",
    sub: "per month",
    points: [
      "Unlimited section edits",
      "Up to 10 new sections / month",
      "Design customization",
      "Priority call & email support",
    ],
  },
];

export const footerProductLinks = [
  { label: "AI generation", href: "/?signup=1" },
  { label: "Templates", href: "/templates" },
  { label: "Editor", href: "/?signup=1" },
  { label: "Pricing", href: "/#pricing" },
];

export const footerCategoryLinks = ["Medical", "Real Estate", "Life Coach", "IT & SaaS"];

export const footerCompanyLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "mailto:hello@webeix.com" },
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
];
