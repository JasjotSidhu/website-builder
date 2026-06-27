"use client";

import { useMemo, useState } from "react";
import TemplatePreviewCard from "@/components/marketing/TemplatePreviewCard";
import {
  marketingTemplates,
  templateCategories,
  type TemplateCategory,
} from "@/lib/marketing/content";

export default function MarketingTemplatesGallery() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("All");

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "All") {
      return marketingTemplates;
    }
    return marketingTemplates.filter((template) => template.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <div className="wx-tpl-page__filters" role="tablist" aria-label="Template categories">
        {templateCategories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`wx-tpl-page__filter${isActive ? " wx-tpl-page__filter--active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="wx-tpl-page__grid">
        {filteredTemplates.map((template) => (
          <TemplatePreviewCard key={template.name} template={template} variant="light" />
        ))}
      </div>
    </>
  );
}
