import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { markAdminSubmissionRead } from "@/lib/admin-store";

export async function PATCH(
  req: Request,
  { params }: { params: { submissionId: string } },
) {
  try {
    await requireAdminApiUser();
    const body = (await req.json()) as { read?: boolean };
    if (typeof body.read !== "boolean") {
      return NextResponse.json({ error: "read must be a boolean." }, { status: 400 });
    }

    const updated = await markAdminSubmissionRead(params.submissionId, body.read);
    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, read: body.read });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    throw error;
  }
}
