import type { AiColorSchemeId, AiFeatureId, AiIndustryId } from "@/lib/ai/wizard-config";

export type AiWizardStep = "ai-industry" | "ai-pages" | "ai-generate";

export interface AiWizardState {
  industry: AiIndustryId | null;
  prompt: string;
  selectedPages: string[];
  selectedFeatures: AiFeatureId[];
  colorScheme: AiColorSchemeId;
}

export const AI_WIZARD_STEPS: { id: AiWizardStep; label: string; number: number }[] = [
  { id: "ai-industry", label: "Industry", number: 1 },
  { id: "ai-pages", label: "Pages", number: 2 },
  { id: "ai-generate", label: "Generate", number: 3 },
];

export function aiWizardStepNumber(step: AiWizardStep): number {
  return AI_WIZARD_STEPS.find((entry) => entry.id === step)?.number ?? 1;
}

export function isAiWizardStep(step: string): step is AiWizardStep {
  return step === "ai-industry" || step === "ai-pages" || step === "ai-generate";
}

export const defaultAiWizardState: AiWizardState = {
  industry: null,
  prompt: "",
  selectedPages: ["home"],
  selectedFeatures: [],
  colorScheme: "blue",
};
