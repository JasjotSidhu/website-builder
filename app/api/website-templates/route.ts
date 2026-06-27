import { NextResponse } from "next/server";
import { WEBSITE_TEMPLATE_CATALOG } from "@/lib/templates/catalog";

export async function GET() {
  return NextResponse.json({ templates: WEBSITE_TEMPLATE_CATALOG });
}
