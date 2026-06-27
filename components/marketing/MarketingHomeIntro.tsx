"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildUserSignupUrl } from "@/lib/auth/user-login-url";
import {
  FileText,
  Home,
  Image,
  LayoutGrid,
  Plus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import MarketingHowItWorks from "@/components/marketing/MarketingHowItWorks";
import {
  heroCategories,
  heroExamples,
  type HeroVariant,
} from "@/lib/marketing/content";

const categoryIcons = {
  plus: Plus,
  home: Home,
  image: Image,
  grid: LayoutGrid,
  bolt: Zap,
  users: Users,
  file: FileText,
  sparkles: Sparkles,
} as const;

export default function MarketingHomeIntro() {
  const router = useRouter();
  const [variant, setVariant] = useState<HeroVariant>("ai");
  const [prompt, setPrompt] = useState("");

  function startBuilding(nextPrompt?: string) {
    const value = (nextPrompt ?? prompt).trim() || "Create a modern website for my dental clinic";
    router.push(buildUserSignupUrl({ prompt: value }));
  }

  return (
    <>
      <section className="wx-hero wx-container">
        <div className="wx-hero__glow wx-hero__glow--right" aria-hidden />
        <div className="wx-hero__glow wx-hero__glow--left" aria-hidden />

        <div className="wx-hero__switch" role="tablist" aria-label="Homepage mode">
          <button
            type="button"
            role="tab"
            aria-selected={variant === "ai"}
            className={`wx-hero__switch-btn${variant === "ai" ? " wx-hero__switch-btn--active" : ""}`}
            onClick={() => setVariant("ai")}
          >
            <Sparkles size={14} strokeWidth={2} aria-hidden />
            AI generation
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={variant === "category"}
            className={`wx-hero__switch-btn${variant === "category" ? " wx-hero__switch-btn--active" : ""}`}
            onClick={() => setVariant("category")}
          >
            Browse by category
          </button>
        </div>

        {variant === "ai" ? (
          <div className="wx-hero__panel">
            <h1 className="wx-hero__title">
              Describe your idea.
              <br />
              <span className="wx-serif wx-gradient-text">Webeix builds the website.</span>
            </h1>

            <p className="wx-hero__subtitle">
              Start with a sentence and watch a complete, on-brand website appear — then refine it
              visually with the simple inline editing Webeix is known for.
            </p>

            <div className="wx-hero__prompt">
              <div className="wx-hero__prompt-box">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Create a modern website for my dental clinic…"
                  rows={2}
                  aria-label="Describe your website idea"
                />
                <button
                  type="button"
                  className="wx-btn wx-btn--primary wx-hero__generate"
                  onClick={() => startBuilding()}
                >
                  Generate <Sparkles size={15} strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div className="wx-hero__examples">
                <span className="wx-hero__examples-label">Try:</span>
                {heroExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="wx-hero__example"
                    onClick={() => {
                      const next = `Create a website for my ${example.toLowerCase()}`;
                      setPrompt(next);
                      startBuilding(next);
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <p className="wx-hero__note">
              Free to start · No credit card · Your site stays fully editable
            </p>
          </div>
        ) : (
          <div className="wx-hero__panel">
            <div className="wx-hero__badge wx-hero__badge--muted">
              200+ templates · built for your industry
            </div>

            <h1 className="wx-hero__title">
              Launch a professional
              <br />
              <span className="wx-serif wx-gradient-text">website, faster.</span>
            </h1>

            <p className="wx-hero__subtitle">
              Pick your industry to see templates made for it — pre-built with the sections you need,
              ready to customize and publish.
            </p>

            <div className="wx-hero__categories">
              <div className="wx-hero__categories-label">Choose your category</div>
              <div className="wx-hero__categories-grid">
                {heroCategories.map((category) => {
                  const Icon = categoryIcons[category.icon];
                  return (
                    <Link
                      key={category.label}
                      href="/templates"
                      className="wx-hero__category"
                    >
                      <span
                        className="wx-hero__category-icon"
                        style={{ background: category.tint, color: category.accent }}
                      >
                        <Icon size={20} strokeWidth={2} aria-hidden />
                      </span>
                      <span className="wx-hero__category-label">{category.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="wx-hero__category-actions">
              <Link href="/templates" className="wx-btn wx-btn--primary">
                Browse all templates <span aria-hidden>→</span>
              </Link>
              <span className="wx-hero__blank">
                or{" "}
                <Link href="/?signup=1" className="wx-hero__blank-link">
                  start from blank
                </Link>
              </span>
            </div>
          </div>
        )}
      </section>

      <MarketingHowItWorks variant={variant} />
    </>
  );
}
