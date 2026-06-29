import type { AiIndustryId } from "@/lib/ai/industries/types";
import { getIndustryDefinition } from "@/lib/ai/industries/registry";

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function extractSiteNameFromPrompt(prompt: string, industryId?: AiIndustryId | null): string {
  const trimmed = prompt.trim();
  const industryLabel = industryId ? getIndustryDefinition(industryId).label : "Medical";

  if (!trimmed) {
    return `${industryLabel} Practice`;
  }

  const forMyMatch = trimmed.match(/\bfor my ([^.!?\n,]+)/i);
  if (forMyMatch?.[1]) {
    const candidate = forMyMatch[1].trim().slice(0, 60);
    if (candidate.length >= 3) {
      return titleCase(candidate);
    }
  }

  const namedMatch = trimmed.match(/\b(?:called|named)\s+["']?([^"'.!?\n,]+)/i);
  if (namedMatch?.[1]) {
    const candidate = namedMatch[1].trim().slice(0, 60);
    if (candidate.length >= 3) {
      return titleCase(candidate);
    }
  }

  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed;
  if (firstSentence.length <= 48) {
    return titleCase(firstSentence);
  }

  return `${industryLabel} Practice`;
}
