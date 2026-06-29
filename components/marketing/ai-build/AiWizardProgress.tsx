import { AI_WIZARD_STEPS, type AiWizardStep } from "./types";

interface AiWizardProgressProps {
  currentStep: AiWizardStep;
}

export default function AiWizardProgress({ currentStep }: AiWizardProgressProps) {
  const currentNumber = AI_WIZARD_STEPS.find((entry) => entry.id === currentStep)?.number ?? 1;

  return (
    <div className="ai-wizard__progress" aria-label={`Step ${currentNumber} of ${AI_WIZARD_STEPS.length}`}>
      {AI_WIZARD_STEPS.map((entry, index) => {
        const isActive = entry.number <= currentNumber;
        return (
          <span key={entry.id} className="ai-wizard__progress-group">
            <span className={isActive ? "ai-wizard__progress-step is-active" : "ai-wizard__progress-step"}>
              {entry.number}. {entry.label}
            </span>
            {index < AI_WIZARD_STEPS.length - 1 ? (
              <span className="ai-wizard__progress-line" aria-hidden />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
