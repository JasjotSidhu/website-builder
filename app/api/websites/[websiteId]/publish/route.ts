import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  getWebsitePublishStatus,
  publishWebsiteData,
  WebsiteAccessError,
} from "@/lib/website-store";

interface RouteContext {
  params: { websiteId: string };
}

export async function POST(_req: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const publishedAt = await publishWebsiteData(user.id, context.params.websiteId);
    const status = await getWebsitePublishStatus(user.id, context.params.websiteId);

    return NextResponse.json({
      ok: true,
      publishedAt: publishedAt.toISOString(),
      hasUnpublishedChanges: status.hasUnpublishedChanges,
    });
  } catch (error) {
    if (error instanceof WebsiteAccessError) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    throw error;
  }
}
