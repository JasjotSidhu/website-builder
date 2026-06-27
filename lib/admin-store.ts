import { prisma } from "@/lib/db";
import { USER_ROLES, isUserRole, type UserRole } from "@/lib/auth/roles";
import { parseAndMigrateWebsiteData } from "@/lib/site-migrations";

function toUserRole(role: string): UserRole {
  return isUserRole(role) ? role : USER_ROLES.USER;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export interface PlatformStats {
  users: number;
  websites: number;
  publishedWebsites: number;
  submissionsLast7Days: number;
  submissionsLast30Days: number;
  signupsLast7Days: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  websiteCount: number;
  websites: { id: string; name: string; slug: string }[];
  createdAt: Date;
  lastActiveAt: Date | null;
}

export interface AdminUserDetail extends AdminUserSummary {
  websites: AdminWebsiteSummary[];
}

export interface AdminWebsiteSummary {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  publishedAt: Date | null;
  hasUnpublishedChanges: boolean;
  pageCount: number | null;
  submissionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminWebsiteDetail extends AdminWebsiteSummary {
  publicUrl: string;
}

export interface AdminSubmissionSummary {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteSlug: string;
  ownerEmail: string;
  formId: string;
  formSlug: string;
  formName: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: Date;
}

function countPages(raw: string): number | null {
  try {
    const site = parseAndMigrateWebsiteData(JSON.parse(raw));
    return site.pages.length;
  } catch {
    return null;
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const sevenDaysAgo = daysAgo(7);
  const thirtyDaysAgo = daysAgo(30);

  const [users, websites, publishedWebsites, submissionsLast7Days, submissionsLast30Days, signupsLast7Days] =
    await Promise.all([
      prisma.user.count(),
      prisma.website.count(),
      prisma.website.count({ where: { publishedAt: { not: null } } }),
      prisma.formSubmission.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.formSubmission.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

  return {
    users,
    websites,
    publishedWebsites,
    submissionsLast7Days,
    submissionsLast30Days,
    signupsLast7Days,
  };
}

export async function listAdminUsers(query?: string): Promise<AdminUserSummary[]> {
  const normalizedQuery = query?.trim();

  const rows = await prisma.user.findMany({
    where: normalizedQuery
      ? {
          OR: [
            { email: { contains: normalizedQuery } },
            { name: { contains: normalizedQuery } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { websites: true } },
      websites: {
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, slug: true },
      },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: toUserRole(row.role),
    websiteCount: row._count.websites,
    websites: row.websites,
    createdAt: row.createdAt,
    lastActiveAt: row.sessions[0]?.createdAt ?? null,
  }));
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { websites: true } },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      websites: {
        orderBy: { updatedAt: "desc" },
        include: {
          owner: { select: { email: true, name: true } },
          _count: { select: { formSubmissions: true } },
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: toUserRole(row.role),
    websiteCount: row._count.websites,
    createdAt: row.createdAt,
    lastActiveAt: row.sessions[0]?.createdAt ?? null,
    websites: row.websites.map((website) => ({
      id: website.id,
      name: website.name,
      slug: website.slug,
      ownerId: website.ownerId,
      ownerEmail: row.email,
      ownerName: row.name,
      publishedAt: website.publishedAt,
      hasUnpublishedChanges: website.draftData !== website.publishedData,
      pageCount: countPages(website.draftData),
      submissionCount: website._count.formSubmissions,
      createdAt: website.createdAt,
      updatedAt: website.updatedAt,
    })),
  };
}

export async function updateAdminUserRole(userId: string, role: UserRole): Promise<boolean> {
  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: { role },
  });
  return result.count > 0;
}

export interface AdminUserExportPayload {
  version: 1;
  exportedAt: string;
  user: {
    email: string;
    name: string | null;
  };
  websites: {
    id: string;
    name: string;
    slug: string;
    draftData: unknown;
    publishedData: unknown;
    publishedAt: string | null;
  }[];
}

export async function exportAdminUserData(userId: string): Promise<AdminUserExportPayload | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      websites: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: {
      email: row.email,
      name: row.name,
    },
    websites: row.websites.map((website) => ({
      id: website.id,
      name: website.name,
      slug: website.slug,
      draftData: JSON.parse(website.draftData) as unknown,
      publishedData: JSON.parse(website.publishedData) as unknown,
      publishedAt: website.publishedAt?.toISOString() ?? null,
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function importAdminUserData(
  userId: string,
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRecord(payload) || !isRecord(payload.user) || !Array.isArray(payload.websites)) {
    return { ok: false, error: "Invalid export file format." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { websites: { select: { id: true } } },
  });

  if (!user) {
    return { ok: false, error: "User not found." };
  }

  const ownedIds = new Set(user.websites.map((website) => website.id));
  const name = typeof payload.user.name === "string" ? payload.user.name.trim() || null : user.name;
  const websites = payload.websites;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { name },
    });

    for (const entry of websites) {
      if (!isRecord(entry) || typeof entry.id !== "string" || !ownedIds.has(entry.id)) {
        continue;
      }

      const draftData = entry.draftData;
      const publishedData = entry.publishedData;
      if (draftData === undefined || publishedData === undefined) {
        continue;
      }

      const parsedDraft = parseAndMigrateWebsiteData(draftData);
      const parsedPublished = parseAndMigrateWebsiteData(publishedData);
      const websiteName =
        typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : parsedDraft.meta.name;
      const publishedAt =
        typeof entry.publishedAt === "string" && entry.publishedAt
          ? new Date(entry.publishedAt)
          : null;

      await tx.website.update({
        where: { id: entry.id },
        data: {
          name: websiteName,
          draftData: JSON.stringify(parsedDraft),
          publishedData: JSON.stringify(parsedPublished),
          publishedAt,
        },
      });
    }
  });

  return { ok: true };
}

export async function deleteAdminUser(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    return { ok: false, error: "User not found." };
  }

  if (user.role === USER_ROLES.ADMIN) {
    return { ok: false, error: "Admin accounts cannot be deleted." };
  }

  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

export async function listAdminWebsites(query?: string): Promise<AdminWebsiteSummary[]> {
  const normalizedQuery = query?.trim();

  const rows = await prisma.website.findMany({
    where: normalizedQuery
      ? {
          OR: [
            { name: { contains: normalizedQuery } },
            { slug: { contains: normalizedQuery } },
            { owner: { email: { contains: normalizedQuery } } },
          ],
        }
      : undefined,
    include: {
      owner: { select: { email: true, name: true } },
      _count: { select: { formSubmissions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.ownerId,
    ownerEmail: row.owner.email,
    ownerName: row.owner.name,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.draftData !== row.publishedData,
    pageCount: countPages(row.draftData),
    submissionCount: row._count.formSubmissions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function getAdminWebsiteDetail(websiteId: string): Promise<AdminWebsiteDetail | null> {
  const row = await prisma.website.findUnique({
    where: { id: websiteId },
    include: {
      owner: { select: { email: true, name: true } },
      _count: { select: { formSubmissions: true } },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.ownerId,
    ownerEmail: row.owner.email,
    ownerName: row.owner.name,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: row.draftData !== row.publishedData,
    pageCount: countPages(row.draftData),
    submissionCount: row._count.formSubmissions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publicUrl: `/w/${row.slug}`,
  };
}

export async function deleteAdminWebsite(websiteId: string): Promise<boolean> {
  const result = await prisma.website.deleteMany({ where: { id: websiteId } });
  return result.count > 0;
}

export interface AdminWebsiteExportPayload {
  version: 1;
  exportedAt: string;
  website: {
    id: string;
    name: string;
    slug: string;
    draftData: unknown;
    publishedData: unknown;
    publishedAt: string | null;
  };
}

export async function exportAdminWebsiteData(websiteId: string): Promise<AdminWebsiteExportPayload | null> {
  const row = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!row) {
    return null;
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    website: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      draftData: JSON.parse(row.draftData) as unknown,
      publishedData: JSON.parse(row.publishedData) as unknown,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    },
  };
}

export async function importAdminWebsiteData(
  websiteId: string,
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRecord(payload) || !isRecord(payload.website)) {
    return { ok: false, error: "Invalid export file format." };
  }

  const websitePayload = payload.website;
  if (websitePayload.id !== websiteId) {
    return { ok: false, error: "This JSON file belongs to a different website." };
  }

  const row = await prisma.website.findUnique({ where: { id: websiteId } });
  if (!row) {
    return { ok: false, error: "Website not found." };
  }

  const draftData = websitePayload.draftData;
  const publishedData = websitePayload.publishedData;
  if (draftData === undefined || publishedData === undefined) {
    return { ok: false, error: "Export file is missing website data." };
  }

  const parsedDraft = parseAndMigrateWebsiteData(draftData);
  const parsedPublished = parseAndMigrateWebsiteData(publishedData);
  const name =
    typeof websitePayload.name === "string" && websitePayload.name.trim()
      ? websitePayload.name.trim()
      : parsedDraft.meta.name;
  const publishedAt =
    typeof websitePayload.publishedAt === "string" && websitePayload.publishedAt
      ? new Date(websitePayload.publishedAt)
      : null;

  await prisma.website.update({
    where: { id: websiteId },
    data: {
      name,
      draftData: JSON.stringify(parsedDraft),
      publishedData: JSON.stringify(parsedPublished),
      publishedAt,
    },
  });

  return { ok: true };
}

export async function listAdminSubmissions(options?: {
  query?: string;
  websiteId?: string;
}): Promise<AdminSubmissionSummary[]> {
  const normalizedQuery = options?.query?.trim();
  const websiteId = options?.websiteId?.trim();

  const rows = await prisma.formSubmission.findMany({
    where: {
      ...(websiteId ? { websiteId } : {}),
      ...(normalizedQuery
        ? {
            OR: [
              { formName: { contains: normalizedQuery } },
              { formSlug: { contains: normalizedQuery } },
              { data: { contains: normalizedQuery } },
              { website: { name: { contains: normalizedQuery } } },
              { website: { slug: { contains: normalizedQuery } } },
              { website: { owner: { email: { contains: normalizedQuery } } } },
            ],
          }
        : {}),
    },
    include: {
      website: {
        select: {
          name: true,
          slug: true,
          owner: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    websiteId: row.websiteId,
    websiteName: row.website.name,
    websiteSlug: row.website.slug,
    ownerEmail: row.website.owner.email,
    formId: row.formId,
    formSlug: row.formSlug,
    formName: row.formName,
    data: JSON.parse(row.data) as Record<string, string>,
    read: row.read,
    createdAt: row.createdAt,
  }));
}

export async function markAdminSubmissionRead(submissionId: string, read: boolean): Promise<boolean> {
  const result = await prisma.formSubmission.updateMany({
    where: { id: submissionId },
    data: { read },
  });
  return result.count > 0;
}
