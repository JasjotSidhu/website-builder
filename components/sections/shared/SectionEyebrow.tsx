"use client";

import EditableText from "@/lib/editor/EditableText";

interface SectionEyebrowProps {
  fallback: string;
  dataKey?: string;
  light?: boolean;
  className?: string;
  maxLength?: number;
}

export function SectionEyebrow({
  fallback,
  dataKey = "eyebrow",
  light = false,
  className = "",
  maxLength = 40,
}: SectionEyebrowProps) {
  const eyebrowClass = [
    "section-eyebrow",
    light ? "section-eyebrow--light" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <EditableText
      as="span"
      dataKey={dataKey}
      maxLength={maxLength}
      required={false}
      fallback={fallback}
      className={eyebrowClass}
    />
  );
}
