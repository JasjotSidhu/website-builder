"use client";

import { EllipsisVertical, X } from "lucide-react";
import { useState } from "react";
import FloatingPopover from "@/lib/editor/FloatingPopover";
import { PopoverActions, PopoverField, PopoverShell } from "@/lib/editor/PopoverShell";
import { uploadImageFile } from "@/lib/image-upload";
import type { HeaderMenuItem, LinkValue } from "@/lib/types";
import { useBuilderStore } from "@/store/builderStore";

const MAX_MENU_ITEMS = 12;
const MAX_CTA_ITEMS = 5;

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function HeaderSettingsSidebar() {
  const navigation = useBuilderStore((state) => state.site.navigation);
  const pages = useBuilderStore((state) => state.site.pages);
  const patchNavigation = useBuilderStore((state) => state.patchNavigation);
  const closeHeaderSettings = useBuilderStore((state) => state.closeHeaderSettings);
  const defaultLink: LinkValue = { type: "page", pageId: pages[0]?.id ?? "home" };
  const menus = (navigation.menus ?? []) as HeaderMenuItem[];
  const ctas = navigation.ctas ?? [];
  const [openMenuActionsId, setOpenMenuActionsId] = useState<string | null>(null);
  const [menuActionsAnchorEl, setMenuActionsAnchorEl] = useState<HTMLElement | null>(null);
  const [addMenuPopoverOpen, setAddMenuPopoverOpen] = useState(false);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [newMenuType, setNewMenuType] = useState<HeaderMenuItem["type"]>("link");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const activeMenu = menus.find((menu) => menu.id === openMenuActionsId) ?? null;

  const setMenus = (next: HeaderMenuItem[]) => patchNavigation({ menus: next });
  const moveMenu = (menuId: string, delta: -1 | 1) => {
    const index = menus.findIndex((entry) => entry.id === menuId);
    const nextIndex = index + delta;
    if (index < 0 || nextIndex < 0 || nextIndex >= menus.length) return;
    const next = [...menus];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);
    setMenus(next);
  };

  const updateMenu = (menuId: string, patch: Partial<HeaderMenuItem>) => {
    setMenus(menus.map((menu) => (menu.id === menuId ? ({ ...menu, ...patch } as HeaderMenuItem) : menu)));
  };

  const saveNewMenu = () => {
    if (menus.length >= MAX_MENU_ITEMS) return;
    if (newMenuType === "single-dropdown") {
      setMenus([
        ...menus,
        {
          id: makeId("menu"),
          type: "single-dropdown",
          label: "New dropdown",
          items: [{ id: makeId("submenu"), label: "New item", link: defaultLink }],
        },
      ]);
    } else if (newMenuType === "multi-level-dropdown") {
      setMenus([
        ...menus,
        {
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
        },
      ]);
    } else {
      setMenus([
        ...menus,
        {
          id: makeId("menu"),
          type: "link",
          label: "New menu",
          link: defaultLink,
        },
      ]);
    }
    setAddMenuPopoverOpen(false);
  };

  const addSingleDropdownItem = (menuId: string) => {
    const menu = menus.find((entry) => entry.id === menuId);
    if (!menu || menu.type !== "single-dropdown") return;
    updateMenu(menuId, {
      items: [
        ...menu.items,
        { id: makeId("submenu"), label: "New item", link: defaultLink },
      ],
    } as Partial<HeaderMenuItem>);
  };

  const addMultiDropdownColumn = (menuId: string) => {
    const menu = menus.find((entry) => entry.id === menuId);
    if (!menu || menu.type !== "multi-level-dropdown") return;
    updateMenu(menuId, {
      groups: [
        ...menu.groups,
        {
          id: makeId("group"),
          title: `Column ${menu.groups.length + 1}`,
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
      patchNavigation({
        logo: {
          type: "image",
          value: url,
        },
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="flex h-full flex-col border-t border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Header</h3>
        <button
          type="button"
          className="pages-list__icon-btn"
          aria-label="Close header settings"
          onClick={closeHeaderSettings}
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Logo
          </span>
          {navigation.logo?.value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={navigation.logo.value} alt="Logo preview" className="h-10 w-auto object-contain" />
          ) : (
            <div className="rounded border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500">
              No logo uploaded
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="block w-full text-xs text-gray-600"
            disabled={uploadingLogo}
            onChange={(event) => void handleLogoUpload(event.target.files?.[0])}
          />
          {uploadingLogo ? <p className="text-xs text-gray-500">Uploading…</p> : null}
          {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Navigation menus
          </span>
          {menus.map((menu) => (
            <div key={menu.id} className="relative rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{menu.label}</span>
                <button
                  type="button"
                  className="builder-icon-btn"
                  aria-label="Menu options"
                  onClick={() =>
                    setOpenMenuActionsId((current) => {
                      if (current === menu.id) {
                        setMenuActionsAnchorEl(null);
                        return null;
                      }
                      return menu.id;
                    })
                  }
                  ref={(node) => {
                    if (openMenuActionsId === menu.id) {
                      setMenuActionsAnchorEl(node);
                    }
                  }}
                >
                  <EllipsisVertical size={16} />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {menu.type === "link"
                  ? "Simple link"
                  : menu.type === "single-dropdown"
                    ? "Single column dropdown"
                    : "Multi-column dropdown"}
              </p>
              {menu.type === "single-dropdown" ? (
                <details className="mt-2 header-accordion">
                  <summary className="header-accordion__summary">
                    Dropdown items ({menu.items.length})
                  </summary>
                  <div className="header-accordion__content">
                    {menu.items.map((item) => (
                      <div key={item.id} className="header-accordion__row">
                        {item.label}
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
              {menu.type === "multi-level-dropdown" ? (
                <details className="mt-2 header-accordion">
                  <summary className="header-accordion__summary">
                    Dropdown columns ({menu.groups.length})
                  </summary>
                  <div className="header-accordion__content">
                    {menu.groups.map((group) => (
                      <details key={group.id} className="header-accordion header-accordion--nested">
                        <summary className="header-accordion__summary">
                          {group.title} ({group.items.length})
                        </summary>
                        <div className="header-accordion__content">
                          {group.items.map((item) => (
                            <div key={item.id} className="header-accordion__row">
                              {item.label}
                            </div>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="builder-save-btn"
            ref={setAddMenuAnchorEl}
            onClick={() => setAddMenuPopoverOpen(true)}
          >
            Add Menu
          </button>
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            CTA buttons
          </span>
          {ctas.map((cta, index) => (
            <div key={cta.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  CTA label
                </span>
                <input
                  type="text"
                  className="settings-field"
                  value={cta.label}
                  onChange={(event) => {
                    const next = [...ctas];
                    next[index] = { ...next[index], label: event.target.value };
                    patchNavigation({ ctas: next });
                  }}
                />
              </label>
              <button
                type="button"
                className="editor-popover-btn mt-2 text-red-600"
                onClick={() => patchNavigation({ ctas: ctas.filter((_, idx) => idx !== index) })}
              >
                Remove CTA
              </button>
            </div>
          ))}
          {ctas.length < MAX_CTA_ITEMS ? (
            <button
              type="button"
              className="builder-save-btn"
              onClick={() =>
                patchNavigation({
                  ctas: [
                    ...ctas,
                    {
                      id: makeId("cta"),
                      label: "New CTA",
                      link: defaultLink,
                      variant: "primary",
                    },
                  ],
                })
              }
            >
              Add CTA
            </button>
          ) : null}
        </div>
      </div>
      <FloatingPopover
        anchorEl={menuActionsAnchorEl}
        open={Boolean(activeMenu && menuActionsAnchorEl)}
        placement="auto"
        align="end"
        className="menu-actions-popover"
        dataAttribute="data-menu-actions-popover"
      >
        {activeMenu ? (
          <PopoverShell
            title="Menu actions"
            variant="editor"
            compact
            onClose={() => {
              setOpenMenuActionsId(null);
              setMenuActionsAnchorEl(null);
            }}
          >
            <div className="space-y-2 text-xs">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Edit label
                </span>
                <input
                  type="text"
                  className="settings-field h-8"
                  value={activeMenu.label}
                  onChange={(event) =>
                    updateMenu(activeMenu.id, { label: event.target.value })
                  }
                />
              </label>
              <button
                type="button"
                className="editor-popover-btn mt-1 w-full text-left"
                onClick={() => moveMenu(activeMenu.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="editor-popover-btn mt-1 w-full text-left"
                onClick={() => moveMenu(activeMenu.id, 1)}
              >
                Move down
              </button>
              {activeMenu.type === "single-dropdown" ? (
                <button
                  type="button"
                  className="editor-popover-btn w-full text-left"
                  onClick={() => addSingleDropdownItem(activeMenu.id)}
                >
                  Add item
                </button>
              ) : null}
              {activeMenu.type === "multi-level-dropdown" ? (
                <button
                  type="button"
                  className="editor-popover-btn w-full text-left"
                  onClick={() => addMultiDropdownColumn(activeMenu.id)}
                >
                  Add new column
                </button>
              ) : null}
              <button
                type="button"
                className="editor-popover-btn mt-1 w-full text-left text-red-600"
                onClick={() => {
                  setMenus(menus.filter((entry) => entry.id !== activeMenu.id));
                  setOpenMenuActionsId(null);
                  setMenuActionsAnchorEl(null);
                }}
              >
                Delete menu
              </button>
            </div>
          </PopoverShell>
        ) : null}
      </FloatingPopover>
      <FloatingPopover
        anchorEl={addMenuAnchorEl}
        open={addMenuPopoverOpen && Boolean(addMenuAnchorEl)}
        placement="auto"
        align="start"
        className="menu-actions-popover"
        dataAttribute="data-add-menu-popover"
      >
        <PopoverShell
          title="Add menu"
          subtitle="Select menu type"
          variant="editor"
          compact
          onClose={() => setAddMenuPopoverOpen(false)}
          footer={
            <PopoverActions
              onCancel={() => setAddMenuPopoverOpen(false)}
              onSave={saveNewMenu}
              saveLabel="Save"
            />
          }
        >
          <PopoverField label="Menu type">
            <select
              className="popover-input"
              value={newMenuType}
              onChange={(event) => setNewMenuType(event.target.value as HeaderMenuItem["type"])}
            >
              <option value="link">Link</option>
              <option value="single-dropdown">Single Dropdown</option>
              <option value="multi-level-dropdown">Multi Column Dropdown</option>
            </select>
          </PopoverField>
        </PopoverShell>
      </FloatingPopover>
    </div>
  );
}
