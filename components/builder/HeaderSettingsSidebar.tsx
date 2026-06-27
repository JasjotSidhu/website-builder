"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Columns3,
  ImagePlus,
  Link2,
  MousePointerClick,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import ButtonSettingsFields from "@/lib/editor/ButtonSettingsFields";
import LinkSettingsFields from "@/lib/editor/LinkSettingsFields";
import { uploadImageFile } from "@/lib/image-upload";
import type {
  ButtonVariant,
  HeaderMenuItem,
  HeaderSubmenuItem,
  LinkValue,
} from "@/lib/types";
import { useBuilderStore } from "@/store/builderStore";

const MAX_MENU_ITEMS = 12;
const MAX_CTA_ITEMS = 5;
const MAX_SUB_ITEMS = 12;
const MAX_GROUPS = 4;

type HeaderPanel = "logo" | "menus" | "ctas";

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function menuTypeLabel(type: HeaderMenuItem["type"]) {
  if (type === "link") return "Link";
  if (type === "single-dropdown") return "Dropdown";
  return "Mega menu";
}

function menuTypeIcon(type: HeaderMenuItem["type"]) {
  if (type === "link") return Link2;
  if (type === "single-dropdown") return ChevronDown;
  return Columns3;
}

function linkHint(link: LinkValue, pages: { id: string; slug: string; title: string }[]) {
  if (link.type === "url") {
    return link.href || "No URL set";
  }
  const page = pages.find((entry) => entry.id === link.pageId);
  return page ? `${page.title} (${page.slug})` : "Page not found";
}

export default function HeaderSettingsSidebar() {
  const navigation = useBuilderStore((state) => state.site.navigation);
  const pages = useBuilderStore((state) => state.site.pages);
  const patchNavigation = useBuilderStore((state) => state.patchNavigation);
  const closeHeaderSettings = useBuilderStore((state) => state.closeHeaderSettings);

  const defaultLink: LinkValue = { type: "page", pageId: pages[0]?.id ?? "home" };
  const menus = (navigation.menus ?? []) as HeaderMenuItem[];
  const ctas = navigation.ctas ?? [];

  const [panel, setPanel] = useState<HeaderPanel>("menus");
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(menus[0]?.id ?? null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const setMenus = (next: HeaderMenuItem[]) => patchNavigation({ menus: next });

  const updateMenu = (menuId: string, patch: Partial<HeaderMenuItem>) => {
    setMenus(menus.map((menu) => (menu.id === menuId ? ({ ...menu, ...patch } as HeaderMenuItem) : menu)));
  };

  const moveMenu = (menuId: string, delta: -1 | 1) => {
    const index = menus.findIndex((entry) => entry.id === menuId);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= menus.length) return;
    const next = [...menus];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    setMenus(next);
  };

  const removeMenu = (menuId: string) => {
    setMenus(menus.filter((entry) => entry.id !== menuId));
    if (expandedMenuId === menuId) {
      setExpandedMenuId(null);
    }
  };

  const addMenu = (type: HeaderMenuItem["type"]) => {
    if (menus.length >= MAX_MENU_ITEMS) return;

    let nextMenu: HeaderMenuItem;
    if (type === "single-dropdown") {
      nextMenu = {
        id: makeId("menu"),
        type: "single-dropdown",
        label: "New dropdown",
        items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
      };
    } else if (type === "multi-level-dropdown") {
      nextMenu = {
        id: makeId("menu"),
        type: "multi-level-dropdown",
        label: "New mega menu",
        groups: [
          {
            id: makeId("group"),
            title: "Column 1",
            items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
          },
        ],
      };
    } else {
      nextMenu = {
        id: makeId("menu"),
        type: "link",
        label: "New link",
        link: defaultLink,
      };
    }

    setMenus([...menus, nextMenu]);
    setExpandedMenuId(nextMenu.id);
    setPanel("menus");
  };

  const changeMenuType = (menuId: string, nextType: HeaderMenuItem["type"]) => {
    const menu = menus.find((entry) => entry.id === menuId);
    if (!menu || menu.type === nextType) return;

    if (nextType === "link") {
      updateMenu(menuId, { type: "link", link: defaultLink } as Partial<HeaderMenuItem>);
      return;
    }

    if (nextType === "single-dropdown") {
      updateMenu(menuId, {
        type: "single-dropdown",
        items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
      } as Partial<HeaderMenuItem>);
      return;
    }

    updateMenu(menuId, {
      type: "multi-level-dropdown",
      groups: [
        {
          id: makeId("group"),
          title: "Column 1",
          items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
        },
      ],
    } as Partial<HeaderMenuItem>);
  };

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingLogo(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file);
      patchNavigation({ logo: { type: "image", value: url } });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const pageSummaries = pages.map((page) => ({ id: page.id, title: page.title, slug: page.slug }));

  return (
    <div className="header-settings flex h-full flex-col">
      <div className="header-settings__top">
        <div>
          <h3 className="header-settings__title">Header</h3>
          <p className="header-settings__subtitle">Logo, navigation, and buttons</p>
        </div>
        <button
          type="button"
          className="pages-list__icon-btn"
          aria-label="Close header settings"
          onClick={closeHeaderSettings}
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="style-subtabs" role="tablist" aria-label="Header settings">
        {(
          [
            ["logo", "Logo"],
            ["menus", "Menus"],
            ["ctas", "Buttons"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={panel === id}
            className={`style-subtab${panel === id ? " style-subtab--active" : ""}`}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="header-settings__body">
        {panel === "logo" ? (
          <section className="header-settings__section">
            <div className="header-settings__logo-card">
              {navigation.logo?.value ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={navigation.logo.value}
                  alt="Logo preview"
                  className="header-settings__logo-preview"
                />
              ) : (
                <div className="header-settings__logo-empty">
                  <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
                  <span>No logo yet</span>
                </div>
              )}
            </div>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingLogo}
              onChange={(event) => void handleLogoUpload(event.target.files?.[0])}
            />

            <div className="header-settings__logo-actions">
              <button
                type="button"
                className="header-settings__primary-btn"
                disabled={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                {uploadingLogo ? "Uploading…" : navigation.logo?.value ? "Replace logo" : "Upload logo"}
              </button>
              {navigation.logo?.value ? (
                <button
                  type="button"
                  className="header-settings__ghost-btn header-settings__ghost-btn--danger"
                  disabled={uploadingLogo}
                  onClick={() => patchNavigation({ logo: { type: "image", value: "" } })}
                >
                  Remove
                </button>
              ) : null}
            </div>

            <p className="header-settings__hint">PNG or SVG recommended. Displays in the top-left of your site header.</p>
            {uploadError ? <p className="header-settings__error">{uploadError}</p> : null}
          </section>
        ) : null}

        {panel === "menus" ? (
          <section className="header-settings__section">
            {menus.length === 0 ? (
              <div className="header-settings__empty">
                <p>No menu items yet. Add a link or dropdown to get started.</p>
              </div>
            ) : (
              <div className="header-settings__list">
                {menus.map((menu, index) => {
                  const Icon = menuTypeIcon(menu.type);
                  const expanded = expandedMenuId === menu.id;

                  return (
                    <article
                      key={menu.id}
                      className={`header-settings__item${expanded ? " header-settings__item--expanded" : ""}`}
                    >
                      <button
                        type="button"
                        className="header-settings__item-toggle"
                        aria-expanded={expanded}
                        onClick={() => setExpandedMenuId(expanded ? null : menu.id)}
                      >
                        <span className="header-settings__item-icon" aria-hidden>
                          <Icon size={15} strokeWidth={1.75} />
                        </span>
                        <span className="header-settings__item-copy">
                          <strong>{menu.label || "Untitled menu"}</strong>
                          <span>{menuTypeLabel(menu.type)}</span>
                        </span>
                        <ChevronDown
                          size={16}
                          strokeWidth={1.75}
                          className={`header-settings__item-chevron${expanded ? " header-settings__item-chevron--open" : ""}`}
                          aria-hidden
                        />
                      </button>

                      {expanded ? (
                        <div className="header-settings__item-body">
                          <label className="header-settings__field">
                            <span>Label</span>
                            <input
                              type="text"
                              className="header-settings__input"
                              value={menu.label}
                              onChange={(event) => updateMenu(menu.id, { label: event.target.value })}
                            />
                          </label>

                          <label className="header-settings__field">
                            <span>Type</span>
                            <select
                              className="header-settings__select"
                              value={menu.type}
                              onChange={(event) =>
                                changeMenuType(menu.id, event.target.value as HeaderMenuItem["type"])
                              }
                            >
                              <option value="link">Simple link</option>
                              <option value="single-dropdown">Dropdown</option>
                              <option value="multi-level-dropdown">Mega menu</option>
                            </select>
                          </label>

                          {menu.type === "link" ? (
                            <div className="header-settings__nested">
                              <p className="header-settings__nested-label">Destination</p>
                              <LinkSettingsFields
                                compact
                                link={menu.link}
                                pages={pageSummaries}
                                onChange={(link) => updateMenu(menu.id, { link } as Partial<HeaderMenuItem>)}
                              />
                              <p className="header-settings__hint">{linkHint(menu.link, pageSummaries)}</p>
                            </div>
                          ) : null}

                          {menu.type === "single-dropdown" ? (
                            <div className="header-settings__nested">
                              <p className="header-settings__nested-label">Dropdown items</p>
                              {menu.items.map((item, itemIndex) => (
                                <SubmenuItemEditor
                                  key={item.id}
                                  item={item}
                                  pages={pageSummaries}
                                  onChange={(patch) => {
                                    const items = [...menu.items];
                                    items[itemIndex] = { ...items[itemIndex], ...patch };
                                    updateMenu(menu.id, { items } as Partial<HeaderMenuItem>);
                                  }}
                                  onRemove={() => {
                                    const items = menu.items.filter((_, idx) => idx !== itemIndex);
                                    updateMenu(menu.id, { items } as Partial<HeaderMenuItem>);
                                  }}
                                />
                              ))}
                              {menu.items.length < MAX_SUB_ITEMS ? (
                                <button
                                  type="button"
                                  className="header-settings__add-btn"
                                  onClick={() =>
                                    updateMenu(menu.id, {
                                      items: [
                                        ...menu.items,
                                        { id: makeId("submenu"), label: "New item", link: defaultLink },
                                      ],
                                    } as Partial<HeaderMenuItem>)
                                  }
                                >
                                  + Add item
                                </button>
                              ) : null}
                            </div>
                          ) : null}

                          {menu.type === "multi-level-dropdown" ? (
                            <div className="header-settings__nested">
                              <p className="header-settings__nested-label">Columns</p>
                              {menu.groups.map((group, groupIndex) => (
                                <div key={group.id} className="header-settings__group">
                                  <div className="header-settings__group-head">
                                    <input
                                      type="text"
                                      className="header-settings__input"
                                      value={group.title}
                                      placeholder="Column title"
                                      onChange={(event) => {
                                        const groups = [...menu.groups];
                                        groups[groupIndex] = { ...groups[groupIndex], title: event.target.value };
                                        updateMenu(menu.id, { groups } as Partial<HeaderMenuItem>);
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="pages-list__icon-btn pages-list__icon-btn--danger"
                                      aria-label="Remove column"
                                      onClick={() => {
                                        const groups = menu.groups.filter((_, idx) => idx !== groupIndex);
                                        updateMenu(menu.id, { groups } as Partial<HeaderMenuItem>);
                                      }}
                                    >
                                      <Trash2 size={13} strokeWidth={1.75} />
                                    </button>
                                  </div>
                                  {group.items.map((item, itemIndex) => (
                                    <SubmenuItemEditor
                                      key={item.id}
                                      item={item}
                                      pages={pageSummaries}
                                      onChange={(patch) => {
                                        const groups = [...menu.groups];
                                        const items = [...groups[groupIndex].items];
                                        items[itemIndex] = { ...items[itemIndex], ...patch };
                                        groups[groupIndex] = { ...groups[groupIndex], items };
                                        updateMenu(menu.id, { groups } as Partial<HeaderMenuItem>);
                                      }}
                                      onRemove={() => {
                                        const groups = [...menu.groups];
                                        groups[groupIndex] = {
                                          ...groups[groupIndex],
                                          items: groups[groupIndex].items.filter((_, idx) => idx !== itemIndex),
                                        };
                                        updateMenu(menu.id, { groups } as Partial<HeaderMenuItem>);
                                      }}
                                    />
                                  ))}
                                  {group.items.length < MAX_SUB_ITEMS ? (
                                    <button
                                      type="button"
                                      className="header-settings__add-btn"
                                      onClick={() => {
                                        const groups = [...menu.groups];
                                        groups[groupIndex] = {
                                          ...groups[groupIndex],
                                          items: [
                                            ...groups[groupIndex].items,
                                            { id: makeId("submenu"), label: "New item", link: defaultLink },
                                          ],
                                        };
                                        updateMenu(menu.id, { groups } as Partial<HeaderMenuItem>);
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
                                  className="header-settings__add-btn"
                                  onClick={() =>
                                    updateMenu(menu.id, {
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
                          ) : null}

                          <div className="header-settings__item-actions">
                            <button
                              type="button"
                              className="header-settings__ghost-btn"
                              disabled={index === 0}
                              onClick={() => moveMenu(menu.id, -1)}
                            >
                              <ArrowUp size={14} strokeWidth={1.75} aria-hidden />
                              Move up
                            </button>
                            <button
                              type="button"
                              className="header-settings__ghost-btn"
                              disabled={index === menus.length - 1}
                              onClick={() => moveMenu(menu.id, 1)}
                            >
                              <ArrowDown size={14} strokeWidth={1.75} aria-hidden />
                              Move down
                            </button>
                            <button
                              type="button"
                              className="header-settings__ghost-btn header-settings__ghost-btn--danger"
                              onClick={() => removeMenu(menu.id)}
                            >
                              <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}

            {menus.length < MAX_MENU_ITEMS ? (
              <div className="header-settings__add-row">
                <button type="button" className="header-settings__chip-btn" onClick={() => addMenu("link")}>
                  <Link2 size={14} strokeWidth={1.75} aria-hidden />
                  Link
                </button>
                <button
                  type="button"
                  className="header-settings__chip-btn"
                  onClick={() => addMenu("single-dropdown")}
                >
                  <ChevronDown size={14} strokeWidth={1.75} aria-hidden />
                  Dropdown
                </button>
                <button
                  type="button"
                  className="header-settings__chip-btn"
                  onClick={() => addMenu("multi-level-dropdown")}
                >
                  <Columns3 size={14} strokeWidth={1.75} aria-hidden />
                  Mega menu
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        {panel === "ctas" ? (
          <section className="header-settings__section">
            <p className="header-settings__hint header-settings__hint--lead">
              Call-to-action buttons appear on the right side of the header.
            </p>

            {ctas.length === 0 ? (
              <div className="header-settings__empty">
                <p>No header buttons yet.</p>
              </div>
            ) : (
              <div className="header-settings__list">
                {ctas.map((cta, index) => (
                  <article key={cta.id} className="header-settings__item header-settings__item--expanded">
                    <div className="header-settings__item-body header-settings__item-body--flat">
                      <label className="header-settings__field">
                        <span>Button label</span>
                        <input
                          type="text"
                          className="header-settings__input"
                          value={cta.label}
                          onChange={(event) => {
                            const next = [...ctas];
                            next[index] = { ...next[index], label: event.target.value };
                            patchNavigation({ ctas: next });
                          }}
                        />
                      </label>

                      <ButtonSettingsFields
                        variant={cta.variant ?? "primary"}
                        link={cta.link}
                        pages={pageSummaries}
                        onVariantChange={(variant) => {
                          const next = [...ctas];
                          next[index] = { ...next[index], variant: variant as ButtonVariant };
                          patchNavigation({ ctas: next });
                        }}
                        onLinkChange={(link) => {
                          const next = [...ctas];
                          next[index] = { ...next[index], link };
                          patchNavigation({ ctas: next });
                        }}
                      />

                      <p className="header-settings__hint">{linkHint(cta.link, pageSummaries)}</p>

                      <button
                        type="button"
                        className="header-settings__ghost-btn header-settings__ghost-btn--danger"
                        onClick={() => patchNavigation({ ctas: ctas.filter((_, idx) => idx !== index) })}
                      >
                        <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                        Remove button
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {ctas.length < MAX_CTA_ITEMS ? (
              <button
                type="button"
                className="header-settings__primary-btn header-settings__primary-btn--full"
                onClick={() =>
                  patchNavigation({
                    ctas: [
                      ...ctas,
                      {
                        id: makeId("cta"),
                        label: "Get started",
                        link: defaultLink,
                        variant: "primary",
                      },
                    ],
                  })
                }
              >
                <MousePointerClick size={15} strokeWidth={1.75} aria-hidden />
                Add button
              </button>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}

function SubmenuItemEditor({
  item,
  pages,
  onChange,
  onRemove,
}: {
  item: HeaderSubmenuItem;
  pages: { id: string; title: string; slug: string }[];
  onChange: (patch: Partial<HeaderSubmenuItem>) => void;
  onRemove: () => void;
}) {
  const [showLink, setShowLink] = useState(false);

  return (
    <div className="header-settings__submenu">
      <div className="header-settings__submenu-head">
        <input
          type="text"
          className="header-settings__input"
          value={item.label}
          placeholder="Item label"
          onChange={(event) => onChange({ label: event.target.value })}
        />
        <button
          type="button"
          className="pages-list__icon-btn"
          aria-label={showLink ? "Hide link settings" : "Edit link"}
          aria-expanded={showLink}
          onClick={() => setShowLink((open) => !open)}
        >
          <Link2 size={13} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="pages-list__icon-btn pages-list__icon-btn--danger"
          aria-label="Remove item"
          onClick={onRemove}
        >
          <Trash2 size={13} strokeWidth={1.75} />
        </button>
      </div>
      <p className="header-settings__hint">{linkHint(item.link, pages)}</p>
      {showLink ? (
        <LinkSettingsFields compact link={item.link} pages={pages} onChange={(link) => onChange({ link })} />
      ) : null}
    </div>
  );
}
