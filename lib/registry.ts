import type { ComponentType } from "react";
import type { z } from "zod";
import HeaderSimple, { headerSimpleSchema } from "@/components/sections/header/HeaderSimple";
import HeroCentered, { heroCenteredSchema } from "@/components/sections/hero/HeroCentered";
import HeroSplit, { heroSplitSchema } from "@/components/sections/hero/HeroSplit";
import FeaturesGrid3, { featuresGrid3Schema } from "@/components/sections/features/FeaturesGrid3";
import FeaturesAlternating, {
  featuresAlternatingSchema,
} from "@/components/sections/features/FeaturesAlternating";
import TestimonialsGrid, {
  testimonialsGridSchema,
} from "@/components/sections/testimonials/TestimonialsGrid";
import CtaBanner, { ctaBannerSchema } from "@/components/sections/cta/CtaBanner";
import FooterSimple, { footerSimpleSchema } from "@/components/sections/footer/FooterSimple";

export interface SectionVariant {
  id: string;
  label: string;
  component: ComponentType<Record<string, unknown>>;
  propsSchema: z.ZodSchema;
  traits: string[];
  settingsDefaults?: Record<string, unknown>;
  defaultProps: Record<string, unknown>;
}

export interface SectionDefinition {
  type: string;
  label: string;
  category: "header" | "hero" | "content" | "social-proof" | "cta" | "footer";
  variants: SectionVariant[];
}

const defaultButton = {
  label: "Get started",
  link: { type: "page", pageId: "home" },
  variant: "primary",
};

export const sectionRegistry: Record<string, SectionDefinition> = {
  header: {
    type: "header",
    label: "Header",
    category: "header",
    variants: [
      {
        id: "header-simple",
        label: "Simple header",
        component: HeaderSimple as ComponentType<Record<string, unknown>>,
        propsSchema: headerSimpleSchema,
        traits: ["background", "textColor"],
        settingsDefaults: { type: "solid", color: "var(--color-background)" },
        defaultProps: {
          logo: { type: "text", value: "Brand" },
          links: [{ label: "Home", href: "/" }],
        },
      },
    ],
  },
  hero: {
    type: "hero",
    label: "Hero",
    category: "hero",
    variants: [
      {
        id: "hero-centered",
        label: "Centered hero",
        component: HeroCentered as ComponentType<Record<string, unknown>>,
        propsSchema: heroCenteredSchema,
        traits: ["background", "textColor", "spacing"],
        settingsDefaults: { type: "solid", color: "var(--color-background)" },
        defaultProps: {
          heading: "Welcome",
          subheading: "Your subheading here",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=960&h=540&fit=crop",
          imageAlt: "Hero image",
          buttons: [defaultButton],
        },
      },
      {
        id: "hero-split",
        label: "Split hero",
        component: HeroSplit as ComponentType<Record<string, unknown>>,
        propsSchema: heroSplitSchema,
        traits: ["background", "textColor", "spacing", "reversible"],
        settingsDefaults: { type: "solid", color: "var(--color-background)" },
        defaultProps: {
          heading: "Welcome",
          subheading: "Your subheading here",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=960&h=540&fit=crop",
          imageAlt: "Hero image",
          buttons: [defaultButton],
        },
      },
    ],
  },
  features: {
    type: "features",
    label: "Features",
    category: "content",
    variants: [
      {
        id: "features-grid-3",
        label: "3-column features grid",
        component: FeaturesGrid3 as ComponentType<Record<string, unknown>>,
        propsSchema: featuresGrid3Schema,
        traits: ["grid", "background", "textColor", "spacing"],
        defaultProps: {
          heading: "Features",
          subheading: "What we offer",
          items: [
            { icon: "layers", title: "Feature one", description: "Description" },
            { icon: "palette", title: "Feature two", description: "Description" },
            { icon: "sparkle", title: "Feature three", description: "Description" },
          ],
        },
      },
      {
        id: "features-alternating",
        label: "Alternating features",
        component: FeaturesAlternating as ComponentType<Record<string, unknown>>,
        propsSchema: featuresAlternatingSchema,
        traits: ["background", "textColor", "spacing"],
        defaultProps: {
          heading: "How it works",
          subheading: "Our process",
          items: [
            {
              title: "Step one",
              description: "Description",
              image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=560&h=360&fit=crop",
              imageAlt: "Feature",
            },
          ],
        },
      },
    ],
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    category: "social-proof",
    variants: [
      {
        id: "testimonials-grid",
        label: "Testimonials grid",
        component: TestimonialsGrid as ComponentType<Record<string, unknown>>,
        propsSchema: testimonialsGridSchema,
        traits: ["grid", "background", "textColor", "spacing"],
        defaultProps: {
          heading: "What clients say",
          subheading: "Trusted by teams everywhere",
          testimonials: [
            { quote: "Great work!", name: "Alex", role: "CEO" },
            { quote: "Highly recommend.", name: "Sam", role: "Founder" },
            { quote: "Excellent team.", name: "Jordan", role: "Director" },
          ],
        },
      },
    ],
  },
  cta: {
    type: "cta",
    label: "Call to action",
    category: "cta",
    variants: [
      {
        id: "cta-banner",
        label: "CTA banner",
        component: CtaBanner as ComponentType<Record<string, unknown>>,
        propsSchema: ctaBannerSchema,
        traits: ["background", "textColor", "spacing"],
        settingsDefaults: {
          type: "solid",
          color: "var(--color-primary)",
          textColor: "#ffffff",
        },
        defaultProps: {
          heading: "Ready to get started?",
          subheading: "Let's talk about your project.",
          button: {
            label: "Contact us",
            link: { type: "url", href: "#contact" },
          },
        },
      },
    ],
  },
  footer: {
    type: "footer",
    label: "Footer",
    category: "footer",
    variants: [
      {
        id: "footer-simple",
        label: "Simple footer",
        component: FooterSimple as ComponentType<Record<string, unknown>>,
        propsSchema: footerSimpleSchema,
        traits: ["background", "textColor"],
        settingsDefaults: { type: "solid", color: "var(--color-background)" },
        defaultProps: {
          logo: { type: "text", value: "Brand" },
          blurb: "A short description of your business.",
          columns: [
            {
              title: "Company",
              links: [{ label: "About", href: "/about" }],
            },
            {
              title: "Legal",
              links: [{ label: "Privacy", href: "/privacy" }],
            },
          ],
          copyright: "© 2026 Brand. All rights reserved.",
        },
      },
    ],
  },
};

export function findSectionVariant(type: string, variant: string) {
  const definition = sectionRegistry[type];
  if (!definition) {
    return null;
  }

  return definition.variants.find((entry) => entry.id === variant) ?? null;
}
