import Link from "next/link";
import { Layers, Palette, Rocket, Sparkles } from "lucide-react";
import MarketingLogo from "@/components/marketing/MarketingLogo";

interface AuthShellProps {
  mode: "login" | "signup";
  admin?: boolean;
  children: React.ReactNode;
}

const features = [
  { icon: Sparkles, text: "AI website generation from a single prompt" },
  { icon: Layers, text: "Drag-and-drop section builder" },
  { icon: Palette, text: "Global themes, fonts, and styles" },
  { icon: Rocket, text: "Publish to your own live URL" },
];

export default function AuthShell({ mode, admin = false, children }: AuthShellProps) {
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
              {isLogin ? (admin ? "Admin sign in" : "Welcome back") : "Create your account"}
            </h1>
            <p className="platform-auth__tagline">
              {isLogin
                ? admin
                  ? "Sign in with an admin account to manage users, websites, and platform settings."
                  : "Sign in to manage your websites, edit drafts, and publish updates."
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
            <h2 className="platform-auth__title">{isLogin ? (admin ? "Admin sign in" : "Sign in") : "Create account"}</h2>
            <p className="platform-auth__subtitle">
              {isLogin
                ? admin
                  ? "Use your admin credentials to access the platform panel."
                  : "Access your dashboard and website builder."
                : "Free to start · No credit card required."}
            </p>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
