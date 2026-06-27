import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { USER_ROLES, type UserRole } from "./roles";
import { getSessionUser, type SessionUser } from "./session";

function normalizeAdminEmailEntry(entry: string): string {
  return entry.trim().replace(/^["']+|["']+$/g, "").toLowerCase();
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map(normalizeAdminEmailEntry)
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function resolveUserRole(email: string, dbRole?: string | null): UserRole {
  if (isAdminEmail(email)) {
    return USER_ROLES.ADMIN;
  }
  if (dbRole === USER_ROLES.ADMIN) {
    return USER_ROLES.ADMIN;
  }
  return USER_ROLES.USER;
}

export function isAdminUser(user: Pick<SessionUser, "email" | "role">): boolean {
  return resolveUserRole(user.email, user.role) === USER_ROLES.ADMIN;
}

export function getPostAuthRedirectPath(user: Pick<SessionUser, "email" | "role">): "/admin" | "/dashboard" {
  return isAdminUser(user) ? "/admin" : "/dashboard";
}

export async function syncAdminRoleForUser(
  userId: string,
  email: string,
  currentRole?: string | null,
): Promise<UserRole> {
  const role = resolveUserRole(email, currentRole);

  if (role === USER_ROLES.ADMIN && currentRole !== USER_ROLES.ADMIN) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: USER_ROLES.ADMIN },
    });
  }

  return role;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireAdminApiUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AdminAccessError("Unauthorized", 401);
  }
  if (!isAdminUser(user)) {
    throw new AdminAccessError("Forbidden", 403);
  }
  return user;
}

export class AdminAccessError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminAccessError";
    this.status = status;
  }
}
