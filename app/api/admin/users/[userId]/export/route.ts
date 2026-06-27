import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { exportAdminUserData } from "@/lib/admin-store";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    await requireAdminApiUser();
    const payload = await exportAdminUserData(params.userId);

    if (!payload) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const filename = `${payload.user.email.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-export.json`;

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
