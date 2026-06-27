"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { executeBuildWebsiteIntent, getBuildWebsiteIntent } from "@/lib/build-website-intent";

export default function BuildWebsiteIntentResume() {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    async function resume() {
      const intent = getBuildWebsiteIntent();
      if (!intent) {
        return;
      }

      const sessionRes = await fetch("/api/auth/me");
      if (!sessionRes.ok) {
        return;
      }

      startedRef.current = true;

      try {
        const builderUrl = await executeBuildWebsiteIntent(intent);
        router.push(builderUrl);
        router.refresh();
      } catch {
        startedRef.current = false;
      }
    }

    void resume();
  }, [router]);

  return null;
}
