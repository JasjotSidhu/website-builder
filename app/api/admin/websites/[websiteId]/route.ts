import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { deleteAdminWebsite } from "@/lib/admin-store";

export async function DELETE(
  _req: Request,
  { params }: { params: { websiteId: string } },
) {
  try {
    await requireAdminApiUser();
    const deleted = await deleteAdminWebsite(params.websiteId);
    if (!deleted) {
      return NextResponse.json({ error: "Website not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
