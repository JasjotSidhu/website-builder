import { NextResponse } from "next/server";

const deprecatedMessage =
  "This endpoint is deprecated. Use /api/websites/{websiteId} with authentication instead.";

export async function GET() {
  return NextResponse.json({ error: deprecatedMessage }, { status: 410 });
}

export async function PUT() {
  return NextResponse.json({ error: deprecatedMessage }, { status: 410 });
}
