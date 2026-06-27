"use client";

import { useState } from "react";
import { USER_ROLES } from "@/lib/auth/roles";
import AuthDivider from "./AuthDivider";
import GoogleSignInButton from "./GoogleSignInButton";

interface SignupFormProps {
  initialError?: string | null;
  initialPrompt?: string | null;
  onOpenLogin?: () => void;
}

export default function SignupForm({
  initialError = null,
  initialPrompt = null,
  onOpenLogin,
}: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await res.json()) as {
        error?: string;
        user?: { role?: string };
        redirectTo?: "/admin" | "/dashboard";
      };
      if (!res.ok) {
        setError(payload.error ?? "Signup failed.");
        return;
      }

      const destination =
        payload.redirectTo ?? (payload.user?.role === USER_ROLES.ADMIN ? "/admin" : "/dashboard");

      if (initialPrompt) {
        sessionStorage.setItem("webeix-signup-prompt", initialPrompt);
      }

      window.location.assign(destination);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="platform-auth__form">
      {initialPrompt ? (
        <p className="platform-auth__prompt-preview">
          Starting with: <span>{initialPrompt}</span>
        </p>
      ) : null}

      <GoogleSignInButton label="Sign up with Google" />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="platform-form">
        <div className="platform-field">
          <label htmlFor="signup-name">Name</label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="platform-field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="platform-field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        {error ? <p className="platform-form__error">{error}</p> : null}
        <button type="submit" disabled={isSubmitting} className="platform-btn platform-btn--primary">
          {isSubmitting ? "Creating account…" : "Create account with email"}
        </button>
      </form>

      <p className="platform-auth__switch">
        Already have an account?{" "}
        {onOpenLogin ? (
          <button type="button" className="platform-auth__switch-btn" onClick={onOpenLogin}>
            Sign in
          </button>
        ) : (
          <a href="/?login=1">Sign in</a>
        )}
      </p>
    </div>
  );
}
