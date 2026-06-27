import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { USER_ROLES } from "@/lib/auth/roles";
import { deleteAdminUser, updateAdminUserRole } from "@/lib/admin-store";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const admin = await requireAdminApiUser();
    const body = (await req.json()) as { role?: string };
    const role = body.role === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER;

    if (admin.id === params.userId && role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: "You cannot remove your own admin access." }, { status: 400 });
    }

    const updated = await updateAdminUserRole(params.userId, role);
    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, role });
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

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const admin = await requireAdminApiUser();

    if (admin.id === params.userId) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const result = await deleteAdminUser(params.userId);
    if (!result.ok) {
      const status = result.error === "User not found." ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
