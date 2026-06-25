"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import EditorRemoveButton from "@/lib/editor/EditorRemoveButton";
import EditableNavLink from "@/lib/editor/EditableNavLink";
import EditableText from "@/lib/editor/EditableText";
import { useEditMode } from "@/lib/editor/EditModeContext";
import {
  SectionDataProvider,
  useSectionData,
} from "@/lib/editor/SectionDataContext";
import { useSitePages } from "@/lib/editor/SiteContext";
import { resolveLink } from "@/lib/links";
import type { HeaderMenuItem, HeaderSubmenuItem, LinkValue } from "@/lib/types";

interface EditableNavLinksListProps {
  className?: string;
  layout?: "row" | "column";
  onNavigate?: () => void;
  editMode?: "auto" | "always" | "never";
}

const MAX_MENU_ITEMS = 12;
const MAX_SUB_ITEMS = 12;
const MAX_GROUPS = 4;

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getDefaultLink(pages: { id: string }[]): LinkValue {
  return { type: "page", pageId: pages[0]?.id ?? "home" };
}

function migrateLegacyLinksToMenus(
  links: { label: string; link: LinkValue }[],
  pages: { id: string }[],
): HeaderMenuItem[] {
  const fallback = getDefaultLink(pages);
  return links.map((link, index) => ({
    id: `menu-${index + 1}`,
    type: "link",
    label: link.label,
    link: link.link ?? fallback,
  }));
}

function SubmenuLinkEditor({
  item,
  onUpdate,
  onRemove,
}: {
  item: HeaderSubmenuItem;
  onUpdate: (patch: Partial<HeaderSubmenuItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="header-submenu-row">
      <EditorRemoveButton label="Remove submenu item" compact onClick={onRemove} />
      <SectionDataProvider
        data={item as unknown as Record<string, unknown>}
        updateField={(key, value) => onUpdate({ [key]: value })}
        updateFields={onUpdate}
      >
        <EditableNavLink className="text-xs font-medium text-gray-700" />
      </SectionDataProvider>
    </div>
  );
}

export default function EditableNavLinksList({
  className = "",
  layout = "row",
  onNavigate,
  editMode = "auto",
}: EditableNavLinksListProps) {
  const { isEditing } = useEditMode();
  const { data, updateField } = useSectionData();
  const pages = useSitePages();
  const legacyLinks = (data.links as { label: string; link: LinkValue }[] | undefined) ?? [];
  const menusRaw = (data.menus as HeaderMenuItem[] | undefined) ?? [];
  const menus =
    menusRaw.length > 0 ? menusRaw : migrateLegacyLinksToMenus(legacyLinks, pages);
  const defaultLink = getDefaultLink(pages);

  const setMenus = (next: HeaderMenuItem[]) => {
    updateField("menus", next);
  };

  const updateMenu = (index: number, patch: Partial<HeaderMenuItem>) => {
    const next = [...menus];
    next[index] = { ...next[index], ...patch } as HeaderMenuItem;
    setMenus(next);
  };

  const removeMenu = (index: number) => {
    setMenus(menus.filter((_, itemIndex) => index !== itemIndex));
  };

  const moveMenu = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= menus.length) {
      return;
    }
    const next = [...menus];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setMenus(next);
  };

  const addMenu = (type: HeaderMenuItem["type"]) => {
    if (menus.length >= MAX_MENU_ITEMS) {
      return;
    }

    if (type === "single-dropdown") {
      setMenus([
        ...menus,
        {
          id: makeId("menu"),
          type,
          label: "New dropdown",
          items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
        },
      ]);
      return;
    }

    if (type === "multi-level-dropdown") {
      setMenus([
        ...menus,
        {
          id: makeId("menu"),
          type,
          label: "New mega menu",
          groups: [
            {
              id: makeId("group"),
              title: "Column 1",
              items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
            },
          ],
        },
      ]);
      return;
    }

    setMenus([
      ...menus,
      {
        id: makeId("menu"),
        type: "link",
        label: "New link",
        link: defaultLink,
      },
    ]);
  };

  const renderDisplaySubmenuItem = (item: HeaderSubmenuItem) => {
    const href = resolveLink(item.link, pages);
    return (
      <a key={item.id} href={href} className="header-submenu-link" onClick={onNavigate}>
        {item.label}
      </a>
    );
  };

  const containerClass =
    layout === "row"
      ? `flex flex-wrap items-center gap-6 ${className}`
      : `flex flex-col gap-4 ${className}`;

  const canEdit = editMode === "always" ? true : editMode === "never" ? false : isEditing;

  if (!canEdit) {
    if (layout === "column") {
      return (
        <div className={containerClass}>
          {menus.map((menu) => {
            if (menu.type === "link") {
              const href = resolveLink(menu.link, pages);
              return (
                <a key={menu.id} href={href} className="text-base font-medium" onClick={onNavigate}>
                  {menu.label}
                </a>
              );
            }

            if (menu.type === "single-dropdown") {
              return (
                <div key={menu.id} className="space-y-2">
                  <p className="inline-flex items-center gap-1 text-base font-medium">
                    {menu.label}
                    <ChevronDown size={16} />
                  </p>
                  <div className="ml-3 flex flex-col gap-2">
                    {menu.items.map((item) => renderDisplaySubmenuItem(item))}
                  </div>
                </div>
              );
            }

            return (
              <div key={menu.id} className="space-y-3">
                <p className="inline-flex items-center gap-1 text-base font-medium">
                  {menu.label}
                  <ChevronDown size={16} />
                </p>
                {menu.groups.map((group) => (
                  <div key={group.id} className="ml-3 space-y-2">
                    <p className="text-sm font-semibold text-[#ca8a84]">{group.title}</p>
                    <div className="flex flex-col gap-2">
                      {group.items.map((item) => renderDisplaySubmenuItem(item))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className={containerClass}>
        {menus.map((menu) => {
          if (menu.type === "link") {
            const href = resolveLink(menu.link, pages);
            return (
              <a
                key={menu.id}
                href={href}
                className="text-sm font-medium transition hover:text-[var(--color-primary)]"
                onClick={onNavigate}
              >
                {menu.label}
              </a>
            );
          }

          if (menu.type === "single-dropdown") {
            return (
              <div key={menu.id} className="header-menu-dropdown group relative">
                <button type="button" className="header-menu-trigger">
                  {menu.label}
                  <ChevronDown size={16} />
                </button>
                <div className="header-dropdown-panel hidden group-hover:block">
                  <div className="header-dropdown-inner">
                    {menu.items.map((item) => renderDisplaySubmenuItem(item))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={menu.id} className="header-menu-dropdown group relative">
              <button type="button" className="header-menu-trigger">
                {menu.label}
                <ChevronDown size={16} />
              </button>
              <div className="header-dropdown-panel hidden group-hover:block">
                <div className="header-dropdown-grid">
                  {menu.groups.map((group) => (
                    <div key={group.id} className="header-dropdown-column">
                      <p className="header-dropdown-title">{group.title}</p>
                      <div className="mt-3 flex flex-col gap-2">
                        {group.items.map((item) => renderDisplaySubmenuItem(item))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`header-menu-editor ${containerClass}`}>
      {menus.map((menu, index) => (
        <div key={menu.id} className="header-menu-editor-item">
          <div className="header-menu-editor-row">
            <div className="header-menu-editor-actions">
              <button type="button" className="builder-icon-btn" onClick={() => moveMenu(index, -1)}>
                <ChevronRight size={15} className="-rotate-90" />
              </button>
              <button type="button" className="builder-icon-btn" onClick={() => moveMenu(index, 1)}>
                <ChevronRight size={15} className="rotate-90" />
              </button>
            </div>
            <select
              className="settings-field h-8 min-w-[10rem] text-xs"
              value={menu.type}
              onChange={(event) => {
                const nextType = event.target.value as HeaderMenuItem["type"];
                if (nextType === menu.type) return;
                if (nextType === "link") {
                  updateMenu(index, { type: "link", link: defaultLink } as Partial<HeaderMenuItem>);
                } else if (nextType === "single-dropdown") {
                  updateMenu(
                    index,
                    {
                      type: "single-dropdown",
                      items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
                    } as Partial<HeaderMenuItem>,
                  );
                } else {
                  updateMenu(
                    index,
                    {
                      type: "multi-level-dropdown",
                      groups: [
                        {
                          id: makeId("group"),
                          title: "Column 1",
                          items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
                        },
                      ],
                    } as Partial<HeaderMenuItem>,
                  );
                }
              }}
            >
              <option value="link">Simple link</option>
              <option value="single-dropdown">Single dropdown</option>
              <option value="multi-level-dropdown">Multi-level dropdown</option>
            </select>
            <EditorRemoveButton label="Remove menu item" compact onClick={() => removeMenu(index)} />
          </div>

          {menu.type === "link" ? (
            <SectionDataProvider
              data={menu as unknown as Record<string, unknown>}
              updateField={(key, value) => updateMenu(index, { [key]: value } as Partial<HeaderMenuItem>)}
              updateFields={(partial) => updateMenu(index, partial as Partial<HeaderMenuItem>)}
            >
              <EditableNavLink className="text-sm font-medium transition hover:text-[var(--color-primary)]" />
            </SectionDataProvider>
          ) : (
            <>
              <SectionDataProvider
                data={{ label: menu.label }}
                updateField={(_, value) => updateMenu(index, { label: String(value) })}
                updateFields={(partial) =>
                  updateMenu(index, { label: String(partial.label ?? menu.label) })
                }
              >
                <EditableText as="span" dataKey="label" maxLength={40} className="text-sm font-semibold" />
              </SectionDataProvider>

              {menu.type === "single-dropdown" ? (
                <div className="header-menu-subeditor">
                  {menu.items.map((item, itemIndex) => (
                    <SubmenuLinkEditor
                      key={item.id}
                      item={item}
                      onUpdate={(patch) => {
                        const items = [...menu.items];
                        items[itemIndex] = { ...items[itemIndex], ...patch };
                        updateMenu(index, { items } as Partial<HeaderMenuItem>);
                      }}
                      onRemove={() => {
                        const items = menu.items.filter((_, idx) => idx !== itemIndex);
                        updateMenu(index, { items } as Partial<HeaderMenuItem>);
                      }}
                    />
                  ))}
                  {menu.items.length < MAX_SUB_ITEMS ? (
                    <button
                      type="button"
                      className="button-item-add mt-2"
                      onClick={() =>
                        updateMenu(index, {
                          items: [
                            ...menu.items,
                            { id: makeId("submenu"), label: "New item", link: defaultLink },
                          ],
                        } as Partial<HeaderMenuItem>)
                      }
                    >
                      + Add dropdown item
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="header-menu-subeditor">
                  {menu.groups.map((group, groupIndex) => (
                    <div key={group.id} className="header-menu-group">
                      <div className="header-menu-editor-row">
                        <SectionDataProvider
                          data={{ title: group.title }}
                          updateField={(_, value) => {
                            const groups = [...menu.groups];
                            groups[groupIndex] = { ...groups[groupIndex], title: String(value) };
                            updateMenu(index, { groups } as Partial<HeaderMenuItem>);
                          }}
                          updateFields={(partial) => {
                            const groups = [...menu.groups];
                            groups[groupIndex] = {
                              ...groups[groupIndex],
                              title: String(partial.title ?? group.title),
                            };
                            updateMenu(index, { groups } as Partial<HeaderMenuItem>);
                          }}
                        >
                          <EditableText as="span" dataKey="title" maxLength={30} className="text-xs font-semibold" />
                        </SectionDataProvider>
                        <EditorRemoveButton
                          label="Remove dropdown column"
                          compact
                          onClick={() =>
                            updateMenu(
                              index,
                              { groups: menu.groups.filter((_, idx) => idx !== groupIndex) } as Partial<HeaderMenuItem>,
                            )
                          }
                        />
                      </div>
                      {group.items.map((item, itemIndex) => (
                        <SubmenuLinkEditor
                          key={item.id}
                          item={item}
                          onUpdate={(patch) => {
                            const groups = [...menu.groups];
                            const items = [...groups[groupIndex].items];
                            items[itemIndex] = { ...items[itemIndex], ...patch };
                            groups[groupIndex] = { ...groups[groupIndex], items };
                            updateMenu(index, { groups } as Partial<HeaderMenuItem>);
                          }}
                          onRemove={() => {
                            const groups = [...menu.groups];
                            groups[groupIndex] = {
                              ...groups[groupIndex],
                              items: groups[groupIndex].items.filter((_, idx) => idx !== itemIndex),
                            };
                            updateMenu(index, { groups } as Partial<HeaderMenuItem>);
                          }}
                        />
                      ))}
                      {group.items.length < MAX_SUB_ITEMS ? (
                        <button
                          type="button"
                          className="button-item-add mt-2"
                          onClick={() => {
                            const groups = [...menu.groups];
                            groups[groupIndex] = {
                              ...groups[groupIndex],
                              items: [
                                ...groups[groupIndex].items,
                                { id: makeId("submenu"), label: "New item", link: defaultLink },
                              ],
                            };
                            updateMenu(index, { groups } as Partial<HeaderMenuItem>);
                          }}
                        >
                          + Add item
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {menu.groups.length < MAX_GROUPS ? (
                    <button
                      type="button"
                      className="button-item-add mt-2"
                      onClick={() =>
                        updateMenu(index, {
                          groups: [
                            ...menu.groups,
                            {
                              id: makeId("group"),
                              title: `Column ${menu.groups.length + 1}`,
                              items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
                            },
                          ],
                        } as Partial<HeaderMenuItem>)
                      }
                    >
                      + Add column
                    </button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      ))}
      {menus.length < MAX_MENU_ITEMS ? (
        <div className="flex gap-2">
          <button type="button" className="button-item-add" onClick={() => addMenu("link")}>
            + Link
          </button>
          <button
            type="button"
            className="button-item-add"
            onClick={() => addMenu("single-dropdown")}
          >
            + Dropdown
          </button>
          <button
            type="button"
            className="button-item-add"
            onClick={() => addMenu("multi-level-dropdown")}
          >
            + Mega menu
          </button>
        </div>
      ) : null}
    </div>
  );
}
