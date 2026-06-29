import { ChevronLeft, ChevronRight } from "lucide-react";

interface AiWizardFooterProps {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  pending?: boolean;
}

export default function AiWizardFooter({
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  pending = false,
}: AiWizardFooterProps) {
  return (
    <div className="ai-wizard__footer">
      <button type="button" className="ai-wizard__footer-back" onClick={onBack} disabled={pending}>
        <ChevronLeft size={16} strokeWidth={2} aria-hidden />
        Back
      </button>
      <button
        type="button"
        className="wx-btn wx-btn--primary ai-wizard__footer-continue"
        onClick={onContinue}
        disabled={continueDisabled || pending}
      >
        {pending ? "Please wait…" : continueLabel}
        {!pending ? <ChevronRight size={16} strokeWidth={2} aria-hidden /> : null}
      </button>
    </div>
  );
}
