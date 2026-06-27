import Link from "next/link";
import MarketingLogo from "@/components/marketing/MarketingLogo";
import {
  footerCategoryLinks,
  footerCompanyLinks,
  footerProductLinks,
} from "@/lib/marketing/content";

export default function MarketingFooter() {
  return (
    <footer className="wx-footer">
      <div className="wx-container wx-footer__grid">
        <div className="wx-footer__brand">
          <MarketingLogo variant="light" />
          <p>
            The easiest way to launch a professional website. Describe it, or pick a template,
            customize it to your brand — no code needed.
          </p>
        </div>

        <div>
          <div className="wx-footer__col-title">Product</div>
          <div className="wx-footer__links">
            {footerProductLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="wx-footer__col-title">Categories</div>
          <div className="wx-footer__links">
            {footerCategoryLinks.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="wx-footer__col-title">Company</div>
          <div className="wx-footer__links">
            {footerCompanyLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="wx-container wx-footer__bottom">Webeix.com © 2026 · All rights reserved</div>
    </footer>
  );
}
