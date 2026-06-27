"use client";

import { Calendar, Mail, PenLine, Send, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { FORM_TEMPLATES } from "@/lib/forms/templates";
import { TEMPLATE_UI_META } from "@/lib/forms/field-meta";
import type { FormTemplateId } from "@/lib/collections/types";

const TEMPLATE_ICONS: Record<FormTemplateId, typeof Mail> = {
  contact: Mail,
  "booking-salon": Calendar,
  newsletter: Send,
  custom: PenLine,
};

const PICKER_ORDER: FormTemplateId[] = ["contact", "booking-salon", "newsletter", "custom"];

interface FormTemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: FormTemplateId) => void;
}

export default function FormTemplatePicker({ open, onClose, onSelect }: FormTemplatePickerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="dash-modal" role="presentation" onClick={onClose}>
      <div
        className="dash-modal__dialog form-template-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-template-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dash-modal__header">
          <div>
            <h2 id="form-template-title">Create a form</h2>
            <p className="form-template-picker__lead">
              Start from a template or build your own. You can change fields anytime.
            </p>
          </div>
          <button type="button" className="dash-modal__close" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="form-template-picker__grid">
          {PICKER_ORDER.map((templateId) => {
            const template = FORM_TEMPLATES[templateId];
            const meta = TEMPLATE_UI_META[templateId];
            const Icon = TEMPLATE_ICONS[templateId];

            return (
              <button
                key={templateId}
                type="button"
                className={`form-template-picker__card form-template-picker__card--${meta.accent}`}
                onClick={() => onSelect(templateId)}
              >
                <span className="form-template-picker__card-top">
                  <span className="form-template-picker__icon" aria-hidden>
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  {meta.recommended ? (
                    <span className="form-template-picker__badge">
                      <Sparkles size={12} strokeWidth={2} aria-hidden />
                      Popular
                    </span>
                  ) : null}
                </span>
                <strong>{template.name}</strong>
                <span className="form-template-picker__description">{template.description}</span>
                <span className="form-template-picker__fields">
                  {template.fields.length} field{template.fields.length === 1 ? "" : "s"} ·{" "}
                  {template.fields
                    .slice(0, 3)
                    .map((field) => field.label)
                    .join(", ")}
                  {template.fields.length > 3 ? "…" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
