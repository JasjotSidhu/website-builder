"use client";

import { X } from "lucide-react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditableImage, { RenderDivImage } from "@/lib/editor/EditableImage";
import EditableText from "@/lib/editor/EditableText";
import Tooltip from "@/lib/editor/Tooltip";
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
          <SectionHeader align="center" eyebrow="Testimonials" />
        </div>

        <div style={gridStyle}>
          {testimonials.map((item, index) => (
            <SectionDataProvider
              key={`testimonial-${index}`}
              data={item as unknown as Record<string, unknown>}
              updateField={(key, value) => {
                const next = [...testimonials];
                const itemData = { ...next[index] };
                if (value === undefined || value === "") {
                  delete itemData[key as keyof typeof itemData];
                } else {
                  itemData[key as keyof typeof itemData] = value as never;
                }
                next[index] = itemData;
                updateField("testimonials", next);
              }}
            >
              <article className="testimonial-card group relative flex h-full flex-col">
                {isEditing ? (
                  <Tooltip label="Remove testimonial" side="left">
                    <button
                      type="button"
                      className="absolute right-3 top-3 z-10 flex items-center justify-center rounded-full bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                      aria-label="Remove testimonial"
                      onClick={() =>
                        updateField(
                          "testimonials",
                          testimonials.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <X size={12} strokeWidth={2} aria-hidden />
                    </button>
                  </Tooltip>
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
                    renderChildren={(image, uploadBtn) => (
                      <div className="relative h-11 w-11 shrink-0">
                        {image ? (
                          <RenderDivImage
                            image={image}
                            altText=""
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-md"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white shadow-md">
                            {(item.name ?? "?")[0]}
                          </div>
                        )}
                        {uploadBtn}
                      </div>
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
          ))}
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
