"use client";

import EditableText from "@/lib/editor/EditableText";

interface SectionHeaderProps {
  align?: "center" | "left";
  eyebrow?: string;
  headingKey?: string;
  subheadingKey?: string;
  headingMaxLength?: number;
  subheadingMaxLength?: number;
}

export function SectionHeader({
  align = "center",
  eyebrow,
  headingKey = "heading",
  subheadingKey = "subheading",
  headingMaxLength = 80,
  subheadingMaxLength = 200,
}: SectionHeaderProps) {
  const alignClass =
    align === "center" ? "text-center items-center mx-auto" : "text-left items-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClass}`}>
      {eyebrow ? (
        <span className="section-eyebrow">{eyebrow}</span>
      ) : null}
      <EditableText
        as="h2"
        dataKey={headingKey}
        maxLength={headingMaxLength}
        className={`text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-tight ${align === "center" ? "text-center" : "text-left"}`}
      />
      <EditableText
        as="p"
        dataKey={subheadingKey}
        maxLength={subheadingMaxLength}
        required={false}
        className={`text-lg leading-relaxed opacity-90 ${align === "center" ? "text-center" : "text-left"}`}
      />
    </div>
  );
}
