import { NextResponse } from "next/server";
import { AdminAccessError, requireAdminApiUser } from "@/lib/auth/admin";
import { getPlatformStats } from "@/lib/admin-store";

export async function GET() {
  try {
    await requireAdminApiUser();
    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
