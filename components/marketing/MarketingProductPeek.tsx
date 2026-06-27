import { Sparkles } from "lucide-react";

export default function MarketingProductPeek() {
  return (
    <section className="wx-peek" aria-label="Example generated website">
      <div className="wx-peek__frame">
        <div className="wx-peek__chrome">
          <span className="wx-peek__dot" style={{ background: "#e9c4b6" }} aria-hidden />
          <span className="wx-peek__dot" style={{ background: "#f0dcc0" }} aria-hidden />
          <span className="wx-peek__dot" style={{ background: "#cfe6d6" }} aria-hidden />
          <span className="wx-peek__url">brightsmile-dental.webeix.site</span>
        </div>

        <div className="wx-peek__grid">
          <div className="wx-peek__content">
            <div className="wx-peek__site-name">Bright Smile Dental</div>
            <h2 className="wx-peek__headline">Confident smiles, gentle care.</h2>
            <p className="wx-peek__copy">
              Modern dentistry for the whole family, with same-week appointments and a calm, welcoming
              clinic.
            </p>
            <div className="wx-peek__actions">
              <span className="wx-peek__cta wx-peek__cta--primary">Book a visit</span>
              <span className="wx-peek__cta wx-peek__cta--secondary">Our services</span>
            </div>
          </div>

          <div className="wx-peek__ai">
            <div className="wx-peek__ai-inner">
              <div className="wx-peek__ai-icon">
                <Sparkles size={48} strokeWidth={1.75} aria-hidden />
              </div>
              <p className="wx-peek__ai-caption">Generated from one prompt in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
