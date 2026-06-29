"use client";

import {
  AI_INDUSTRIES,
  AI_PROMPT_MAX_LENGTH,
  AI_VISION_PLACEHOLDER,
  type AiIndustryId,
} from "@/lib/ai/wizard-config";
import AiWizardFooter from "./AiWizardFooter";

interface AiStepIndustryProps {
  industry: AiIndustryId | null;
  prompt: string;
  onIndustryChange: (industry: AiIndustryId) => void;
  onPromptChange: (prompt: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export default function AiStepIndustry({
  industry,
  prompt,
  onIndustryChange,
  onPromptChange,
  onBack,
  onContinue,
}: AiStepIndustryProps) {
  const charCount = prompt.length;
  const canContinue = industry !== null && prompt.trim().length > 0;

  return (
    <div className="ai-wizard__step ai-wizard__step--industry">
      <section className="ai-wizard__section">
        <h2 className="ai-wizard__section-title">What type of website are you building?</h2>
        <div className="ai-wizard__industry-tags" role="group" aria-label="Select industry">
          {AI_INDUSTRIES.map((entry) => {
            const isSelected = industry === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                className={isSelected ? "ai-wizard__industry-tag is-selected" : "ai-wizard__industry-tag"}
                aria-pressed={isSelected}
                onClick={() => onIndustryChange(entry.id)}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="ai-wizard__section">
        <h2 className="ai-wizard__section-title">Describe your website vision</h2>

        <div className="ai-wizard__vision-box">
          <textarea
            value={prompt}
            onChange={(event) => {
              const value = event.target.value.slice(0, AI_PROMPT_MAX_LENGTH);
              onPromptChange(value);
            }}
            placeholder={AI_VISION_PLACEHOLDER}
            rows={5}
            aria-label="Describe your website vision"
          />
          <p className="ai-wizard__char-count" aria-live="polite">
            {charCount.toLocaleString()} character{charCount === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <AiWizardFooter
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!canContinue}
        continueLabel="Continue"
      />
    </div>
  );
}
