import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import {
  getDraftWebsiteData,
  getWebsitePublishStatus,
  parseAndValidateWebsiteBody,
  saveDraftWebsiteData,
  WebsiteAccessError,
} from "@/lib/website-store";

interface RouteContext {
  params: { websiteId: string };
}

export async function GET(_req: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [draft, status] = await Promise.all([
      getDraftWebsiteData(user.id, context.params.websiteId),
      getWebsitePublishStatus(user.id, context.params.websiteId),
    ]);

    return NextResponse.json({
      site: draft,
      websiteSlug: status.slug,
      publishedAt: status.publishedAt?.toISOString() ?? null,
      hasUnpublishedChanges: status.hasUnpublishedChanges,
    });
  } catch (error) {
    if (error instanceof WebsiteAccessError) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function PUT(req: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const site = parseAndValidateWebsiteBody(body);
    await saveDraftWebsiteData(user.id, context.params.websiteId, site);
    const status = await getWebsitePublishStatus(user.id, context.params.websiteId);

    return NextResponse.json({
      ok: true,
      hasUnpublishedChanges: status.hasUnpublishedChanges,
    });
  } catch (error) {
    if (error instanceof WebsiteAccessError) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => issue.message).join("; ");
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    throw error;
  }
}
