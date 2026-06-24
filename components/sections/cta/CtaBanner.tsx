"use client";

import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";
import { SectionShell } from "../shared/SectionShell";

export { ctaBannerSchema } from "./schema";
export type { CtaBannerProps } from "./schema";

export default function CtaBanner() {
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
        <SectionHeader
          align="center"
          eyebrowFallback="Get started"
          size="cta"
          className="mx-auto max-w-3xl"
        />
        <SectionButtons
          appearance="cta"
          maxButtons={1}
          showAdd={false}
          showRemove={false}
          showVariant={false}
        />
      </div>
    </SectionShell>
  );
}
