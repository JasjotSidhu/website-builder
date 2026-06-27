import type { Metadata } from "next";
import { Suspense } from "react";
import BuildWebsiteFlow from "@/components/marketing/BuildWebsiteFlow";

export const metadata: Metadata = {
  title: "Build a website — Webeix",
  description: "Generate with AI, pick a template, migrate an existing site, or start from a blank canvas.",
};

export default function BuildPage() {
  return (
    <Suspense fallback={null}>
      <BuildWebsiteFlow />
    </Suspense>
  );
}
