# Website Builder — Project Documentation

This document describes the **website-builder-antd** project: what it is, how it works, and everything implemented in the visual editor so far.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Application routes](#application-routes)
5. [Builder layout](#builder-layout)
6. [Section system](#section-system)
7. [Visual editor features](#visual-editor-features)
8. [Popover & toolbar system](#popover--toolbar-system)
9. [Data model & state](#data-model--state)
10. [Traits & section settings](#traits--section-settings)
11. [Image upload](#image-upload)
12. [Rich text & inline styling](#rich-text--inline-styling)
13. [CSS design system](#css-design-system)
14. [Project structure](#project-structure)
15. [Session changelog](#session-changelog)
16. [Known limitations](#known-limitations)

---

## Overview

A **section-based website builder** built with Next.js. Users compose pages from pre-built section variants (hero, features, testimonials, CTA, header, footer), edit content inline on the canvas, and customize section-level design settings (background, spacing, colors, grid).

The builder lives at `/builder`. The public homepage at `/` renders the site from stored JSON data.

**Core ideas:**

- **Sections** are typed blocks with variants (e.g. `hero` → `hero-centered`, `hero-split`).
- **Props** hold content (text, images, buttons).
- **Settings** hold layout/visual traits (background, spacing, grid).
- **Inline editing** — click text, images, buttons, and links directly on the canvas.
- **Zustand store** holds the full site JSON during editing; draft is persisted to SQLite via the API.

**Draft vs published:** The builder edits a **draft** copy. Visitors see the **published** copy at `/` until you click **Publish** in the top bar.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + custom CSS (`app/globals.css`) |
| State | Zustand (`store/builderStore.ts`) |
| Database | SQLite + Prisma 5 (`prisma/schema.prisma`) |
| Validation | Zod (section props schemas, site schema) |
| Icons | Lucide React |

---

## Getting started

```bash
npm install
npx prisma migrate deploy
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

**Key URLs:**

- `/` — Published site (read-only render from **published** data)
- `/about`, etc. — Additional published pages by slug
- `/builder` — Visual page builder (edits **draft** data)

---

## Application routes

| Route | File | Purpose |
|-------|------|---------|
| `/`, `/about`, … | `app/[[...slug]]/page.tsx` | Renders **published** pages; `generateMetadata` for SEO |
| `/builder` | `app/builder/page.tsx` | Full builder UI (draft editing) |
| `GET/PUT /api/site` | `app/api/site/route.ts` | Load/save **draft** site JSON |
| `POST /api/site/publish` | `app/api/site/publish/route.ts` | Copy draft → published |
| `POST /api/upload` | `app/api/upload/route.ts` | Image upload to `public/uploads/` |

Rendering logic is centralized in `lib/renderer.tsx`, which validates section props against Zod schemas and wraps sections in `SectionDataProvider` for consistent data access.

---

## Builder layout

`components/builder/BuilderLayout.tsx` — three-column layout:

```
┌──────────────┬────────────────────────────┬──────────────┐
│ Pages +      │                            │ Theme /      │
│ Section      │         Canvas             │ Settings     │
│ Outline      │         (fluid)            │ (300px)      │
│ (240px)      │                            │              │
└──────────────┴────────────────────────────┴──────────────┘
```

Top bar: **Save** (draft), **Publish** (draft → live), status text, **View live site**.

### Left sidebar — Pages & section outline

`PagesList.tsx` — add, rename, delete, and switch between pages.

`SectionOutline.tsx` lists sections on the **active page**. Supports:

- Reordering awareness (sections managed on canvas)
- Replace header / footer via section library modal

### Center — Canvas

`Canvas.tsx` renders the live page with edit mode enabled. Each section is wrapped in `SectionWrapper` (or `FixedSlotWrapper` for header/footer).

### Right sidebar — Theme & settings

`RightSidebar.tsx` tabs between:

- **Theme** — `ThemePanel.tsx` edits global theme tokens (colors, fonts, spacing)
- **Settings** — `SiteSettingsPanel.tsx` edits site name, global SEO, favicon, and per-page title/slug/SEO

### Section library modal

`SectionLibraryModal.tsx` — add or replace sections. Modes:

- Add section at index
- Replace existing section
- Replace header variant
- Replace footer variant

Includes `SectionVariantPreview.tsx` for variant thumbnails.

---

## Section system

Sections are registered in `lib/registry.ts`.

### Section types & variants

| Type | Variants | Category |
|------|----------|----------|
| `header` | `header-simple` | header |
| `hero` | `hero-centered`, `hero-split` | hero |
| `features` | `features-grid-3`, `features-alternating` | content |
| `testimonials` | `testimonials-grid` | social-proof |
| `cta` | `cta-banner` | cta |
| `footer` | `footer-simple` | footer |

Each variant defines:

- `component` — React component
- `propsSchema` — Zod schema for content props
- `traits` — which settings traits apply
- `settingsDefaults` — default trait values
- `defaultProps` — default content when added

### Section wrapper

`SectionWrapper.tsx` provides:

- Hover toolbar (settings, replace, duplicate, hide, move, delete)
- `SectionDataProvider` for inline editing
- `SectionSettingsProvider` for trait hooks
- Section label badge on hover

**Fixed slots:** Header and footer use `FixedSlotWrapper.tsx` — cannot be deleted, reordered, or duplicated. They have their own settings gear and replace action.

### Shared section primitives

| Component | Purpose |
|-----------|---------|
| `SectionShell.tsx` | Applies background, spacing, text color from traits |
| `SectionHeader.tsx` | Shared heading/subheading block |
| `SectionContent.tsx` | `SectionHeading`, `SectionButtons`, button list editing |

---

## Visual editor features

Edit mode is controlled by `EditModeContext` (`lib/editor/EditModeContext.tsx`). When `isEditing` is true, inline editors activate on the canvas.

### Section toolbar

`SectionToolbarButton.tsx` — pill-shaped floating toolbar on section hover.

**Icons (Lucide):**

| Icon | Action |
|------|--------|
| Settings | Open section settings panel |
| RefreshCw | Replace section variant |
| Copy | Duplicate section |
| EyeOff | Hide section |
| ArrowUp / ArrowDown | Reorder section |
| Trash2 | Delete section |

**Design:**

- Circular bordered icon buttons in a white pill container
- Tooltip on every icon (`lib/editor/Tooltip.tsx`)
- Disabled state for fixed slots (header/footer) on destructive/move actions

### Inline text editing

`EditableText.tsx` — click any text field on the canvas to edit in place.

**Behavior:**

- Uses `contentEditable` in edit mode
- Content initialized via ref callback (prevents empty flash and Apply-clearing bugs)
- Floating toolbar portaled to `document.body` via `FloatingToolbar` / `FloatingPopover`
- Click outside closes editor (respects `data-inline-text-toolbar` attribute)

**Text toolbar** (`InlineTextToolbar.tsx`) — two tabs:

| Tab | Controls |
|-----|----------|
| **Text** | Tag (H1–H4, P, span), font family, font size, text color |
| **Highlight** | Partial selection styling: solid color, gradient, or font override |

**Persisted fields** (per `dataKey`):

| Field | Example key | Description |
|-------|-------------|-------------|
| Plain text | `heading` | Fallback plain text |
| Rich HTML | `headingHtml` | Sanitized HTML with `<span>` highlights |
| Tag | `headingTag` | Semantic tag override |
| Font | `headingFontFamily` | Google font family |
| Size | `headingFontSize` | Pixel font size |
| Color | `headingColor` | Text color |

**Button label editing:**

- Button labels use `EditableText` with `inheritSectionColor={false}` so section text color does not override button styles
- Color picker reads computed color from the button element via `getComputedStyle` + `rgbToHex`
- Buttons show `ButtonToolbar` only (no Text/Highlight tabs) via `buttonSettings` prop

### Button editing

`ButtonToolbar.tsx` + `ButtonSettingsFields.tsx` — floating toolbar when editing a button label.

**Controls:**

- Variant: Primary / Secondary
- Link type: Page / URL
- Page picker or URL input

**Styling** (`app/globals.css`):

- `.hero-button` base styles
- `.hero-button--primary` — filled primary
- `.hero-button--secondary` — bordered secondary (fixed missing border)
- Section default text color does not cascade into button text

`SectionContent.tsx` manages button arrays (add, remove, reorder) for hero sections.

### Image editing

`EditableImage.tsx` — camera icon overlay on editable images.

**Image popover** (`ImageUrlPopover.tsx`):

| Feature | Description |
|---------|-------------|
| URL input | Paste external image URL |
| File upload | Drag-and-drop or browse from computer |
| Alt text | Accessibility description |
| Title | SEO / hover tooltip (`imageTitle` field) |
| Preview | Instant blob preview, then compressed data URL |

**Rendering** (`RenderDivImage`):

- Uses `<img>` element (not CSS `background-image`) for reliable data URL display
- `title` attribute for SEO
- `alt` on `<img>` for accessibility

**Popover positioning:**

- Portaled via `FloatingPopover` — does not shift page layout
- Anchored to camera button, aligned below-end

### Link editing

`EditableLink.tsx` + `LinkEditorPopover.tsx` — inline link URL/page editing for nav links and similar.

---

## Popover & toolbar system

### Architecture

```
FloatingPopover (lib/editor/FloatingPopover.tsx)
├── Portals to document.body
├── position: fixed, computed in useLayoutEffect
├── Smart placement: above/below/auto, start/end align
└── z-index: 10000

FloatingToolbar (lib/editor/FloatingToolbar.tsx)
└── Thin wrapper around FloatingPopover with toolbar CSS classes

PopoverShell (lib/editor/PopoverShell.tsx)
├── Shared popover chrome (header, body, footer, close)
├── Variants: editor | settings | toolbar
└── PopoverField, PopoverActions helpers
```

### Supporting UI components

| Component | Purpose |
|-----------|---------|
| `Tooltip.tsx` | CSS hover tooltips (top/bottom/left/right) |
| `ColorSwatchInput.tsx` | Color picker swatch + hex input |
| `PopoverSegmented.tsx` | Segmented control for select fields |
| `PopoverSwitch.tsx` | Toggle switch for boolean traits |
| `SettingField.tsx` | Renders trait field by type (number, select, color, toggle, image) |

### Click-outside behavior

- Image popover: ignores clicks while file picker is open or upload in progress
- Text toolbar: ignores clicks inside `[data-inline-text-toolbar]`
- Section settings: `stopPropagation` on mousedown to avoid accidental closes

---

## Data model & state

### Site structure (`lib/types.ts`, `lib/schemas.ts`)

```ts
WebsiteData {
  meta: { name, ... }
  theme: { colors, fonts, ... }
  navigation: NavigationConfig  // header
  footer: FooterConfig
  pages: [{
    sections: SectionInstance[]
  }]
}

SectionInstance {
  id: string
  type: string        // e.g. "hero"
  variant: string     // e.g. "hero-centered"
  props: Record<string, unknown>   // content
  settings: Record<string, unknown> // traits
  hidden?: boolean
}
```

### Zustand store (`store/builderStore.ts`)

| Action | Description |
|--------|-------------|
| `addSection` | Insert section at index |
| `removeSection` | Delete section (not fixed slots) |
| `duplicateSection` | Clone section below |
| `reorderSections` | Move up/down |
| `updateSectionProps` | Update content fields |
| `updateSectionSettings` | Update trait settings |
| `replaceSection` | Swap type/variant |
| `toggleSectionHidden` | Show/hide section |
| `resetSectionToDefault` | Reset props + settings |
| `updateTheme` | Global theme tokens |
| `updateNavigation` / `updateFooter` | Header/footer content |
| `updateSiteMeta` | Site name, SEO, favicon |
| `loadSite` / `saveSite` / `publishSite` | Draft load, save, publish workflow |
| `activePageId`, `addPage`, `removePage`, `updatePageMeta` | Multi-page management |

### Persistence & draft/publish

| Field / API | Purpose |
|-------------|---------|
| `draftData` (Prisma) | Builder reads/writes this |
| `publishedData` (Prisma) | Public routes render this |
| `GET /api/site` | Returns draft + publish status |
| `PUT /api/site` | Saves draft (Zod-validated) |
| `POST /api/site/publish` | Copies draft → published |

**Autosave:** Draft saves automatically ~2s after the last edit. Manual **Save** forces an immediate write. Failed saves show an error and keep `isDirty` true. The browser warns before closing a tab with unsaved local changes.

Initial data lazy-seeds from `data/sample-site.json` when the database is empty (both draft and published).

### Context providers

| Context | Purpose |
|---------|---------|
| `SectionDataContext` | `data` + `updateField(key, value)` per section |
| `SectionSettingsProvider` | Resolved trait settings for hooks |
| `EditModeContext` | `isEditing` flag |
| `SiteContext` | Site-level data where needed |

---

## Traits & section settings

Traits are defined in `lib/traits/registry.ts` and assigned per variant in the registry.

### Available traits

| Trait | Category | Fields |
|-------|----------|--------|
| `grid` | layout | columns, gap |
| `background` | background | type (solid/gradient/image), colors, image, overlay |
| `textColor` | typography | text color |
| `spacing` | layout | padding top/bottom |
| `reversible` | layout | reverse column order (split hero) |

### Settings panel

`SectionSettingsPanel.tsx`:

- Tabbed UI: **Design** | **Background** | **Colors**
- Conditional fields via `showIf` (`lib/traits/field-utils.ts`)
- Resolved settings via `resolveSectionSettings` (`lib/traits/normalize.ts`)

### Trait hooks

`lib/traits/hooks.ts` — `useBackgroundStyle`, `useTextColorStyle`, `useSpacingStyle`, `useGridStyle`, `useReversedLayout` consumed by `SectionShell` and section components.

---

## Image upload

Implementation: `lib/image-upload.ts` + `lib/editor/ImageUrlPopover.tsx` + `POST /api/upload`

### Flow

1. User clicks camera icon → floating popover opens (anchored, no layout shift)
2. User drops file or clicks browse
3. **Instant preview** via `URL.createObjectURL(file)` (blob URL)
4. File is read, optionally compressed via canvas
5. Uploaded to `/api/upload` → stored under `public/uploads/`; URL saved in section props (or favicon in site meta)

Legacy base64 data URLs in existing JSON still render.

### Processing rules

| Rule | Value |
|------|-------|
| Max file size | 8 MB |
| Max dimension | 1920px (scaled down) |
| Output format | JPEG (85% quality) or PNG (if source is PNG) |
| SVG | Stored as raw data URL (no rasterization) |
| HEIC/HEIF | Rejected with user-friendly error |

### Image props schema

Hero and alternating features schemas include:

```ts
image: z.string().min(1)
imageAlt: z.string().min(1)
imageTitle: z.string().optional()
```

---

## Rich text & inline styling

`lib/editor/rich-text.ts` handles partial text highlighting within `contentEditable`.

### Highlight modes

| Mode | Implementation |
|------|----------------|
| Color | `color` inline style on `<span>` |
| Gradient | `background-image` + `background-clip: text` |
| Font | `font-family` on selected `<span>` |

### Sanitization

- Only `<span>` tags allowed in stored HTML
- Allowed inline styles: `color`, `font-family`, `background-image`, `background-clip`, `-webkit-background-clip`, `display`
- Script tags stripped
- Class `editable-text-highlight` applied to highlighted spans

### Font options

`lib/editor/text-toolbar-options.ts` — curated Google Font list for text and highlight font dropdowns.

---

## CSS design system

Primary styles in `app/globals.css`.

### Section toolbar

- `.section-toolbar` — pill container
- `.section-toolbar-btn` — circular bordered buttons
- `.section-toolbar-btn--danger` — delete variant

### Popovers

- `.popover` — base card (320px width, shadow, radius)
- `.popover--editor` / `.popover--settings` / `.popover--toolbar` variants
- `.popover--toolbar-floating` / `.popover--editor-floating` — fixed positioning
- `.popover-field`, `.popover-input`, `.popover-btn` — form controls

### Buttons on canvas

- `.hero-button`, `.hero-button--primary`, `.hero-button--secondary`
- `.button-item-trigger`, `.button-item-add` — button list UI

### Images

- `.image-upload-btn` — camera overlay button
- `.render-div-image`, `.render-div-image__img` — image rendering
- `.popover-image-upload__dropzone` — upload zone in popover

### Tooltips

- `.ui-tooltip`, `.ui-tooltip__bubble` — pure CSS hover tooltips

---

## Project structure

```
website-builder-antd/
├── app/
│   ├── builder/page.tsx      # Builder route
│   ├── page.tsx              # Public site
│   ├── layout.tsx
│   └── globals.css           # Global + editor design system
├── components/
│   ├── builder/              # Builder chrome (canvas, outline, modals)
│   └── sections/             # Section components + Zod schemas
│       ├── hero/
│       ├── features/
│       ├── testimonials/
│       ├── cta/
│       ├── header/
│       ├── footer/
│       └── shared/
├── data/
│   └── sample-site.json      # Initial site data
├── docs/
│   └── PROJECT_DOCUMENTATION.md
├── lib/
│   ├── editor/               # Inline editing system
│   ├── traits/               # Section settings traits
│   ├── registry.ts           # Section catalog
│   ├── renderer.tsx          # Site renderer
│   ├── schemas.ts            # Zod site schema
│   ├── image-upload.ts       # Client-side image processing
│   └── types.ts
└── store/
    └── builderStore.ts       # Zustand state
```

---

## Session changelog

Everything implemented across the builder editing sessions:

### Builder shell & sections

- [x] Section-based website builder with visual canvas
- [x] Section library modal (add / replace / header / footer)
- [x] Section outline sidebar
- [x] Theme panel for global colors/fonts
- [x] Fixed header/footer slots with `FixedSlotWrapper`
- [x] Section settings panel with tabbed traits
- [x] Conditional trait fields (`showIf`)
- [x] Persist header/footer settings

### Section toolbar

- [x] Pill-shaped floating toolbar on section hover
- [x] Lucide React icons (replaced prior icon set)
- [x] Tooltips on every toolbar icon (including disabled buttons)
- [x] Settings, replace, duplicate, hide, reorder, delete actions

### Inline text editing

- [x] Click-to-edit `contentEditable` text
- [x] Floating text toolbar portaled to `document.body` (no clipping/z-index issues)
- [x] Text tab: tag, font, size, color
- [x] Highlight tab: partial selection color, gradient, font
- [x] Rich text stored in `{field}Html` with sanitization
- [x] Fix: text empty until focused
- [x] Fix: Apply button clearing text (no React children on contentEditable)
- [x] Fix: popover overflow and z-index
- [x] Font family on highlighted text spans

### Button editing

- [x] Combined button settings while editing button labels
- [x] Dedicated `ButtonToolbar` (variant + link only, no Text/Highlight tabs)
- [x] Section text color does not affect button text
- [x] Secondary button border styling fixed
- [x] Color picker uses computed button color (not default black)
- [x] Removed separate gear icon / `ButtonEditorPopover` from hero buttons

### Image editing

- [x] Floating image popover (no layout shift)
- [x] Upload from computer (drag-and-drop + browse)
- [x] Client-side compression to data URL
- [x] Instant blob preview while processing
- [x] Alt text field
- [x] Title attribute for SEO (`imageTitle`)
- [x] `<img>` rendering for reliable data URL display
- [x] Fix: popover open delay (sync layout positioning)
- [x] Fix: save not reflecting after upload (`type="url"` rejected data URLs)
- [x] Fix: popover closing during file picker / upload
- [x] HEIC rejection with clear error message

### Infrastructure

- [x] `FloatingPopover` shared positioning primitive
- [x] `PopoverShell` unified popover design system
- [x] `lib/color-utils.ts` — `rgbToHex`, `resolveColorForPicker`
- [x] `lib/preview-props.ts` — preview data for section library
- [x] `lib/section-placement.ts` — fixed slot helpers
- [x] Lucide React added to dependencies

### Git

- [x] Committed and pushed to `main` (`6953f21`)

---

## Known limitations

| Area | Limitation |
|------|------------|
| HEIC | Not supported in most browsers; user must convert to JPEG/PNG |
| Rich text | Only `<span>` highlights; no lists, links inside text, etc. |
| Header/footer | Single variant each in registry (extensible) |
| Image size | Large uploads increase JSON size; 8 MB upload cap, 1920px max dimension |
| Accounts | Single site, no authentication or multi-tenancy |
| Version history | No rollback beyond re-publishing draft |

---

## Adding a new section variant

1. Create component in `components/sections/{type}/`
2. Export Zod schema + props type from `schema-*.ts`
3. Register in `lib/registry.ts` with traits and `defaultProps`
4. Use `EditableText`, `EditableImage`, `SectionShell` patterns from existing sections
5. Add preview props to `lib/preview-props.ts` if needed for library modal

---

## Adding a new trait

1. Define in `lib/traits/registry.ts` with fields and `defaultValues`
2. Add trait id to variant's `traits` array in `lib/registry.ts`
3. Implement hook in `lib/traits/hooks.ts` if needed
4. Apply in `SectionShell.tsx` or section component

---

*Last updated: June 2026 — reflects Phase 4 (draft/publish, autosave, site settings) on `main`.*
