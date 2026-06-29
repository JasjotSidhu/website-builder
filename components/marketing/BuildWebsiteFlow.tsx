"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRightLeft,
  ChevronRight,
  FileText,
  Home,
  Image,
  LayoutGrid,
  Plus,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import AiStepGenerate from "@/components/marketing/ai-build/AiStepGenerate";
import AiStepIndustry from "@/components/marketing/ai-build/AiStepIndustry";
import AiStepPages from "@/components/marketing/ai-build/AiStepPages";
import AiWizardProgress from "@/components/marketing/ai-build/AiWizardProgress";
import { isAiWizardStep, type AiWizardStep } from "@/components/marketing/ai-build/types";
import MarketingLogo from "@/components/marketing/MarketingLogo";
import TemplatePreviewCard from "@/components/marketing/TemplatePreviewCard";
import {
  executeBuildWebsiteIntent,
  saveBuildWebsiteIntent,
  type BuildWebsiteIntent,
  type BuildWebsiteMode,
} from "@/lib/build-website-intent";
import { captureAuthReturnPath } from "@/lib/auth/user-login-url";
import {
  getIndustryConfig,
  normalizeSelectedPages,
  type AiColorSchemeId,
  type AiFeatureId,
  type AiIndustryId,
} from "@/lib/ai/wizard-config";
import {
  heroCategories,
  marketingTemplates,
  type MarketingTemplate,
} from "@/lib/marketing/content";

export type BuildStep =
  | "options"
  | "ai-industry"
  | "ai-pages"
  | "ai-generate"
  | "template-category"
  | "template-pick"
  | "migrate";

const categoryIcons = {
  plus: Plus,
  home: Home,
  image: Image,
  grid: LayoutGrid,
  bolt: Zap,
  users: Users,
  file: FileText,
  sparkles: Sparkles,
} as const;

const buildOptions: {
  mode: BuildWebsiteMode;
  step: BuildStep;
  title: string;
  description: string;
  icon: typeof Sparkles;
  tint: string;
  accent: string;
  featured?: boolean;
}[] = [
  {
    mode: "ai",
    step: "ai-industry",
    title: "Generate using AI",
    description: "Describe your business and let Webeix build a complete website.",
    icon: Sparkles,
    tint: "#f2f0fe",
    accent: "#7C6FF0",
    featured: true,
  },
  {
    mode: "template",
    step: "template-category",
    title: "Pick a template",
    description: "Choose your industry, pick a design, and start editing.",
    icon: LayoutGrid,
    tint: "#fdf0ea",
    accent: "#E0552B",
  },
  {
    mode: "migrate",
    step: "migrate",
    title: "Migrate existing website",
    description: "Paste your current site URL and rebuild it with Webeix sections.",
    icon: ArrowRightLeft,
    tint: "#eef3fe",
    accent: "#2563EB",
  },
  {
    mode: "blank",
    step: "options",
    title: "Start with a blank website",
    description: "Open the builder with a clean canvas and add sections yourself.",
    icon: Plus,
    tint: "#eafaf3",
    accent: "#059669",
  },
];

function parseBuildStep(value: string | null): BuildStep {
  if (value === "ai") {
    return "ai-industry";
  }

  if (value === "ai-generate" || value === "ai-sections") {
    return "ai-generate";
  }

  if (
    value === "ai-industry" ||
    value === "ai-pages" ||
    value === "ai-generate" ||
    value === "template-category" ||
    value === "template-pick" ||
    value === "migrate" ||
    value === "options"
  ) {
    return value;
  }

  return "options";
}

export default function BuildWebsiteFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openSignup, openLogin } = useAuthModal();
  const generationStartedRef = useRef(false);

  const [step, setStep] = useState<BuildStep>(() => parseBuildStep(searchParams.get("step")));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(() => searchParams.get("prompt")?.trim() ?? "");
  const [aiIndustry, setAiIndustry] = useState<AiIndustryId | null>(null);
  const [aiSelectedPages, setAiSelectedPages] = useState<string[]>(["home"]);
  const [aiSelectedFeatures, setAiSelectedFeatures] = useState<AiFeatureId[]>([]);
  const [aiColorScheme, setAiColorScheme] = useState<AiColorSchemeId>("blue");
  const [migrateUrl, setMigrateUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (!selectedCategory) {
      return marketingTemplates;
    }

    const categoryAliases: Record<string, string[]> = {
      Wellness: ["Life Coach", "Medical"],
    };
    const categories = categoryAliases[selectedCategory] ?? [selectedCategory];
    return marketingTemplates.filter((template) => categories.includes(template.category));
  }, [selectedCategory]);

  const isAiStep = isAiWizardStep(step);

  const exitBuildFlow = useCallback(() => {
    router.push("/");
  }, [router]);

  const navigateToStep = useCallback(
    (nextStep: BuildStep) => {
      setError(null);
      setStep(nextStep);

      const params = new URLSearchParams();
      if (nextStep !== "options") {
        params.set("step", nextStep);
      }
      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt && isAiWizardStep(nextStep)) {
        params.set("prompt", trimmedPrompt);
      }

      const query = params.toString();
      router.replace(query ? `/build?${query}` : "/build", { scroll: false });
    },
    [prompt, router],
  );

  useEffect(() => {
    setStep(parseBuildStep(searchParams.get("step")));
    const urlPrompt = searchParams.get("prompt")?.trim();
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
  }, [searchParams]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        exitBuildFlow();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [exitBuildFlow]);

  useEffect(() => {
    if ((step === "ai-pages" || step === "ai-generate") && !aiIndustry) {
      navigateToStep("ai-industry");
    }
  }, [aiIndustry, navigateToStep, step]);

  async function requireAuthAndContinue(intent: BuildWebsiteIntent): Promise<void> {
    const sessionRes = await fetch("/api/auth/me");
    if (!sessionRes.ok) {
      saveBuildWebsiteIntent(intent);
      openSignup(
        null,
        null,
        captureAuthReturnPath(),
        intent.mode === "ai" ? "Starting with - Generating Website with AI" : null,
      );
      return;
    }

    setPending(true);
    setError(null);

    try {
      const builderUrl = await executeBuildWebsiteIntent(intent);
      router.push(builderUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create website.");
      setPending(false);
      generationStartedRef.current = false;
    }
  }

  async function handleBlankStart() {
    await requireAuthAndContinue({ mode: "blank", templateId: "blank" });
  }

  async function handleAiGenerationComplete() {
    if (generationStartedRef.current || !aiIndustry) {
      return;
    }

    generationStartedRef.current = true;

    await requireAuthAndContinue({
      mode: "ai",
      prompt: prompt.trim(),
      aiIndustry,
      aiPages: aiSelectedPages,
      aiFeatures: aiSelectedFeatures,
      aiColorScheme,
    });
  }

  function handleIndustryChange(industry: AiIndustryId) {
    setAiIndustry(industry);
    const config = getIndustryConfig(industry);
    setAiSelectedPages(normalizeSelectedPages(config.recommendedPageIds, config));
  }

  function handleAiIndustryContinue() {
    navigateToStep("ai-pages");
  }

  function handleAiPagesContinue() {
    if (!aiIndustry) {
      navigateToStep("ai-industry");
      return;
    }

    generationStartedRef.current = false;
    navigateToStep("ai-generate");
  }

  async function handleMigrateSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = migrateUrl.trim();
    if (!value) {
      setError("Enter the URL of your existing website.");
      return;
    }

    try {
      const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
      await requireAuthAndContinue({ mode: "migrate", migrateUrl: parsed.toString() });
    } catch {
      setError("Enter a valid website URL.");
    }
  }

  async function handleTemplateSelect(template: MarketingTemplate) {
    await requireAuthAndContinue({
      mode: "template",
      category: template.category,
      marketingTemplate: template.name,
    });
  }

  function goBack() {
    setError(null);

    if (step === "ai-pages") {
      navigateToStep("ai-industry");
      return;
    }
    if (step === "ai-generate") {
      generationStartedRef.current = false;
      navigateToStep("ai-pages");
      return;
    }
    if (step === "ai-industry") {
      navigateToStep("options");
      return;
    }
    if (step === "template-pick") {
      navigateToStep("template-category");
      return;
    }

    navigateToStep("options");
    setSelectedCategory(null);
  }

  let title = "How would you like to build?";
  let lead = "Pick the path that fits you best. Every option opens in the visual editor.";
  let eyebrow: string | null = "Get started";

  if (step === "ai-industry") {
    eyebrow = "AI builder · Step 1 of 3";
    title = "Tell us about your website";
    lead = "Choose your industry and describe your vision — we'll handle structure, sections, and copy.";
  } else if (step === "ai-pages") {
    eyebrow = "AI builder · Step 2 of 3";
    title = "Select your pages";
    lead = aiIndustry
      ? `Pick the pages for your ${getIndustryConfig(aiIndustry).label.toLowerCase()} site.`
      : "Pick the pages your site needs.";
  } else if (step === "ai-generate") {
    eyebrow = "AI builder · Step 3 of 3";
    title = "Generating your website";
    lead = "We're picking sections for each page and writing your copy.";
  } else if (step === "template-category") {
    eyebrow = "Templates · Step 1 of 2";
    title = "Choose your industry";
    lead = "Pick the category that best matches your business.";
  } else if (step === "template-pick") {
    eyebrow = "Templates · Step 2 of 2";
    title = selectedCategory ?? "Pick a template";
    lead = "Select a starting design — everything stays fully editable.";
  } else if (step === "migrate") {
    eyebrow = "Migration";
    title = "Import your current site";
    lead = "Paste your URL and we'll rebuild the layout with Webeix sections.";
  }

  const templateStep = step === "template-category" ? 1 : step === "template-pick" ? 2 : 0;

  return (
    <div className="marketing build-page">
      <div className="build-page__dialog">
        <div className="build-modal__glow build-modal__glow--orange" aria-hidden />
        <div className="build-modal__glow build-modal__glow--violet" aria-hidden />

        <header className="build-modal__topbar">
          <MarketingLogo />
          <div className="build-modal__topbar-actions">
            {isAiStep ? <AiWizardProgress currentStep={step} /> : null}
            {templateStep > 0 ? (
              <div className="build-modal__progress" aria-label={`Step ${templateStep} of 2`}>
                <span className={templateStep >= 1 ? "build-modal__progress-step is-active" : "build-modal__progress-step"}>
                  1. Category
                </span>
                <span className="build-modal__progress-line" aria-hidden />
                <span className={templateStep >= 2 ? "build-modal__progress-step is-active" : "build-modal__progress-step"}>
                  2. Template
                </span>
              </div>
            ) : null}
            <button type="button" className="build-modal__topbar-login" onClick={() => openLogin(null, null, captureAuthReturnPath())}>
              Log in
            </button>
            <button type="button" className="login-modal__close" aria-label="Close" onClick={exitBuildFlow}>
              <X size={18} strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <div className="build-modal__content">
          <div className="build-modal__intro">
            {step !== "options" && step !== "ai-generate" && !isAiStep ? (
              <button type="button" className="build-modal__back" onClick={goBack}>
                <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
                Back
              </button>
            ) : null}
            <div className="build-modal__intro-copy">
              {eyebrow ? <p className="build-modal__eyebrow">{eyebrow}</p> : null}
              <h1 className="build-modal__title">
                {step === "options" ? (
                  <>
                    How would you like to{" "}
                    <span className="wx-serif wx-gradient-text build-modal__title-accent">build?</span>
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="build-modal__lead">{lead}</p>
            </div>
          </div>

          <div className="build-modal__body">
            <div key={step} className="build-modal__step">
              {step === "options" ? (
                <div className="build-modal__options">
                  {buildOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.mode}
                        type="button"
                        className={
                          option.featured
                            ? "build-modal__option build-modal__option--featured"
                            : "build-modal__option"
                        }
                        disabled={pending}
                        onClick={() => {
                          if (option.mode === "blank") {
                            void handleBlankStart();
                            return;
                          }
                          navigateToStep(option.step);
                        }}
                      >
                        {option.featured ? <span className="build-modal__option-badge">Popular</span> : null}
                        <span
                          className="build-modal__option-icon"
                          style={{ background: option.tint, color: option.accent }}
                        >
                          <Icon size={22} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="build-modal__option-copy">
                          <strong>{option.title}</strong>
                          <span>{option.description}</span>
                        </span>
                        <span className="build-modal__option-action">
                          {option.mode === "blank" ? "Create" : "Continue"}
                          <ChevronRight size={16} strokeWidth={2} aria-hidden />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === "ai-industry" ? (
                <AiStepIndustry
                  industry={aiIndustry}
                  prompt={prompt}
                  onIndustryChange={handleIndustryChange}
                  onPromptChange={setPrompt}
                  onBack={goBack}
                  onContinue={handleAiIndustryContinue}
                />
              ) : null}

              {step === "ai-pages" && aiIndustry ? (
                <AiStepPages
                  industry={aiIndustry}
                  selectedPages={aiSelectedPages}
                  onSelectedPagesChange={setAiSelectedPages}
                  onBack={goBack}
                  onContinue={handleAiPagesContinue}
                  error={error}
                  continueLabel="Generate website"
                />
              ) : null}

              {step === "ai-generate" ? (
                <AiStepGenerate
                  onComplete={() => void handleAiGenerationComplete()}
                  error={error}
                />
              ) : null}

              {step === "template-category" ? (
                <div className="build-modal__category-grid">
                  {heroCategories.map((category) => {
                    const Icon = categoryIcons[category.icon];
                    return (
                      <button
                        key={category.label}
                        type="button"
                        className="build-modal__category"
                        onClick={() => {
                          setSelectedCategory(category.label);
                          navigateToStep("template-pick");
                        }}
                      >
                        <span
                          className="build-modal__category-icon"
                          style={{ background: category.tint, color: category.accent }}
                        >
                          <Icon size={20} strokeWidth={2} aria-hidden />
                        </span>
                        <span className="build-modal__category-label">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {step === "template-pick" ? (
                <div className="wx-tpl-page__grid">
                  {filteredTemplates.length === 0 ? (
                    <p className="build-modal__empty">No templates in this category yet. Try another category.</p>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TemplatePreviewCard
                        key={template.name}
                        template={template}
                        variant="light"
                        disabled={pending}
                        onSelect={() => void handleTemplateSelect(template)}
                      />
                    ))
                  )}
                </div>
              ) : null}

              {step === "migrate" ? (
                <form className="build-modal__panel build-modal__panel--migrate" onSubmit={(event) => void handleMigrateSubmit(event)}>
                  <div className="build-modal__migrate-note">
                    We&apos;ll analyze your current site and recreate the layout using editable Webeix sections.
                  </div>
                  <div className="platform-field">
                    <label htmlFor="migrate-url">Website URL</label>
                    <input
                      id="migrate-url"
                      type="url"
                      value={migrateUrl}
                      onChange={(event) => setMigrateUrl(event.target.value)}
                      placeholder="https://your-current-site.com"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="platform-btn platform-btn--primary" disabled={pending}>
                    {pending ? "Creating…" : "Start migration"}
                  </button>
                </form>
              ) : null}

              {step === "options" ? (
                <p className="build-modal__footnote">Free to start · No credit card · Fully editable in the builder</p>
              ) : null}

              {error && !isAiStep ? <p className="platform-form__error build-modal__error">{error}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
