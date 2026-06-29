import type { WebsiteTemplateId } from "@/lib/templates/catalog";

export type BuildWebsiteMode = "ai" | "template" | "migrate" | "blank";

export interface BuildWebsiteIntent {
  mode: BuildWebsiteMode;
  prompt?: string;
  category?: string;
  marketingTemplate?: string;
  migrateUrl?: string;
  templateId?: WebsiteTemplateId;
  name?: string;
  aiIndustry?: string;
  aiPages?: string[];
  aiFeatures?: string[];
  aiColorScheme?: string;
}

const STORAGE_KEY = "webeix-build-intent";
const AI_PROMPT_KEY = "webeix-ai-prompt";
const AI_WIZARD_KEY = "webeix-ai-wizard";
const MIGRATE_URL_KEY = "webeix-migrate-url";

export function saveBuildWebsiteIntent(intent: BuildWebsiteIntent): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function getBuildWebsiteIntent(): BuildWebsiteIntent | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BuildWebsiteIntent;
  } catch {
    return null;
  }
}

export function clearBuildWebsiteIntent(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function stashBuilderContext(intent: BuildWebsiteIntent): void {
  if (intent.mode === "ai" && intent.prompt) {
    sessionStorage.setItem(AI_PROMPT_KEY, intent.prompt);
  }
  if (intent.mode === "ai") {
    sessionStorage.setItem(
      AI_WIZARD_KEY,
      JSON.stringify({
        aiIndustry: intent.aiIndustry,
        aiPages: intent.aiPages,
        aiFeatures: intent.aiFeatures,
        aiColorScheme: intent.aiColorScheme,
      }),
    );
  }
  if (intent.mode === "migrate" && intent.migrateUrl) {
    sessionStorage.setItem(MIGRATE_URL_KEY, intent.migrateUrl);
  }
}

export function resolveTemplateIdFromMarketing(name: string): WebsiteTemplateId {
  const normalized = name.toLowerCase();
  if (normalized.includes("salon") || normalized.includes("spa")) {
    return "salon";
  }
  return "blank";
}

export function defaultWebsiteName(intent: BuildWebsiteIntent): string {
  if (intent.marketingTemplate) {
    return intent.marketingTemplate;
  }
  if (intent.mode === "migrate") {
    return "Imported website";
  }
  if (intent.mode === "ai") {
    return "AI website";
  }
  return "Untitled website";
}

export function builderUrlForWebsite(websiteId: string, intent: BuildWebsiteIntent): string {
  const base = `/dashboard/sites/${websiteId}/builder`;
  if (intent.mode === "ai") {
    return `${base}?flow=ai`;
  }
  if (intent.mode === "migrate") {
    return `${base}?flow=migrate`;
  }
  return base;
}

export async function executeBuildWebsiteIntent(intent: BuildWebsiteIntent): Promise<string> {
  const name = intent.name?.trim() || defaultWebsiteName(intent);
  const templateId =
    intent.templateId ??
    (intent.marketingTemplate ? resolveTemplateIdFromMarketing(intent.marketingTemplate) : "blank");

  const res = await fetch("/api/websites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      templateId,
      creationMode: intent.mode,
      prompt: intent.prompt,
      migrateUrl: intent.migrateUrl,
      marketingTemplate: intent.marketingTemplate,
      aiIndustry: intent.aiIndustry,
      aiPages: intent.aiPages,
      aiFeatures: intent.aiFeatures,
      aiColorScheme: intent.aiColorScheme,
    }),
  });

  const payload = (await res.json()) as {
    error?: string;
    website?: { id: string };
  };

  if (!res.ok || !payload.website) {
    throw new Error(payload.error ?? "Failed to create website.");
  }

  stashBuilderContext(intent);
  clearBuildWebsiteIntent();
  return builderUrlForWebsite(payload.website.id, intent);
}
