import Link from "next/link";
import { Layers, Palette, Rocket } from "lucide-react";

interface AuthShellProps {
  mode: "login" | "signup";
  children: React.ReactNode;
}

const features = [
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
            <Link href="/" className="platform-auth__logo">
              Website Builder
            </Link>
            <h1 className="platform-auth__headline">
              {isLogin ? "Welcome back" : "Start building today"}
            </h1>
            <p className="platform-auth__tagline">
              {isLogin
                ? "Sign in to manage your websites, edit drafts, and publish updates."
                : "Create beautiful multi-page sites with a visual editor and one-click publish."}
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
              {isLogin ? "Access your dashboard and website builder." : "Free to start — no credit card required."}
            </p>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
