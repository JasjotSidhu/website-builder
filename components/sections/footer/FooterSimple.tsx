"use client";

import EditableLogo from "@/lib/editor/EditableLogo";
import EditableNavLink from "@/lib/editor/EditableNavLink";
import EditableText from "@/lib/editor/EditableText";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import type { LinkValue } from "@/lib/types";
import { useBackgroundStyle } from "@/lib/traits/hooks";

export { footerSimpleSchema } from "./schema";
export type { FooterSimpleProps } from "./schema";

interface FooterLink {
  label: string;
  link: LinkValue;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterLogo {
  type: "text" | "image";
  value: string;
}

export default function FooterSimple() {
  const { data, updateField } = useSectionData();
  const logo = (data.logo as FooterLogo | undefined) ?? { type: "text", value: "" };
  const columns = (data.columns as FooterColumn[] | undefined) ?? [];
  const { containerStyle, overlayStyle } = useBackgroundStyle();

  return (
    <footer
      className="site-footer relative border-t border-black/[0.06] px-6 py-16"
      style={containerStyle}
    >
      {overlayStyle ? <div style={overlayStyle} /> : null}
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionDataProvider
              data={logo as unknown as Record<string, unknown>}
              updateField={(key, value) => updateField("logo", { ...logo, [key]: value })}
              updateFields={(partial) => updateField("logo", { ...logo, ...partial })}
            >
              <EditableLogo
                textClassName="text-lg font-semibold"
                imageClassName="h-9 w-auto object-contain"
              />
            </SectionDataProvider>
            <EditableText
              as="p"
              dataKey="blurb"
              maxLength={200}
              className="mt-5 max-w-sm text-[15px] leading-relaxed opacity-70"
            />
          </div>
          {columns.map((column, columnIndex) => (
            <div key={`footer-column-${columnIndex}`} className="md:col-span-2">
              <SectionDataProvider
                data={column as unknown as Record<string, unknown>}
                updateField={(key, value) => {
                  const next = [...columns];
                  next[columnIndex] = { ...next[columnIndex], [key]: value };
                  updateField("columns", next);
                }}
                updateFields={(partial) => {
                  const next = [...columns];
                  next[columnIndex] = { ...next[columnIndex], ...partial };
                  updateField("columns", next);
                }}
              >
                <EditableText
                  as="p"
                  dataKey="title"
                  maxLength={40}
                  className="text-sm font-semibold uppercase tracking-wider opacity-50"
                />
                <ul className="mt-4 space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={`footer-link-${columnIndex}-${linkIndex}`}>
                      <SectionDataProvider
                        data={link as unknown as Record<string, unknown>}
                        updateField={(key, value) => {
                          const nextColumns = [...columns];
                          const nextLinks = [...nextColumns[columnIndex].links];
                          nextLinks[linkIndex] = { ...nextLinks[linkIndex], [key]: value };
                          nextColumns[columnIndex] = {
                            ...nextColumns[columnIndex],
                            links: nextLinks,
                          };
                          updateField("columns", nextColumns);
                        }}
                        updateFields={(partial) => {
                          const nextColumns = [...columns];
                          const nextLinks = [...nextColumns[columnIndex].links];
                          nextLinks[linkIndex] = { ...nextLinks[linkIndex], ...partial };
                          nextColumns[columnIndex] = {
                            ...nextColumns[columnIndex],
                            links: nextLinks,
                          };
                          updateField("columns", nextColumns);
                        }}
                      >
                        <EditableNavLink className="text-sm opacity-85 transition hover:text-[var(--color-primary)]" />
                      </SectionDataProvider>
                    </li>
                  ))}
                </ul>
              </SectionDataProvider>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/[0.06] pt-8">
          <EditableText
            as="p"
            dataKey="copyright"
            maxLength={120}
            className="text-sm opacity-50"
          />
        </div>
      </div>
    </footer>
  );
}
