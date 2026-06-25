import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateSiteRow, getSiteData } from "@/lib/site-store";
import { websiteSchema } from "@/lib/schemas";
import { normalizeSiteSections } from "@/lib/traits/normalize";
import type { WebsiteData } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getSiteData());
}

export async function PUT(req: Request) {
  const body = await req.json();
  const site = normalizeSiteSections(websiteSchema.parse(body) as WebsiteData);
  const row = await getOrCreateSiteRow();

  await prisma.site.update({
    where: { id: row.id },
    data: {
      data: JSON.stringify(site),
      name: site.meta?.name ?? row.name,
    },
  });

  return NextResponse.json({ ok: true });
}
