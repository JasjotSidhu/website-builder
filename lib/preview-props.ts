import { findSectionVariant } from "@/lib/registry";
import { migrateThemeBoundSectionSettings } from "@/lib/theme-color-utils";
import { buildVariantSettings } from "@/lib/traits/registry";

interface VariantPreview {
  props: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

function normalizePreviewSettings(settings: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...settings };

  if (!migrated.type && migrated.backgroundColor) {
    migrated.type = "solid";
    migrated.color = migrated.backgroundColor;
    delete migrated.backgroundColor;
  }

  if (
    migrated.overlayColor !== undefined &&
    migrated.opacity !== undefined &&
    !migrated.overlayOpacity
  ) {
    migrated.overlayOpacity = migrated.opacity;
    delete migrated.opacity;
  }

  return migrated;
}

const PREVIEW_DATA: Record<string, VariantPreview> = {
  "header-simple": {
    props: {
      logo: { type: "text", value: "Atelier" },
      links: [
        { label: "Work", link: { type: "url", href: "#" } },
        { label: "Services", link: { type: "url", href: "#" } },
        { label: "About", link: { type: "url", href: "#" } },
      ],
      cta: {
        label: "Get started",
        link: { type: "url", href: "#" },
        variant: "primary",
      },
    },
  },
  "hero-centered": {
    props: {
      heading: "Design that feels unmistakably yours",
      subheading:
        "We craft brand identities and digital experiences that turn first impressions into lasting trust.",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=960&h=540&fit=crop",
      imageAlt: "Abstract gradient artwork",
      buttons: [
        {
          label: "View our work",
          link: { type: "url", href: "#" },
          variant: "primary",
        },
        {
          label: "Book a call",
          link: { type: "url", href: "#" },
          variant: "secondary",
        },
      ],
    },
    settings: {
      overlayColor: "#000000",
      opacity: 0.25,
      backgroundColor: "#FFFBF7",
      paddingY: "lg",
    },
  },
  "hero-split": {
    props: {
      heading: "Build a brand people remember",
      subheading:
        "Strategy, identity, and web design — delivered as one cohesive studio partnership.",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=480&fit=crop",
      imageAlt: "Creative team collaborating",
      buttons: [
        {
          label: "Start a project",
          link: { type: "url", href: "#" },
          variant: "primary",
        },
      ],
    },
    settings: {
      backgroundColor: "#FFFBF7",
      paddingY: "lg",
    },
  },
  "features-grid-3": {
    props: {
      heading: "Everything you need to grow",
      subheading: "A focused toolkit designed to help your business stand out and scale.",
      items: [
        {
          icon: "palette",
          title: "Brand identity",
          description: "Logos, color systems, and guidelines that keep you consistent.",
        },
        {
          icon: "layers",
          title: "Web design",
          description: "Beautiful, conversion-focused layouts built to evolve with you.",
        },
        {
          icon: "sparkle",
          title: "Launch support",
          description: "From handoff to go-live, we stay close through every milestone.",
        },
      ],
    },
    settings: {
      columns: 3,
      gap: "md",
      backgroundColor: "#F5F0EB",
      paddingY: "lg",
    },
  },
  "features-alternating": {
    props: {
      heading: "How we work",
      subheading: "A clear, collaborative path from first conversation to shipped brand.",
      items: [
        {
          title: "Discover",
          description: "We map your audience, competitors, and goals together.",
          image:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=560&h=360&fit=crop",
          imageAlt: "Team workshop",
        },
        {
          title: "Design",
          description: "We explore directions quickly and refine the strongest concept.",
          image:
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=560&h=360&fit=crop",
          imageAlt: "Design process",
        },
      ],
    },
    settings: {
      backgroundColor: "#FFFBF7",
      paddingY: "lg",
    },
  },
  "testimonials-grid": {
    props: {
      heading: "Loved by founders",
      subheading: "Teams who wanted design that finally matched their ambition.",
      testimonials: [
        {
          quote: "They translated our messy ideas into a brand we're proud of everywhere.",
          name: "Maya Chen",
          role: "Founder, Northline",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
        },
        {
          quote: "The new site doubled our inbound leads in six weeks. Premium, not pretentious.",
          name: "Daniel Ortiz",
          role: "Marketing Director",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
        },
        {
          quote: "They think in systems, not screens. Our team updates pages with confidence.",
          name: "Priya Nair",
          role: "COO, Fieldstone",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
        },
      ],
    },
    settings: {
      columns: 3,
      gap: "md",
      backgroundColor: "#F5F0EB",
      paddingY: "lg",
    },
  },
  "cta-banner": {
    props: {
      heading: "Ready to build something distinctive?",
      subheading: "Tell us about your project — we reply within two business days.",
      buttons: [
        {
          label: "Start a project",
          link: { type: "url", href: "#" },
          variant: "light",
        },
      ],
    },
    settings: {
      type: "solid",
      color: "var(--color-primary)",
      textColor: "auto",
      paddingY: "md",
    },
  },
  "footer-simple": {
    props: {
      logo: { type: "text", value: "Atelier" },
      blurb: "A boutique studio helping small businesses look as polished as the work they do.",
      columns: [
        {
          title: "Studio",
          links: [
            { label: "Work", link: { type: "url", href: "#" } },
            { label: "Services", link: { type: "url", href: "#" } },
          ],
        },
        {
          title: "Connect",
          links: [
            { label: "Contact", link: { type: "url", href: "#" } },
            { label: "Instagram", link: { type: "url", href: "#" } },
          ],
        },
      ],
      copyright: "© 2026 Atelier. All rights reserved.",
    },
  },
};

export function getVariantPreview(type: string, variantId: string) {
  const variant = findSectionVariant(type, variantId);
  const preview = PREVIEW_DATA[variantId];
  const rawSettings =
    preview?.settings ?? buildVariantSettings(variant?.traits ?? [], variant?.settingsDefaults);

  return {
    props: preview?.props ?? variant?.defaultProps ?? {},
    settings: migrateThemeBoundSectionSettings(
      normalizePreviewSettings(rawSettings),
      type,
      variantId,
    ),
  };
}
