import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { importAdminWebsiteData } from "@/lib/admin-store";

export async function PUT(
  req: Request,
  { params }: { params: { websiteId: string } },
) {
  try {
    await requireAdminApiUser();
    const payload = await req.json();
    const result = await importAdminWebsiteData(params.websiteId, payload);

    if (!result.ok) {
      const status = result.error === "Website not found." ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true });
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
