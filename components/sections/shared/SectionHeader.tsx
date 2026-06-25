"use client";

import EditableText from "@/lib/editor/EditableText";
import { SectionEyebrow } from "./SectionEyebrow";

interface SectionHeaderProps {
  align?: "center" | "left";
  eyebrowFallback?: string;
  headingKey?: string;
  subheadingKey?: string;
  headingAs?: "h1" | "h2";
  size?: "hero" | "section" | "cta";
  headingMaxLength?: number;
  subheadingMaxLength?: number;
  className?: string;
}

const HEADING_CLASSES = {
  hero: "max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight @md:text-5xl @lg:text-6xl",
  section:
    "text-3xl font-bold tracking-tight @md:text-4xl @lg:text-[2.75rem] @lg:leading-tight",
  cta: "text-3xl font-bold tracking-tight @md:text-4xl @lg:text-5xl",
} as const;

const SUBHEADING_CLASSES = {
  hero: "max-w-xl text-lg leading-relaxed opacity-90",
  section: "text-lg leading-relaxed opacity-90",
  cta: "mx-auto max-w-xl text-lg leading-relaxed opacity-85",
} as const;

export function SectionHeader({
  align = "center",
  eyebrowFallback,
  headingKey = "heading",
  subheadingKey = "subheading",
  headingAs = "h2",
  size = "section",
  headingMaxLength,
  subheadingMaxLength,
  className = "",
}: SectionHeaderProps) {
  const alignClass =
    align === "center" ? "text-center items-center mx-auto" : "text-left items-start";
  const textAlign = align === "center" ? "text-center" : "text-left";
  const resolvedHeadingMaxLength = headingMaxLength ?? (size === "hero" ? 120 : size === "cta" ? 100 : 80);
  const resolvedSubheadingMaxLength =
    subheadingMaxLength ?? (size === "hero" ? 300 : 200);

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClass} ${className}`.trim()}>
      {eyebrowFallback ? (
        <SectionEyebrow fallback={eyebrowFallback} light={size === "cta"} />
      ) : null}
      <EditableText
        as={headingAs}
        dataKey={headingKey}
        maxLength={resolvedHeadingMaxLength}
        className={`${HEADING_CLASSES[size]} ${textAlign}`}
        themeTextRole={size === "cta" ? undefined : "title"}
      />
      <EditableText
        as="p"
        dataKey={subheadingKey}
        maxLength={resolvedSubheadingMaxLength}
        required={false}
        className={`${SUBHEADING_CLASSES[size]} ${textAlign}`}
        themeTextRole={size === "cta" ? undefined : "body"}
      />
    </div>
  );
}
