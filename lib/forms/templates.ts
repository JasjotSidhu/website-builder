import type { FormField, FormTemplateId } from "@/lib/collections/types";

export interface FormTemplateSeed {
  id: FormTemplateId;
  name: string;
  description: string;
  fields: Omit<FormField, "id">[];
  settings: {
    submitLabel: string;
    successMessage: string;
  };
}

function field(
  type: FormField["type"],
  label: string,
  partial: Partial<Omit<FormField, "id" | "type" | "label">> = {},
): Omit<FormField, "id"> {
  return {
    type,
    label,
    required: partial.required ?? false,
    placeholder: partial.placeholder,
    options: partial.options,
    width: partial.width ?? "full",
  };
}

export const FORM_TEMPLATES: Record<FormTemplateId, FormTemplateSeed> = {
  contact: {
    id: "contact",
    name: "Contact us",
    description: "Name, email, and message for general inquiries.",
    fields: [
      field("text", "Name", { required: true, width: "full" }),
      field("email", "Email", { required: true, width: "full" }),
      field("phone", "Phone", { width: "full" }),
      field("textarea", "Message", { required: true, placeholder: "How can we help?" }),
    ],
    settings: {
      submitLabel: "Send message",
      successMessage: "Thanks! We'll get back to you soon.",
    },
  },
  "booking-salon": {
    id: "booking-salon",
    name: "Salon booking",
    description: "Appointment request with service and preferred time.",
    fields: [
      field("text", "Full name", { required: true, width: "half" }),
      field("phone", "Phone", { required: true, width: "half" }),
      field("select", "Service", {
        required: true,
        options: ["Haircut", "Color", "Blowout", "Nails"],
      }),
      field("date", "Preferred date", { required: true, width: "half" }),
      field("time", "Preferred time", { required: true, width: "half" }),
      field("textarea", "Notes", {
        placeholder: "Any allergies or special requests?",
      }),
    ],
    settings: {
      submitLabel: "Request booking",
      successMessage: "Thanks! We'll confirm your appointment shortly.",
    },
  },
  newsletter: {
    id: "newsletter",
    name: "Newsletter",
    description: "Simple email signup.",
    fields: [field("email", "Email", { required: true })],
    settings: {
      submitLabel: "Subscribe",
      successMessage: "You're on the list. Welcome!",
    },
  },
  custom: {
    id: "custom",
    name: "Custom form",
    description: "Start with a blank form and add your own fields.",
    fields: [field("text", "Name", { required: true })],
    settings: {
      submitLabel: "Submit",
      successMessage: "Thank you for your submission.",
    },
  },
};

export const FORM_TEMPLATE_LIST = Object.values(FORM_TEMPLATES).filter(
  (entry) => entry.id !== "custom",
);
