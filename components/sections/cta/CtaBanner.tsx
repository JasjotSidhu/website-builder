"use client";

import EditableLink from "@/lib/editor/EditableLink";
import EditableText from "@/lib/editor/EditableText";
import { SectionDataProvider, useSectionData } from "@/lib/editor/SectionDataContext";
import { SectionShell } from "../shared/SectionShell";
import { SectionEyebrow } from "../shared/SectionEyebrow";

export { ctaBannerSchema } from "./schema";
export type { CtaBannerProps } from "./schema";

export default function CtaBanner() {
  const { data, updateField } = useSectionData();
  const button = (data.button as Record<string, unknown> | undefined) ?? {
    label: "",
    link: { type: "page", pageId: "home" },
  };

  return (
    <SectionShell className="cta-banner text-white">
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <SectionEyebrow fallback="Get started" light />
        <EditableText
          as="h2"
          dataKey="heading"
          maxLength={100}
          className="mt-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
        />
        <EditableText
          as="p"
          dataKey="subheading"
          maxLength={200}
          required={false}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85"
        />
        <SectionDataProvider
          data={button}
          updateField={(key, value) =>
            updateField("button", { ...button, [key]: value })
          }
          updateFields={(partial) =>
            updateField("button", { ...button, ...partial })
          }
        >
          <EditableLink dataKey="link">
            <span className="cta-button mt-10 inline-block">
              <EditableText as="span" dataKey="label" maxLength={40} inheritSectionColor={false} />
            </span>
          </EditableLink>
        </SectionDataProvider>
      </div>
    </SectionShell>
  );
}
