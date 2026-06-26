"use client";

import { ChevronDown } from "lucide-react";
import { useEditMode } from "@/lib/editor/EditModeContext";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableText from "@/lib/editor/EditableText";
import { applyItemPatch } from "@/lib/editor/apply-item-patch";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { SectionHeader } from "../shared/SectionHeader";
import { SectionShell } from "../shared/SectionShell";

export { faqAccordionSchema } from "./schema";
export type { FaqAccordionProps } from "./schema";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export default function FaqAccordion() {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const faqs = (data.faqs as FaqItem[] | undefined) ?? [];

  return (
    <SectionShell>
      <div className="mx-auto max-w-3xl px-4 @sm:px-6 @lg:px-8">
        <div className="mb-10 flex justify-center @sm:mb-14">
          <SectionHeader align="center" eyebrowFallback="FAQ" />
        </div>

        {isEditing && faqs.length === 0 ? (
          <p className="list-section-empty">No FAQs yet — add one below</p>
        ) : null}

        <div className="faq-list space-y-3">
          {faqs.map((item, index) => {
            const applyItemPatchForIndex = (partial: Record<string, unknown>) => {
              updateField("faqs", applyItemPatch(faqs, index, partial));
            };

            return (
              <SectionDataProvider
                key={item.id ?? `faq-${index}`}
                data={item as unknown as Record<string, unknown>}
                updateField={(key, value) => applyItemPatchForIndex({ [key]: value })}
                updateFields={applyItemPatchForIndex}
              >
                <article className="faq-item group relative">
                  {isEditing ? (
                    <EditorRemoveButton
                      label="Remove FAQ"
                      onClick={() =>
                        updateField(
                          "faqs",
                          faqs.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    />
                  ) : null}
                  {isEditing ? (
                    <div className="faq-item__editor">
                      <p className="faq-item__question">
                        <EditableText
                          as="span"
                          dataKey="question"
                          maxLength={200}
                          themeTextRole="cardTitle"
                        />
                      </p>
                      <p className="faq-item__answer">
                        <EditableText
                          as="span"
                          dataKey="answer"
                          maxLength={600}
                          themeTextRole="card"
                        />
                      </p>
                    </div>
                  ) : (
                    <details className="faq-item__details">
                      <summary className="faq-item__summary">
                        <span className="faq-item__question">
                          <EditableText
                            as="span"
                            dataKey="question"
                            maxLength={200}
                            themeTextRole="cardTitle"
                          />
                        </span>
                        <ChevronDown size={18} className="faq-item__chevron shrink-0" aria-hidden />
                      </summary>
                      <div className="faq-item__answer">
                        <EditableText
                          as="span"
                          dataKey="answer"
                          maxLength={600}
                          themeTextRole="card"
                        />
                      </div>
                    </details>
                  )}
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
              updateField("faqs", [
                ...faqs,
                { question: "Your question here?", answer: "Answer goes here." },
              ])
            }
          >
            + Add FAQ
          </button>
        ) : null}
      </div>
    </SectionShell>
  );
}
