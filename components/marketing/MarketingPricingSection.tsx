import Link from "next/link";
import { addOns, planFeatures } from "@/lib/marketing/content";

export default function MarketingPricingSection() {
  return (
    <section id="pricing" className="wx-section">
      <div className="wx-container">
        <div className="wx-pricing__intro">
          <div className="wx-eyebrow">Pricing</div>
          <h2 className="wx-section__title">
            Professional websites at the{" "}
            <span className="wx-serif wx-gradient-text">lowest cost.</span>
          </h2>
          <p className="wx-pricing__subtitle">
            Everything you need to build, publish and manage your site — transparent and honest.
          </p>
        </div>

        <div className="wx-pricing__plans">
          <article className="wx-plan">
            <div className="wx-plan__price">
              $5<span className="wx-plan__period">/month</span>
            </div>
            <div className="wx-plan__label">MONTHLY</div>
            <div className="wx-plan__divider" />
            <p className="wx-plan__features">
              All templates · 50 pages · Inline editing · Custom branding · SEO-ready
            </p>
            <Link href="/?signup=1" className="wx-btn wx-btn--ghost" style={{ marginTop: "1.75rem" }}>
              Start free trial
            </Link>
          </article>

          <article className="wx-plan wx-plan--featured">
            <span className="wx-plan__badge">BEST VALUE</span>
            <div className="wx-plan__price">
              $60<span className="wx-plan__period">/year</span>
            </div>
            <div className="wx-plan__label">ANNUAL</div>
            <div className="wx-plan__divider" />
            <p className="wx-plan__features">
              Everything in monthly · 15-day full free trial · Priority generation
            </p>
            <Link href="/?signup=1" className="wx-btn wx-btn--primary" style={{ marginTop: "1.75rem" }}>
              Start free trial
            </Link>
          </article>
        </div>

        <div className="wx-pricing__plans" style={{ marginTop: "1.375rem", maxWidth: "57.5rem" }}>
          <article className="wx-plan" style={{ gridColumn: "1 / -1" }}>
            <div className="wx-plan__label" style={{ marginTop: 0 }}>
              EVERY PLAN INCLUDES
            </div>
            <div className="wx-plan__divider" />
            <p className="wx-plan__features">{planFeatures.join(" · ")}</p>
          </article>
        </div>

        <div className="wx-pricing__addons">
          <div className="wx-pricing__addons-head">
            <h3 className="wx-pricing__addons-title">Optional add-ons</h3>
            <p className="wx-pricing__addons-sub">For owners who&apos;d rather we do it for them.</p>
          </div>

          <div className="wx-addons">
            {addOns.map((addon) => (
              <article key={addon.name} className="wx-addon">
                <div className="wx-addon__tag">{addon.tag}</div>
                <h4 className="wx-addon__name">{addon.name}</h4>
                <div className="wx-addon__price">
                  {addon.price}
                  <span className="wx-addon__sub"> {addon.sub}</span>
                </div>
                <div className="wx-plan__divider" />
                <ul className="wx-addon__points">
                  {addon.points.map((point) => (
                    <li key={point}>
                      <span aria-hidden>✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
