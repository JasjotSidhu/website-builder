export function isAdminLoginNext(next?: string | null): boolean {
  return typeof next === "string" && next.startsWith("/admin");
}

export function buildUserLoginUrl(options?: { next?: string | null; error?: string | null }): string {
  const params = new URLSearchParams({ login: "1" });

  const next = options?.next?.trim();
  if (next?.startsWith("/") && !next.startsWith("//") && !isAdminLoginNext(next)) {
    params.set("next", next);
  }

  const error = options?.error?.trim();
  if (error) {
    params.set("error", error);
  }

  return `/?${params.toString()}`;
}

export function buildUserSignupUrl(options?: { prompt?: string | null; error?: string | null }): string {
  const params = new URLSearchParams({ signup: "1" });

  const prompt = options?.prompt?.trim();
  if (prompt) {
    params.set("prompt", prompt);
  }

  const error = options?.error?.trim();
  if (error) {
    params.set("error", error);
  }

  return `/?${params.toString()}`;
}
