"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthDivider from "./AuthDivider";
import GoogleSignInButton from "./GoogleSignInButton";

interface LoginFormProps {
  googleEnabled: boolean;
  initialError?: string | null;
}

export default function LoginForm({ googleEnabled, initialError = null }: LoginFormProps) {
  const router = useRouter();
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

      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="platform-auth__form">
      {googleEnabled ? (
        <>
          <GoogleSignInButton />
          <AuthDivider />
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="platform-form">
        <div className="platform-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="platform-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
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
        <Link href="/signup">Create one</Link>
      </p>
    </div>
  );
}
