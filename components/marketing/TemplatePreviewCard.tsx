import Link from "next/link";
import type { MarketingTemplate } from "@/lib/marketing/content";

interface TemplatePreviewCardProps {
  template: MarketingTemplate;
  variant?: "light" | "dark";
}

export default function TemplatePreviewCard({
  template,
  variant = "light",
}: TemplatePreviewCardProps) {
  const isLight = variant === "light";

  return (
    <article className={`wx-tpl-card${isLight ? " wx-tpl-card--light" : ""}`}>
      <div className="wx-tpl-card__preview" style={{ background: template.tint }}>
        <div className={`wx-tpl-card__browser${isLight ? " wx-tpl-card__browser--light" : ""}`}>
          <span className="wx-tpl-card__accent-bar" style={{ background: template.accent }} />
          <span className="wx-tpl-card__browser-dots">
            <span />
            <span />
            <span className="wx-tpl-card__browser-cta" style={{ background: template.accent }} />
          </span>
        </div>
        <div className={`wx-tpl-card__mock${isLight ? " wx-tpl-card__mock--light" : ""}`}>
          <span className="wx-tpl-card__line wx-tpl-card__line--title" />
          <span className="wx-tpl-card__line wx-tpl-card__line--body" />
          <span className="wx-tpl-card__pill" style={{ background: template.accent }} />
        </div>
      </div>

      <div className={`wx-tpl-card__meta${isLight ? " wx-tpl-card__meta--light" : ""}`}>
        <div>
          <div className="wx-tpl-card__name">{template.name}</div>
          <div className="wx-tpl-card__cat">{template.category}</div>
        </div>
        {isLight ? (
          <Link href="/?signup=1" className="wx-tpl-card__use">
            Use
          </Link>
        ) : null}
      </div>
    </article>
  );
}
