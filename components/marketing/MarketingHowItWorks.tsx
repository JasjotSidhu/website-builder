import { Brush, LayoutGrid, Pencil, Sparkles, Zap } from "lucide-react";
import { howItWorksByVariant, type HeroVariant } from "@/lib/marketing/content";

const icons = {
  sparkles: Sparkles,
  zap: Zap,
  pencil: Pencil,
  grid: LayoutGrid,
  brush: Brush,
} as const;

interface MarketingHowItWorksProps {
  variant?: HeroVariant;
}

export default function MarketingHowItWorks({ variant = "ai" }: MarketingHowItWorksProps) {
  const content = howItWorksByVariant[variant];

  return (
    <section className="wx-section wx-section--warm">
      <div className="wx-container">
        <div className="wx-section__header">
          <div className="wx-eyebrow">How Webeix works</div>
          <h2 className="wx-section__title">
            {content.title}{" "}
            <span className="wx-serif wx-gradient-text">{content.titleEm}</span>
          </h2>
        </div>

        <div className="wx-steps">
          {content.steps.map((step) => {
            const Icon = icons[step.icon];
            return (
              <article key={step.step} className="wx-step">
                <div className="wx-step__icon">
                  <Icon size={22} strokeWidth={2} aria-hidden />
                </div>
                <div className="wx-step__num">STEP {step.step}</div>
                <h3 className="wx-step__title">{step.title}</h3>
                <p className="wx-step__body">{step.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
