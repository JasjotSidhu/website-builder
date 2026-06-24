"use client";

import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import ImageEditSurface from "@/lib/editor/ImageEditSurface";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useGridStyle } from "@/lib/traits/hooks";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { testimonialsGridSchema } from "./schema";
export type { TestimonialsGridProps } from "./schema";

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

function StarRow() {
  return (
    <div className="testimonial-stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsGrid() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const testimonials = (data.testimonials as TestimonialItem[] | undefined) ?? [];
  const gridStyle = useGridStyle();

  return (
    <SectionShell>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex justify-center">
          <SectionHeader align="center" eyebrowFallback="Testimonials" />
        </div>

        <div style={gridStyle}>
          {testimonials.map((item, index) => {
            const applyItemPatch = (partial: Record<string, unknown>) => {
              const next = [...testimonials];
              const itemData = { ...next[index] };
              for (const [key, value] of Object.entries(partial)) {
                if (value === undefined || value === "") {
                  delete itemData[key as keyof typeof itemData];
                } else {
                  itemData[key as keyof typeof itemData] = value as never;
                }
              }
              next[index] = itemData;
              updateField("testimonials", next);
            };

            return (
            <SectionDataProvider
              key={`testimonial-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => applyItemPatch({ [key]: value })}
              updateFields={applyItemPatch}
            >
              <article className="testimonial-card group relative flex h-full flex-col">
                {isEditing ? (
                  <EditorRemoveButton
                    label="Remove testimonial"
                    onClick={() =>
                      updateField(
                        "testimonials",
                        testimonials.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  />
                ) : null}
                <span className="testimonial-quote-mark" aria-hidden>
                  &ldquo;
                </span>
                <StarRow />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed opacity-85">
                  <EditableText as="span" dataKey="quote" maxLength={300} />
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-black/5 pt-5">
                  <EditableImage
                    dataKey="avatar"
                    compact
                    renderChildren={(image, uploadBtn) => (
                      <ImageEditSurface
                        uploadBtn={uploadBtn}
                        compact
                        className="h-11 w-11 shrink-0 rounded-full"
                      >
                        {image ? (
                          <RenderDivImage
                            image={image}
                            altText=""
                            className="h-full w-full rounded-full ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white shadow-md ring-2 ring-white">
                            {(item.name ?? "?")[0]}
                          </div>
                        )}
                      </ImageEditSurface>
                    )}
                  />
                  <div>
                    <p className="font-semibold">
                      <EditableText as="span" dataKey="name" maxLength={40} />
                    </p>
                    <p className="text-sm opacity-60">
                      <EditableText as="span" dataKey="role" maxLength={60} />
                    </p>
                  </div>
                </div>
              </article>
            </SectionDataProvider>
            );
          })}
        </div>

        {isEditing ? (
          <button
            type="button"
            className="button-item-add mx-auto mt-8 block"
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
    </SectionShell>
  );
}
