import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createWebsiteForUser, listWebsitesForUser } from "@/lib/website-store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const websites = await listWebsitesForUser(user.id);
  return NextResponse.json({
    websites: websites.map((website) => ({
      ...website,
      publishedAt: website.publishedAt?.toISOString() ?? null,
      updatedAt: website.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { name?: string; slug?: string; templateId?: string };
    const name = body.name?.trim() || "Untitled website";
    const website = await createWebsiteForUser(user.id, {
      name,
      slug: body.slug,
      templateId: body.templateId,
    });

    return NextResponse.json({
      website: {
        id: website.id,
        name: website.name,
        slug: website.slug,
        publishedAt: website.publishedAt?.toISOString() ?? null,
        hasUnpublishedChanges: false,
        updatedAt: website.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
