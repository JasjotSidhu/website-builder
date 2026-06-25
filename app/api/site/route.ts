import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getDraftSiteData,
  getSitePublishStatus,
  parseAndValidateSiteBody,
  saveDraftSiteData,
} from "@/lib/site-store";

export async function GET() {
  const [draft, status] = await Promise.all([getDraftSiteData(), getSitePublishStatus()]);
  return NextResponse.json({
    site: draft,
    publishedAt: status.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: status.hasUnpublishedChanges,
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const site = parseAndValidateSiteBody(body);
    await saveDraftSiteData(site);
    const status = await getSitePublishStatus();
    return NextResponse.json({
      ok: true,
      hasUnpublishedChanges: status.hasUnpublishedChanges,
    });
  } catch (error) {
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
