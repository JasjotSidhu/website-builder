"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  captureAuthReturnPath,
  resolveAuthReferrerReturnPath,
  sanitizeAuthReturnPath,
} from "@/lib/auth/user-login-url";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AUTH_RETURN_PATH_KEY = "wb_auth_return_path";

type AuthMode = "login" | "signup";

interface AuthModalContextValue {
  openLogin: (next?: string | null, error?: string | null, from?: string | null) => void;
  openSignup: (prompt?: string | null, error?: string | null, from?: string | null) => void;
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

function resolveStoredReturnPath(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sanitizeAuthReturnPath(sessionStorage.getItem(AUTH_RETURN_PATH_KEY));
}

function AuthModalReturnPathTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("login") === "1" || searchParams.get("signup") === "1") {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const query = params.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (!path.startsWith("/admin") && !path.startsWith("/login")) {
      sessionStorage.setItem(AUTH_RETURN_PATH_KEY, path);
    }
  }, [pathname, searchParams]);

  return null;
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

    const from =
      sanitizeAuthReturnPath(searchParams.get("from")) ??
      resolveStoredReturnPath() ??
      resolveAuthReferrerReturnPath() ??
      captureAuthReturnPath();

    if (isLogin) {
      openLogin(searchParams.get("next"), searchParams.get("error"), from);
    } else {
      openSignup(searchParams.get("prompt"), searchParams.get("error"), from);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("signup");
    params.delete("next");
    params.delete("prompt");
    params.delete("error");
    params.delete("from");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [openLogin, openSignup, pathname, router, searchParams]);

  return null;
}

export default function AuthModalProvider({ children }: AuthModalProviderProps) {
  const router = useRouter();
  const returnPathRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [initialError, setInitialError] = useState<string | null>(null);

  const openLogin = useCallback((next?: string | null, error?: string | null, from?: string | null) => {
    returnPathRef.current = sanitizeAuthReturnPath(from) ?? captureAuthReturnPath();

    setMode("login");
    setNextPath(next?.startsWith("/") ? next : null);
    setInitialPrompt(null);
    setInitialError(error ?? null);
    setOpen(true);
  }, []);

  const openSignup = useCallback((prompt?: string | null, error?: string | null, from?: string | null) => {
    returnPathRef.current = sanitizeAuthReturnPath(from) ?? captureAuthReturnPath();

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

    const target = returnPathRef.current;
    returnPathRef.current = null;

    if (!target || typeof window === "undefined") {
      return;
    }

    const current = `${window.location.pathname}${window.location.search}`;
    if (target !== current) {
      router.replace(target, { scroll: false });
    }
  }, [router]);

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
        <AuthModalReturnPathTracker />
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
                    onOpenSignup={() => openSignup(initialPrompt, null, returnPathRef.current)}
                  />
                ) : (
                  <SignupForm
                    initialError={initialError}
                    initialPrompt={initialPrompt}
                    onOpenLogin={() => openLogin(nextPath, null, returnPathRef.current)}
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
