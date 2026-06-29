"use client";

import { SectionShell } from "../shared/SectionShell";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionButtons } from "../shared/SectionContent";

export { heroMinimalSchema } from "./schema-minimal";
export type { HeroMinimalProps } from "./schema-minimal";

export default function HeroMinimal() {
  return (
    <SectionShell>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-4 text-center @sm:px-6 @lg:px-8">
        <SectionHeader
          align="center"
          eyebrowFallback="Welcome"
          headingAs="h1"
          size="hero"
          className="max-w-none"
        />
        <SectionButtons />
      </div>
    </SectionShell>
  );
}
