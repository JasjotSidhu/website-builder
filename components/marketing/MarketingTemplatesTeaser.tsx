import Link from "next/link";
import TemplatePreviewCard from "@/components/marketing/TemplatePreviewCard";
import { heroTemplates, type MarketingTemplate } from "@/lib/marketing/content";

export default function MarketingTemplatesTeaser() {
  return (
    <section id="templates" className="wx-section wx-section--dark">
      <div className="wx-container">
        <div className="wx-templates__head">
          <div>
            <div className="wx-eyebrow" style={{ color: "#f79433" }}>
              Not starting from AI?
            </div>
            <h2 className="wx-templates__title">Begin from a template instead.</h2>
          </div>
          <Link href="/templates" className="wx-btn wx-btn--outline-dark">
            Browse all templates →
          </Link>
        </div>

        <div className="wx-templates__grid">
          {heroTemplates.map((template) => (
            <TemplatePreviewCard
              key={template.name}
              template={{ ...template, category: template.category as MarketingTemplate["category"] }}
              variant="dark"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
