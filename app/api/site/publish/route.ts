import { NextResponse } from "next/server";
import { getSitePublishStatus, publishSiteData } from "@/lib/site-store";

export async function POST() {
  const publishedAt = await publishSiteData();
  const status = await getSitePublishStatus();
  return NextResponse.json({
    ok: true,
    publishedAt: publishedAt.toISOString(),
    hasUnpublishedChanges: status.hasUnpublishedChanges,
  });
}
