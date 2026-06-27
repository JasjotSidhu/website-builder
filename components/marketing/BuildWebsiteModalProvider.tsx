"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import BuildWebsiteIntentResume from "@/components/marketing/BuildWebsiteIntentResume";
import type { BuildStep } from "@/components/marketing/BuildWebsiteFlow";

interface BuildWebsiteModalContextValue {
  openBuildWebsite: (step?: BuildStep, options?: { prompt?: string }) => void;
  closeBuildWebsite: () => void;
}

const BuildWebsiteModalContext = createContext<BuildWebsiteModalContextValue | null>(null);

export function useBuildWebsiteFlow(): BuildWebsiteModalContextValue {
  const context = useContext(BuildWebsiteModalContext);
  if (!context) {
    throw new Error("useBuildWebsiteFlow must be used within BuildWebsiteModalProvider");
  }
  return context;
}

export default function BuildWebsiteModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const openBuildWebsite = useCallback(
    (initialStep: BuildStep = "options", options?: { prompt?: string }) => {
      const params = new URLSearchParams();
      if (initialStep !== "options") {
        params.set("step", initialStep);
      }
      const prompt = options?.prompt?.trim();
      if (prompt) {
        params.set("prompt", prompt);
      }

      const query = params.toString();
      router.push(query ? `/build?${query}` : "/build");
    },
    [router],
  );

  const closeBuildWebsite = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <BuildWebsiteModalContext.Provider value={{ openBuildWebsite, closeBuildWebsite }}>
      <BuildWebsiteIntentResume />
      {children}
    </BuildWebsiteModalContext.Provider>
  );
}
