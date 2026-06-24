"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import {
  useBackgroundStyle,
  useGridStyle,
  useSpacingStyle,
} from "@/lib/traits/hooks";

export { testimonialsGridSchema } from "./schema";
export type { TestimonialsGridProps } from "./schema";

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export default function TestimonialsGrid() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const testimonials = (data.testimonials as TestimonialItem[] | undefined) ?? [];
  const gridStyle = useGridStyle();
  const bgStyle = useBackgroundStyle();
  const spacingStyle = useSpacingStyle();

  return (
    <section style={{ ...bgStyle, ...spacingStyle }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2
            className="text-3xl font-bold text-[var(--color-text)] md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <EditableText as="span" dataKey="heading" maxLength={80} />
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text)] opacity-85">
            <EditableText as="span" dataKey="subheading" maxLength={200} required={false} />
          </p>
        </div>

        <div style={gridStyle}>
          {testimonials.map((item, index) => (
            <SectionDataProvider
              key={`testimonial-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => {
                const next = [...testimonials];
                next[index] = { ...next[index], [key]: value };
                updateField("testimonials", next);
              }}
            >
              <article className="relative flex h-full flex-col rounded-[var(--radius)] bg-[var(--color-background)] p-6 shadow-sm ring-1 ring-black/5">
                {isEditing ? (
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    onClick={() =>
                      updateField(
                        "testimonials",
                        testimonials.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                ) : null}
                <blockquote className="flex-1 text-base italic text-[var(--color-text)]">
                  &ldquo;
                  <EditableText as="span" dataKey="quote" maxLength={300} />
                  &rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <EditableImage
                    dataKey="avatar"
                    renderChildren={(image, uploadBtn) => (
                      <div className="relative h-12 w-12 shrink-0">
                        {image ? (
                          <RenderDivImage
                            image={image}
                            altText=""
                            className="h-12 w-12 rounded-full bg-gray-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
                            {(item.name ?? "?")[0]}
                          </div>
                        )}
                        {uploadBtn}
                      </div>
                    )}
                  />
                  <div>
                    <p className="font-semibold text-[var(--color-text)]">
                      <EditableText as="span" dataKey="name" maxLength={40} />
                    </p>
                    <p className="text-sm text-[var(--color-text)] opacity-70">
                      <EditableText as="span" dataKey="role" maxLength={60} />
                    </p>
                  </div>
                </div>
              </article>
            </SectionDataProvider>
          ))}
        </div>

        {isEditing ? (
          <button
            type="button"
            className="mt-6 rounded-[var(--radius)] border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400"
            onClick={() =>
              updateField("testimonials", [
                ...testimonials,
                { quote: "New testimonial", name: "Name", role: "Role" },
              ])
            }
          >
            + Add item
          </button>
        ) : null}
      </div>
    </section>
  );
}
