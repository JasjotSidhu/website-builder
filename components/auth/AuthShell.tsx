import Link from "next/link";
import { Layers, Palette, Rocket, Sparkles } from "lucide-react";
import MarketingLogo from "@/components/marketing/MarketingLogo";

interface AuthShellProps {
  mode: "login" | "signup";
  children: React.ReactNode;
}

const features = [
  { icon: Sparkles, text: "AI website generation from a single prompt" },
  { icon: Layers, text: "Drag-and-drop section builder" },
  { icon: Palette, text: "Global themes, fonts, and styles" },
  { icon: Rocket, text: "Publish to your own live URL" },
];

export default function AuthShell({ mode, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="platform-auth">
      <div className="platform-auth__layout">
        <aside className="platform-auth__brand" aria-hidden={false}>
          <div className="platform-auth__brand-inner">
            <div className="platform-auth__logo">
              <MarketingLogo variant="light" />
            </div>
            <h1 className="platform-auth__headline">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="platform-auth__tagline">
              {isLogin
                ? "Sign in to manage your websites, edit drafts, and publish updates."
                : "Generate a complete site with AI, then refine it with the simple visual editor."}
            </p>
            <ul className="platform-auth__features">
              {features.map(({ icon: Icon, text }) => (
                <li key={text}>
                  <span className="platform-auth__feature-icon">
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="platform-auth__panel">
          <div className="platform-auth__card">
            <Link href="/" className="platform-auth__back">
              ← Back to home
            </Link>
            <h2 className="platform-auth__title">{isLogin ? "Sign in" : "Create account"}</h2>
            <p className="platform-auth__subtitle">
              {isLogin ? "Access your dashboard and website builder." : "Free to start · No credit card required."}
            </p>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
