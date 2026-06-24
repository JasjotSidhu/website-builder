"use client";

import EditableLink from "@/lib/editor/EditableLink";
import EditableText from "@/lib/editor/EditableText";
import { SectionDataProvider, useSectionData } from "@/lib/editor/SectionDataContext";
import {
  useBackgroundStyle,
  useOverlayStyle,
  useSpacingStyle,
} from "@/lib/traits/hooks";

export { ctaBannerSchema } from "./schema";
export type { CtaBannerProps } from "./schema";

export default function CtaBanner() {
  const { data, updateField } = useSectionData();
  const button = (data.button as Record<string, unknown> | undefined) ?? {
    label: "",
    link: { type: "page", pageId: "home" },
  };
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();
  const overlayStyle = useOverlayStyle();

  return (
    <section
      className="relative text-white"
      style={{ ...bgStyle, ...spacingStyle }}
    >
      <div className="pointer-events-none absolute inset-0" style={overlayStyle} />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <EditableText as="span" dataKey="heading" maxLength={100} />
        </h2>
        <p className="mt-4 text-lg text-white/90">
          <EditableText as="span" dataKey="subheading" maxLength={200} required={false} />
        </p>
        <SectionDataProvider
          data={button}
          updateField={(key, value) =>
            updateField("button", { ...button, [key]: value })
          }
        >
          <EditableLink dataKey="link">
            <span className="mt-8 inline-block rounded-[var(--radius)] bg-white px-6 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-90">
              <EditableText as="span" dataKey="label" maxLength={40} />
            </span>
          </EditableLink>
        </SectionDataProvider>
      </div>
    </section>
  );
}
