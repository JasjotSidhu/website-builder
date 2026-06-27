import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { exportAdminWebsiteData } from "@/lib/admin-store";

export async function GET(
  _req: Request,
  { params }: { params: { websiteId: string } },
) {
  try {
    await requireAdminApiUser();
    const payload = await exportAdminWebsiteData(params.websiteId);

    if (!payload) {
      return NextResponse.json({ error: "Website not found." }, { status: 404 });
    }

    const filename = `${payload.website.slug}-export.json`;

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
