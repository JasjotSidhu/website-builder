import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Use POST /api/websites/{websiteId}/publish with authentication instead.",
    },
    { status: 410 },
  );
}
