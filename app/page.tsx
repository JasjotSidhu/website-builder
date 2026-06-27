import { redirect } from "next/navigation";
import MarketingHomeIntro from "@/components/marketing/MarketingHomeIntro";
import MarketingEditorSection from "@/components/marketing/MarketingEditorSection";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingPricingSection from "@/components/marketing/MarketingPricingSection";
import MarketingProductPeek from "@/components/marketing/MarketingProductPeek";
import MarketingTemplatesTeaser from "@/components/marketing/MarketingTemplatesTeaser";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="marketing">
      <MarketingNav />
      <main>
        <MarketingHomeIntro />
        <MarketingProductPeek />
        <MarketingEditorSection />
        <MarketingTemplatesTeaser />
        <MarketingPricingSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
