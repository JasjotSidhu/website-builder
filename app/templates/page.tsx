import type { Metadata } from "next";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingTemplatesGallery from "@/components/marketing/MarketingTemplatesGallery";

export const metadata: Metadata = {
  title: "Templates — Webeix",
  description:
    "Pick a professionally designed starting point made for your industry, or let AI generate one from a prompt.",
};

export default function TemplatesPage() {
  return (
    <div className="marketing">
      <MarketingNav />
      <main className="wx-tpl-page">
        <section className="wx-container wx-tpl-page__hero">
          <h1 className="wx-tpl-page__title">
            Templates made for <span className="wx-serif wx-gradient-text">your industry.</span>
          </h1>
          <p className="wx-tpl-page__subtitle">
            Pick a professionally designed starting point, or skip ahead and let AI generate one from
            a prompt.
          </p>
        </section>

        <section className="wx-container wx-tpl-page__body">
          <MarketingTemplatesGallery />
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
