"use client";

import Canvas from "./Canvas";
import SectionOutline from "./SectionOutline";
import ThemePanel from "./ThemePanel";
import { useBuilderStore } from "@/store/builderStore";

export default function BuilderLayout() {
  const siteName = useBuilderStore((state) => state.site.meta.name);

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold text-gray-900">{siteName}</h1>
          <p className="text-xs text-gray-500">Page builder — click any text to edit inline</p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_300px]">
        <aside className="border-r border-gray-200 bg-white">
          <SectionOutline />
        </aside>

        <section className="min-h-0">
          <Canvas />
        </section>

        <aside className="border-l border-gray-200 bg-white">
          <ThemePanel />
        </aside>
      </div>
    </div>
  );
}
