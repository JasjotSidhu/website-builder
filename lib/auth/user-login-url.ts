export function isAdminLoginNext(next?: string | null): boolean {
  return typeof next === "string" && next.startsWith("/admin");
}

export function sanitizeAuthReturnPath(path?: string | null): string | null {
  if (!path?.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path.startsWith("/admin") || path.startsWith("/login")) {
    return null;
  }

  return path;
}

export function captureAuthReturnPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("login");
  url.searchParams.delete("signup");
  url.searchParams.delete("next");
  url.searchParams.delete("prompt");
  url.searchParams.delete("error");
  url.searchParams.delete("from");

  const query = url.searchParams.toString();
  return query ? `${url.pathname}?${query}` : url.pathname;
}

export function resolveAuthReferrerReturnPath(): string | null {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }

  try {
    const ref = new URL(document.referrer);
    if (ref.origin !== window.location.origin) {
      return null;
    }

    const path = `${ref.pathname}${ref.search}`;
    return sanitizeAuthReturnPath(path);
  } catch {
    return null;
  }
}

export function buildUserLoginUrl(options?: {
  next?: string | null;
  error?: string | null;
  from?: string | null;
}): string {
  const params = new URLSearchParams({ login: "1" });

  const next = options?.next?.trim();
  if (next?.startsWith("/") && !next.startsWith("//") && !isAdminLoginNext(next)) {
    params.set("next", next);
  }

  const from = sanitizeAuthReturnPath(options?.from);
  if (from) {
    params.set("from", from);
  }

  const error = options?.error?.trim();
  if (error) {
    params.set("error", error);
  }

  return `/?${params.toString()}`;
}

export function buildUserSignupUrl(options?: {
  prompt?: string | null;
  error?: string | null;
  from?: string | null;
}): string {
  const params = new URLSearchParams({ signup: "1" });

  const prompt = options?.prompt?.trim();
  if (prompt) {
    params.set("prompt", prompt);
  }

  const from = sanitizeAuthReturnPath(options?.from);
  if (from) {
    params.set("from", from);
  }

  const error = options?.error?.trim();
  if (error) {
    params.set("error", error);
  }

  return `/?${params.toString()}`;
}
