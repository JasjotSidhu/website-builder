import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPostAuthRedirectPath, syncAdminRoleForUser } from "@/lib/auth/admin";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, sessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const role = await syncAdminRoleForUser(user.id, user.email, user.role);

    const token = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    const redirectTo = getPostAuthRedirectPath({ email: user.email, role });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
      redirectTo,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    throw error;
  }
}
