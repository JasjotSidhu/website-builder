import type { AiIndustryPageDefinition, AiSuggestedSection } from "@/lib/ai/industries/types";
import type { LinkValue } from "@/lib/types";

export interface MedicalMockContext {
  siteName: string;
  prompt: string;
  pages: AiIndustryPageDefinition[];
}

const MEDICAL_HERO_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&h=540&fit=crop";
const CLINIC_INTERIOR_IMAGE =
  "https://images.unsplash.com/photo-1519494026897-4055090470db?w=960&h=540&fit=crop";
const CARE_IMAGE =
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=560&h=360&fit=crop";

function pageLink(pageId: string): LinkValue {
  return { type: "page", pageId };
}

function hasPage(ctx: MedicalMockContext, pageId: string): boolean {
  return ctx.pages.some((page) => page.id === pageId);
}

function primaryCta(ctx: MedicalMockContext) {
  if (hasPage(ctx, "appointments")) {
    return {
      label: "Book appointment",
      link: pageLink("appointments"),
      variant: "primary" as const,
    };
  }
  if (hasPage(ctx, "contact")) {
    return {
      label: "Contact us",
      link: pageLink("contact"),
      variant: "primary" as const,
    };
  }
  return {
    label: "Get started",
    link: pageLink("home"),
    variant: "primary" as const,
  };
}

function secondaryCta(ctx: MedicalMockContext) {
  if (hasPage(ctx, "services")) {
    return {
      label: "View services",
      link: pageLink("services"),
      variant: "secondary" as const,
    };
  }
  if (hasPage(ctx, "about")) {
    return {
      label: "About us",
      link: pageLink("about"),
      variant: "secondary" as const,
    };
  }
  return null;
}

export function buildMedicalSectionProps(
  page: AiIndustryPageDefinition,
  suggested: AiSuggestedSection,
  ctx: MedicalMockContext,
): Record<string, unknown> {
  const { siteName } = ctx;
  const role = suggested.role.toLowerCase();

  if (suggested.type === "hero") {
    return buildHeroProps(page, suggested, ctx, role);
  }
  if (suggested.type === "features") {
    return buildFeaturesProps(page, role, siteName);
  }
  if (suggested.type === "testimonials") {
    return buildTestimonialsProps(page, siteName);
  }
  if (suggested.type === "team") {
    return buildTeamProps(page, siteName);
  }
  if (suggested.type === "faq") {
    return buildFaqProps(page, siteName);
  }
  if (suggested.type === "blog") {
    return buildBlogProps(page, siteName);
  }
  if (suggested.type === "form") {
    return buildFormProps(page, role, siteName);
  }
  if (suggested.type === "cta") {
    return buildCtaProps(page, ctx);
  }

  return {};
}

function buildHeroProps(
  page: AiIndustryPageDefinition,
  suggested: AiSuggestedSection,
  ctx: MedicalMockContext,
  role: string,
): Record<string, unknown> {
  const { siteName, prompt } = ctx;
  const secondary = secondaryCta(ctx);
  const buttons: Array<{ label: string; link: LinkValue; variant: "primary" | "secondary" | "outline" | "light" }> = [
    primaryCta(ctx),
  ];
  if (secondary) {
    buttons.push(secondary);
  }

  const copyByPage: Record<string, { eyebrow: string; heading: string; subheading: string }> = {
    home: {
      eyebrow: "Welcome",
      heading: `Compassionate care at ${siteName}`,
      subheading:
        prompt.trim() ||
        "Trusted medical professionals dedicated to your health — from routine checkups to specialized treatment, all in one welcoming practice.",
    },
    about: {
      eyebrow: "About us",
      heading: `Care rooted in trust at ${siteName}`,
      subheading:
        "We combine clinical excellence with a personal approach, so every patient feels heard, informed, and supported.",
    },
    services: {
      eyebrow: "Our services",
      heading: "Comprehensive care for every stage of life",
      subheading: "Explore the treatments and specialties available at our practice.",
    },
    team: {
      eyebrow: "Our doctors",
      heading: "Meet the team behind your care",
      subheading: "Experienced physicians and staff committed to your wellbeing.",
    },
    appointments: {
      eyebrow: "Appointments",
      heading: "Schedule your visit",
      subheading: "Book online or call our office — new and returning patients welcome.",
    },
    contact: {
      eyebrow: "Contact",
      heading: "We're here when you need us",
      subheading: "Reach out with questions, directions, or to request an appointment.",
    },
    blog: {
      eyebrow: "Health blog",
      heading: "Tips and insights for better health",
      subheading: "Practical advice from our care team on prevention, wellness, and recovery.",
    },
    testimonials: {
      eyebrow: "Patient stories",
      heading: "What our patients say",
      subheading: "Real experiences from people who trust us with their care.",
    },
    faq: {
      eyebrow: "FAQ",
      heading: "Answers to common questions",
      subheading: "Insurance, appointments, records, and what to expect at your visit.",
    },
  };

  const copy = copyByPage[page.id] ?? {
    eyebrow: page.label,
    heading: page.label,
    subheading: page.purpose,
  };

  if (role.includes("book")) {
    copy.heading = "Schedule your appointment today";
  }

  return {
    ...copy,
    image: suggested.variant === "hero-split" ? CLINIC_INTERIOR_IMAGE : MEDICAL_HERO_IMAGE,
    imageAlt: `${siteName} medical care`,
    buttons,
  };
}

function buildFeaturesProps(
  page: AiIndustryPageDefinition,
  role: string,
  siteName: string,
): Record<string, unknown> {
  if (page.id === "services" || role.includes("service")) {
    return {
      eyebrow: "Services",
      heading: "Treatments and specialties",
      subheading: "Personalized care plans tailored to your needs.",
      items: [
        {
          icon: "heart",
          title: "Primary care",
          description: "Annual exams, sick visits, and ongoing health management for all ages.",
        },
        {
          icon: "users",
          title: "Specialist referrals",
          description: "Coordinated care with trusted specialists when advanced treatment is needed.",
        },
        {
          icon: "shield",
          title: "Preventive screenings",
          description: "Vaccinations, lab work, and screenings to catch issues early.",
        },
      ],
    };
  }

  if (page.id === "contact" || role.includes("address") || role.includes("hours")) {
    return {
      eyebrow: "Visit us",
      heading: "Location & hours",
      subheading: "Convenient access and flexible scheduling.",
      items: [
        {
          icon: "compass",
          title: "123 Wellness Drive",
          description: "Suite 200 · Your City, ST 12345",
        },
        {
          icon: "smartphone",
          title: "(555) 123-4567",
          description: "Call us Mon–Fri, 8am–5pm for appointments and questions.",
        },
        {
          icon: "clock",
          title: "Office hours",
          description: "Mon–Thu 8am–6pm · Fri 8am–4pm · Sat by appointment",
        },
      ],
    };
  }

  if (page.id === "appointments" || role.includes("step") || role.includes("visit")) {
    return {
      eyebrow: "How it works",
      heading: "Simple steps to your appointment",
      subheading: "We make scheduling straightforward.",
      items: [
        {
          icon: "clock",
          title: "Choose a time",
          description: "Pick a date and time that works for your schedule.",
        },
        {
          icon: "layers",
          title: "Share your details",
          description: "Tell us if you're a new or returning patient and the reason for your visit.",
        },
        {
          icon: "check",
          title: "Confirm with our team",
          description: "We'll follow up to confirm your appointment and any prep instructions.",
        },
      ],
    };
  }

  return {
    eyebrow: "Our approach",
    heading: `Why patients choose ${siteName}`,
    subheading: "Quality care with a focus on comfort and clarity.",
    items: [
      {
        icon: "users",
        title: "Patient-first care",
        description: "Every visit starts with listening — your goals guide our recommendations.",
      },
      {
        icon: "sparkle",
        title: "Modern facilities",
        description: "Clean, comfortable spaces equipped for accurate diagnosis and treatment.",
      },
      {
        icon: "heart",
        title: "Continuity you can trust",
        description: "Long-term relationships with providers who know your health history.",
      },
    ],
  };
}

function buildTestimonialsProps(page: AiIndustryPageDefinition, siteName: string): Record<string, unknown> {
  return {
    eyebrow: "Testimonials",
    heading: page.id === "home" ? "Trusted by our community" : "Patient reviews",
    subheading: `Experiences from people who rely on ${siteName}.`,
    testimonials: [
      {
        quote:
          "The staff made me feel comfortable from the moment I walked in. Clear explanations and zero rush — exactly what I needed.",
        name: "Maria L.",
        role: "Patient since 2022",
      },
      {
        quote:
          "Booking online was easy, and my doctor took time to answer every question. I finally feel confident about my care plan.",
        name: "James R.",
        role: "New patient",
      },
      {
        quote:
          "Professional, kind, and organized. Our whole family comes here for checkups and we recommend them to everyone.",
        name: "Anita K.",
        role: "Family patient",
      },
    ],
  };
}

function buildTeamProps(page: AiIndustryPageDefinition, siteName: string): Record<string, unknown> {
  return {
    eyebrow: "Medical team",
    heading: page.id === "team" ? "Our doctors & specialists" : "Meet our care team",
    subheading: `Dedicated providers at ${siteName}.`,
    members: [
      {
        name: "Dr. Sarah Chen, MD",
        role: "Family Medicine",
        bio: "Board-certified physician with 15 years of experience in preventive and primary care.",
      },
      {
        name: "Dr. Michael Torres, MD",
        role: "Internal Medicine",
        bio: "Focuses on chronic condition management and coordinated specialist care.",
      },
      {
        name: "Dr. Priya Sharma, DO",
        role: "Pediatrics",
        bio: "Passionate about helping children and families build healthy habits early.",
      },
    ],
  };
}

function buildFaqProps(page: AiIndustryPageDefinition, siteName: string): Record<string, unknown> {
  return {
    eyebrow: "FAQ",
    heading: "Frequently asked questions",
    subheading: `Common questions about visiting ${siteName}.`,
    faqs: [
      {
        question: "Do you accept my insurance?",
        answer:
          "We work with most major insurance plans. Contact our office with your member ID and we'll verify coverage before your visit.",
      },
      {
        question: "What should I bring to my first appointment?",
        answer:
          "Please bring a photo ID, insurance card, list of current medications, and any recent test results or referral paperwork.",
      },
      {
        question: "How do I request prescription refills?",
        answer:
          "Call our office or send a message through the patient portal. Allow 48 hours for refill requests to be processed.",
      },
      {
        question: "Can I book same-day appointments?",
        answer:
          "Same-day slots are often available for urgent concerns. Call early in the day for the best availability.",
      },
    ],
  };
}

function buildBlogProps(page: AiIndustryPageDefinition, siteName: string): Record<string, unknown> {
  return {
    eyebrow: "Health blog",
    heading: "Latest health articles",
    subheading: `Wellness tips and updates from ${siteName}.`,
    displayMode: "limit",
    postLimit: 3,
    dataSource: {
      mode: "collection",
      collectionId: "blog-default",
      sort: "newest",
    },
  };
}

function buildFormProps(
  page: AiIndustryPageDefinition,
  role: string,
  siteName: string,
): Record<string, unknown> {
  const isAppointment = page.id === "appointments" || role.includes("appointment");
  return {
    eyebrow: isAppointment ? "Appointments" : "Contact",
    heading: isAppointment ? "Request an appointment" : "Send us a message",
    subheading: isAppointment
      ? "Fill out the form and our scheduling team will confirm your visit."
      : "We typically respond within one business day.",
    formId: isAppointment ? "form-appointment" : "form-contact",
    anchorId: isAppointment ? "appointment" : "contact",
  };
}

function buildCtaProps(page: AiIndustryPageDefinition, ctx: MedicalMockContext): Record<string, unknown> {
  const contactLink: LinkValue = hasPage(ctx, "contact")
    ? pageLink("contact")
    : hasPage(ctx, "appointments")
      ? pageLink("appointments")
      : pageLink("home");

  return {
    eyebrow: "Get started",
    heading: "Ready to take the next step?",
    subheading: "Schedule a visit or reach out — we're here to help.",
    buttons: [
      {
        label: hasPage(ctx, "appointments") ? "Book appointment" : "Contact us",
        link: contactLink,
        variant: "light",
      },
    ],
  };
}

export function buildMedicalCollections(now: string) {
  return {
    "forms-default": {
      id: "forms-default",
      type: "forms" as const,
      name: "Forms",
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: "form-contact",
          order: 0,
          name: "Contact us",
          slug: "contact",
          templateId: "contact",
          fields: [
            { id: "field-1", type: "text", label: "Full name", required: true, width: "full" },
            { id: "field-2", type: "email", label: "Email", required: true, width: "full" },
            { id: "field-3", type: "phone", label: "Phone", required: false, width: "full" },
            { id: "field-4", type: "textarea", label: "Message", required: true, width: "full" },
          ],
          settings: {
            submitLabel: "Send message",
            successMessage: "Thank you — we'll get back to you shortly.",
          },
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "form-appointment",
          order: 1,
          name: "Appointment request",
          slug: "appointment",
          templateId: "booking-salon",
          fields: [
            { id: "field-1", type: "text", label: "Full name", required: true, width: "half" },
            { id: "field-2", type: "phone", label: "Phone", required: true, width: "half" },
            {
              id: "field-3",
              type: "select",
              label: "Visit type",
              required: true,
              width: "full",
              options: ["New patient", "Follow-up", "Annual exam", "Urgent concern"],
            },
            { id: "field-4", type: "date", label: "Preferred date", required: true, width: "half" },
            { id: "field-5", type: "time", label: "Preferred time", required: false, width: "half" },
            {
              id: "field-6",
              type: "textarea",
              label: "Reason for visit",
              required: false,
              width: "full",
            },
          ],
          settings: {
            submitLabel: "Request appointment",
            successMessage: "Request received — our team will confirm your appointment soon.",
          },
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
    "blog-default": {
      id: "blog-default",
      type: "blog" as const,
      name: "Blog",
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: "blog-post-1",
          order: 0,
          slug: "annual-checkup-guide",
          title: "Why your annual checkup matters",
          excerpt: "Preventive visits catch issues early and keep you on track with screenings.",
          body: "<p>Regular checkups help your provider monitor blood pressure, cholesterol, and other key markers before problems become serious.</p>",
          coverImage: CARE_IMAGE,
          author: "Dr. Sarah Chen",
          publishedAt: now,
          featured: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "blog-post-2",
          order: 1,
          slug: "flu-season-tips",
          title: "Staying healthy during flu season",
          excerpt: "Simple habits that reduce your risk and protect those around you.",
          body: "<p>Wash hands often, stay home when sick, and talk to your provider about vaccination options.</p>",
          coverImage: MEDICAL_HERO_IMAGE,
          author: "Care Team",
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "blog-post-3",
          order: 2,
          slug: "managing-stress",
          title: "Managing stress for better health",
          excerpt: "Chronic stress affects sleep, blood pressure, and overall wellbeing.",
          body: "<p>Try short daily walks, consistent sleep schedules, and reach out if stress feels overwhelming.</p>",
          coverImage: CLINIC_INTERIOR_IMAGE,
          author: "Dr. Michael Torres",
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
    },
  };
}

export function buildAlternatingFeaturesProps(siteName: string): Record<string, unknown> {
  return {
    eyebrow: "Our values",
    heading: "Care that puts patients first",
    subheading: `The principles that guide every visit at ${siteName}.`,
    items: [
      {
        title: "Listen first",
        description: "We take time to understand your symptoms, concerns, and goals before recommending treatment.",
        image: CARE_IMAGE,
        imageAlt: "Doctor speaking with a patient",
      },
      {
        title: "Explain clearly",
        description: "No medical jargon without context — you'll leave knowing your options and next steps.",
        image: CLINIC_INTERIOR_IMAGE,
        imageAlt: "Modern medical clinic interior",
      },
    ],
  };
}
