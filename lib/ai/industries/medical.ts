import type { AiIndustryDefinition } from "@/lib/ai/industries/types";

/**
 * Medical industry — reference implementation for AI generation testing.
 * Copy this file when adding other industries.
 */
export const medicalIndustry: AiIndustryDefinition = {
  id: "medical",
  label: "Medical",
  generationReady: true,
  recommendedPageIds: ["home", "about", "services", "contact"],
  pages: [
    {
      id: "home",
      label: "Home",
      slug: "/",
      required: true,
      purpose: "Main landing page — build trust, explain who you are, and guide visitors to book or contact.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "Welcome message with clinic name and primary benefit" },
        { type: "features", variant: "features-grid-3", role: "Key services or care highlights" },
        { type: "testimonials", variant: "testimonials-grid", role: "Patient trust and social proof" },
        { type: "cta", variant: "cta-banner", role: "Book appointment or contact call-to-action" },
      ],
    },
    {
      id: "about",
      label: "About Us",
      slug: "/about",
      purpose: "Clinic story, mission, values, and why patients choose this practice.",
      suggestedSections: [
        { type: "hero", variant: "hero-split", role: "About the practice with supporting image" },
        { type: "features", variant: "features-alternating", role: "Mission, values, or approach to care" },
        { type: "team", variant: "team-grid", role: "Leadership or key staff preview" },
      ],
    },
    {
      id: "services",
      label: "Services",
      slug: "/services",
      purpose: "Treatments, specialties, and procedures offered.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "Overview of services" },
        { type: "features", variant: "features-grid-3", role: "List of services with short descriptions" },
        { type: "faq", variant: "faq-accordion", role: "Common questions about treatments" },
        { type: "cta", variant: "cta-banner", role: "Encourage booking or consultation" },
      ],
    },
    {
      id: "team",
      label: "Doctors/Team",
      slug: "/doctors",
      navLabel: "Our Doctors",
      purpose: "Profiles of doctors, specialists, and care team.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "Introduce the medical team" },
        { type: "team", variant: "team-grid", role: "Doctor and staff profiles with roles" },
        { type: "cta", variant: "cta-banner", role: "Meet the team — book with a provider" },
      ],
    },
    {
      id: "appointments",
      label: "Appointments",
      slug: "/appointments",
      purpose: "How to book, hours, and what to expect at a visit.",
      suggestedSections: [
        { type: "hero", variant: "hero-split", role: "Book an appointment headline" },
        { type: "features", variant: "features-grid-3", role: "Steps to book or visit types (new patient, follow-up)" },
        { type: "form", variant: "form-stacked", role: "Appointment request or contact form" },
      ],
    },
    {
      id: "contact",
      label: "Contact",
      slug: "/contact",
      purpose: "Location, phone, hours, and contact form.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "Get in touch headline" },
        { type: "features", variant: "features-grid-3", role: "Address, phone, hours as feature items" },
        { type: "form", variant: "form-stacked", role: "Contact form" },
      ],
    },
    {
      id: "blog",
      label: "Health Blog",
      slug: "/blog",
      navLabel: "Health Blog",
      purpose: "Health tips, news, and educational articles.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "Blog introduction" },
        { type: "blog", variant: "blog-list", role: "Recent health articles" },
      ],
    },
    {
      id: "testimonials",
      label: "Testimonials",
      slug: "/testimonials",
      purpose: "Patient reviews and success stories.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "What patients say" },
        { type: "testimonials", variant: "testimonials-grid", role: "Patient quotes and reviews" },
      ],
    },
    {
      id: "faq",
      label: "FAQ",
      slug: "/faq",
      purpose: "Answers to common patient questions.",
      suggestedSections: [
        { type: "hero", variant: "hero-centered", role: "FAQ introduction" },
        { type: "faq", variant: "faq-accordion", role: "Question and answer list" },
        { type: "cta", variant: "cta-banner", role: "Still have questions — contact us" },
      ],
    },
  ],
};
