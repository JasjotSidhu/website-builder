"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

type AuthMode = "login" | "signup";

interface AuthModalContextValue {
  openLogin: (next?: string | null, error?: string | null) => void;
  openSignup: (prompt?: string | null, error?: string | null) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}

/** @deprecated Use useAuthModal */
export function useLoginModal(): AuthModalContextValue {
  return useAuthModal();
}

interface AuthModalProviderProps {
  children: ReactNode;
}

function AuthModalUrlSync({
  openLogin,
  openSignup,
}: {
  openLogin: AuthModalContextValue["openLogin"];
  openSignup: AuthModalContextValue["openSignup"];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLogin = searchParams.get("login") === "1";
    const isSignup = searchParams.get("signup") === "1";

    if (!isLogin && !isSignup) {
      return;
    }

    if (isLogin) {
      openLogin(searchParams.get("next"), searchParams.get("error"));
    } else {
      openSignup(searchParams.get("prompt"), searchParams.get("error"));
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("signup");
    params.delete("next");
    params.delete("prompt");
    params.delete("error");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [openLogin, openSignup, pathname, router, searchParams]);

  return null;
}

export default function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [initialError, setInitialError] = useState<string | null>(null);

  const openLogin = useCallback((next?: string | null, error?: string | null) => {
    setMode("login");
    setNextPath(next?.startsWith("/") ? next : null);
    setInitialPrompt(null);
    setInitialError(error ?? null);
    setOpen(true);
  }, []);

  const openSignup = useCallback((prompt?: string | null, error?: string | null) => {
    setMode("signup");
    setNextPath(null);
    setInitialPrompt(prompt?.trim() ? prompt : null);
    setInitialError(error ?? null);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setOpen(false);
    setInitialError(null);
    setInitialPrompt(null);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAuth();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeAuth, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const titleId = mode === "login" ? "auth-modal-login-title" : "auth-modal-signup-title";

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup, closeAuth }}>
      {children}
      <Suspense fallback={null}>
        <AuthModalUrlSync openLogin={openLogin} openSignup={openSignup} />
      </Suspense>
      {open ? (
        <div className="login-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="login-modal__backdrop"
            aria-label={mode === "login" ? "Close sign in" : "Close create account"}
            onClick={closeAuth}
          />
          <div className="login-modal__shell">
            <div className="login-modal__dialog">
              <div className="login-modal__header">
                <div>
                  {mode === "login" ? (
                    <>
                      <p className="login-modal__eyebrow">Welcome back</p>
                      <h2 id={titleId}>Sign in to Webeix</h2>
                      <p className="login-modal__lead">Access your dashboard and website builder.</p>
                    </>
                  ) : (
                    <>
                      <p className="login-modal__eyebrow">Get started free</p>
                      <h2 id={titleId}>Create your account</h2>
                      <p className="login-modal__lead">Free to start · No credit card required.</p>
                    </>
                  )}
                </div>
                <button type="button" className="login-modal__close" aria-label="Close" onClick={closeAuth}>
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>
              <div className="login-modal__body">
                {mode === "login" ? (
                  <LoginForm
                    initialError={initialError}
                    nextPath={nextPath}
                    onOpenSignup={() => openSignup(initialPrompt)}
                  />
                ) : (
                  <SignupForm
                    initialError={initialError}
                    initialPrompt={initialPrompt}
                    onOpenLogin={() => openLogin(nextPath)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AuthModalContext.Provider>
  );
}
