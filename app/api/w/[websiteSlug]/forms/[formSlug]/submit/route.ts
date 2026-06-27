import { NextResponse } from "next/server";
import { findFormBySlug, validateSubmissionPayload } from "@/lib/forms/forms";
import { createFormSubmission } from "@/lib/form-submissions-store";
import { getPublishedWebsiteDataBySlug } from "@/lib/website-store";

export async function POST(
  req: Request,
  { params }: { params: { websiteSlug: string; formSlug: string } },
) {
  try {
    const site = await getPublishedWebsiteDataBySlug(params.websiteSlug);
    if (!site) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }

    const form = findFormBySlug(site, params.formSlug);
    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    if (typeof body._hp === "string" && body._hp.trim()) {
      return NextResponse.json({ ok: true, message: form.settings.successMessage });
    }

    const { valid, data, errors } = validateSubmissionPayload(form, body);
    if (!valid) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    await createFormSubmission({
      websiteId: site.siteId,
      formId: form.id,
      formSlug: form.slug,
      formName: form.name,
      data,
    });

    return NextResponse.json({ ok: true, message: form.settings.successMessage });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to submit form." }, { status: 500 });
  }
}
