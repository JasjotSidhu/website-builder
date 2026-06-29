"use client";

import { FileText } from "lucide-react";
import {
  getIndustryDefinition,
  getRequiredPageIds,
  normalizeSelectedPages,
  type AiIndustryId,
} from "@/lib/ai/wizard-config";
import AiWizardFooter from "./AiWizardFooter";

interface AiStepPagesProps {
  industry: AiIndustryId;
  selectedPages: string[];
  onSelectedPagesChange: (pages: string[]) => void;
  onBack: () => void;
  onContinue: () => void;
  error?: string | null;
  continueLabel?: string;
}

export default function AiStepPages({
  industry,
  selectedPages,
  onSelectedPagesChange,
  onBack,
  onContinue,
  error,
  continueLabel = "Continue",
}: AiStepPagesProps) {
  const industryDef = getIndustryDefinition(industry);
  const pageOptions = industryDef.pages.map((page) => ({
    id: page.id,
    label: page.label,
    required: page.required,
  }));
  const normalized = normalizeSelectedPages(selectedPages, industry);
  const selectedCount = normalized.length;

  function togglePage(pageId: string, required?: boolean) {
    if (required) {
      return;
    }

    if (normalized.includes(pageId)) {
      onSelectedPagesChange(normalized.filter((id) => id !== pageId));
      return;
    }

    onSelectedPagesChange([...normalized, pageId]);
  }

  return (
    <div className="ai-wizard__step ai-wizard__step--pages">
      <section className="ai-wizard__section">
        <div className="ai-wizard__pages-header">
          <span className="ai-wizard__pages-icon" aria-hidden>
            <FileText size={18} strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="ai-wizard__section-title ai-wizard__section-title--inline">
              Select the pages you need
            </h2>
            <p className="ai-wizard__pages-lead">
              Choose the pages that best fit your {industryDef.label} website. Home page is included by default. (
              {selectedCount} selected)
            </p>
          </div>
        </div>

        <div className="ai-wizard__page-grid" role="group" aria-label="Select pages">
          {industryDef.pages.map((page) => {
            const isSelected = normalized.includes(page.id);
            const isRequired = Boolean(page.required);
            return (
              <label
                key={page.id}
                className={isSelected ? "ai-wizard__page-card is-selected" : "ai-wizard__page-card"}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isRequired}
                  onChange={() => togglePage(page.id, isRequired)}
                />
                <span className="ai-wizard__page-check" aria-hidden />
                <span className="ai-wizard__page-label">
                  {page.label}
                  {isRequired ? <span className="ai-wizard__page-required"> (Required)</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      {error ? <p className="platform-form__error ai-wizard__error">{error}</p> : null}

      <AiWizardFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
        continueDisabled={getRequiredPageIds(pageOptions).some((id) => !normalized.includes(id))}
      />
    </div>
  );
}
