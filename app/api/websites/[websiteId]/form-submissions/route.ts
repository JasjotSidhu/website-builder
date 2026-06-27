import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  listFormSubmissionsForWebsite,
  markFormSubmissionRead,
} from "@/lib/form-submissions-store";
import { getOwnedWebsite } from "@/lib/website-store";

export async function GET(
  _req: Request,
  { params }: { params: { websiteId: string } },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getOwnedWebsite(user.id, params.websiteId);
    const submissions = await listFormSubmissionsForWebsite(params.websiteId);
    return NextResponse.json({
      submissions: submissions.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { websiteId: string } },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getOwnedWebsite(user.id, params.websiteId);
    const body = (await req.json()) as { submissionId?: string; read?: boolean };
    if (!body.submissionId || typeof body.read !== "boolean") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const updated = await markFormSubmissionRead(params.websiteId, body.submissionId, body.read);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }
}
