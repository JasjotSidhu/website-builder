import { prisma } from "@/lib/db";

export interface FormSubmissionRecord {
  id: string;
  websiteId: string;
  formId: string;
  formSlug: string;
  formName: string;
  data: Record<string, string>;
  read: boolean;
  createdAt: Date;
}

function parseSubmission(row: {
  id: string;
  websiteId: string;
  formId: string;
  formSlug: string;
  formName: string;
  data: string;
  read: boolean;
  createdAt: Date;
}): FormSubmissionRecord {
  return {
    id: row.id,
    websiteId: row.websiteId,
    formId: row.formId,
    formSlug: row.formSlug,
    formName: row.formName,
    data: JSON.parse(row.data) as Record<string, string>,
    read: row.read,
    createdAt: row.createdAt,
  };
}

export async function createFormSubmission(input: {
  websiteId: string;
  formId: string;
  formSlug: string;
  formName: string;
  data: Record<string, string>;
}) {
  const row = await prisma.formSubmission.create({
    data: {
      websiteId: input.websiteId,
      formId: input.formId,
      formSlug: input.formSlug,
      formName: input.formName,
      data: JSON.stringify(input.data),
    },
  });

  return parseSubmission(row);
}

export async function listFormSubmissionsForWebsite(websiteId: string) {
  const rows = await prisma.formSubmission.findMany({
    where: { websiteId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(parseSubmission);
}

export async function countFormSubmissionsForWebsite(websiteId: string) {
  return prisma.formSubmission.count({ where: { websiteId } });
}

export async function markFormSubmissionRead(websiteId: string, submissionId: string, read: boolean) {
  const row = await prisma.formSubmission.updateMany({
    where: { id: submissionId, websiteId },
    data: { read },
  });

  return row.count > 0;
}
