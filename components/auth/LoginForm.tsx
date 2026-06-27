"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { USER_ROLES } from "@/lib/auth/roles";
import AuthDivider from "./AuthDivider";
import GoogleSignInButton from "./GoogleSignInButton";

interface LoginFormProps {
  initialError?: string | null;
  nextPath?: string | null;
  onOpenSignup?: () => void;
}

function resolveLoginDestination(
  payload: { redirectTo?: "/admin" | "/dashboard"; user?: { role?: string } },
  nextPath: string | null,
): string {
  const defaultDestination =
    payload.redirectTo ?? (payload.user?.role === USER_ROLES.ADMIN ? "/admin" : "/dashboard");

  if (!nextPath?.startsWith("/") || nextPath.startsWith("//")) {
    return defaultDestination;
  }

  if (nextPath.startsWith("/admin")) {
    return defaultDestination === "/admin" ? nextPath : defaultDestination;
  }

  return nextPath;
}

export default function LoginForm({
  initialError = null,
  nextPath: nextPathProp,
  onOpenSignup,
}: LoginFormProps) {
  const searchParams = useSearchParams();
  const nextPath = nextPathProp !== undefined ? nextPathProp : searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await res.json()) as {
        error?: string;
        user?: { role?: string };
        redirectTo?: "/admin" | "/dashboard";
      };
      if (!res.ok) {
        setError(payload.error ?? "Login failed.");
        return;
      }

      window.location.assign(resolveLoginDestination(payload, nextPath));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="platform-auth__form">
      <GoogleSignInButton redirectTo={nextPath?.startsWith("/") ? nextPath : "/dashboard"} />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="platform-form">
        <div className="platform-field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="platform-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error ? <p className="platform-form__error">{error}</p> : null}
        <button type="submit" disabled={isSubmitting} className="platform-btn platform-btn--primary">
          {isSubmitting ? "Signing in…" : "Sign in with email"}
        </button>
      </form>

      <p className="platform-auth__switch">
        No account?{" "}
        {onOpenSignup ? (
          <button type="button" className="platform-auth__switch-btn" onClick={onOpenSignup}>
            Create one
          </button>
        ) : (
          <a href="/?signup=1">Create one</a>
        )}
      </p>
    </div>
  );
}
