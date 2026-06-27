# Website Builder — Project Documentation

This document describes the **website-builder-antd** project: what it is, how it works, and everything implemented in the visual editor so far.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Application routes](#application-routes)
5. [Marketing site & build flow](#marketing-site--build-flow)
6. [Authentication](#authentication)
7. [Admin panel](#admin-panel)
8. [Builder layout](#builder-layout)
9. [Section system](#section-system)
10. [Visual editor features](#visual-editor-features)
11. [Popover & toolbar system](#popover--toolbar-system)
12. [Data model & state](#data-model--state)
13. [Traits & section settings](#traits--section-settings)
14. [Image upload](#image-upload)
15. [Rich text & inline styling](#rich-text--inline-styling)
16. [CSS design system](#css-design-system)
17. [Project structure](#project-structure)
18. [Session changelog](#session-changelog)
19. [Known limitations](#known-limitations)

---

## Overview

**Webeix** is a section-based website builder with a public marketing site, authenticated user dashboard, full-page onboarding flow, and admin panel.

Users compose pages from pre-built section variants (hero, features, testimonials, CTA, header, footer), edit content inline on the canvas, and customize section-level design settings (background, spacing, colors, grid).

**Core ideas:**

- **Sections** are typed blocks with variants (e.g. `hero` → `hero-centered`, `hero-split`).
- **Props** hold content (text, images, buttons).
- **Settings** hold layout/visual traits (background, spacing, grid).
- **Inline editing** — click text, images, buttons, and links directly on the canvas.
- **Zustand store** holds the full site JSON during editing; draft is persisted via the API.
- **Build flow** at `/build` guides new users through AI generation, template pick, migration, or a blank start.

**Draft vs published:** The builder edits a **draft** copy. Visitors see the **published** copy at `/w/{slug}` until you click **Publish** in the top bar.

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

- `/` — Marketing homepage (logged-out); redirects logged-in users to dashboard/admin
- `/build` — Full-page “build a website” flow (AI, template, migrate, blank)
- `/templates` — Template gallery with industry filters
- `/dashboard` — User dashboard and site list (requires sign-in)
- `/dashboard/sites/{id}/builder` — Visual page builder (edits **draft** data)
- `/w/{websiteSlug}` — Published customer site (read-only)
- `/admin` — Admin panel (admin role only)
- `/login` — Full-page admin login; regular users use auth modals on `/`

---

## Application routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing homepage |
| `/build` | Build website onboarding flow |
| `/templates` | Marketing template gallery |
| `/login` | Admin login (full page); non-admin redirects to `/?login=1` modal |
| `/signup` | Redirects to `/?signup=1` modal |
| `/dashboard` | User dashboard |
| `/dashboard/sites/{id}/builder` | Per-site visual builder |
| `/w/{slug}` | Published customer websites |
| `/admin`, `/admin/users`, `/admin/websites`, … | Admin panel |
| `GET/PUT /api/site` | Load/save draft site JSON (legacy single-site API) |
| `POST /api/site/publish` | Copy draft → published |
| `POST /api/websites` | Create website (supports creation mode: ai, template, migrate, blank) |
| `POST /api/upload` | Image upload to `public/uploads/` |

Rendering logic for customer sites is in `app/w/[websiteSlug]/`. The visual builder UI is under `app/dashboard/sites/[websiteId]/builder/`.

---

## Marketing site & build flow

### Marketing pages

| Component / route | Description |
|-------------------|-------------|
| `app/page.tsx` | Homepage with hero (AI prompt or category picker), product peek, editor section, templates teaser, pricing |
| `app/templates/page.tsx` | Full template gallery with category filters |
| `app/marketing.css` | Webeix marketing design tokens and component styles |

CTAs (“Build a website”, nav button, AI generate) navigate to `/build` via `useBuildWebsiteFlow()` in `BuildWebsiteModalProvider`.

### Build flow (`/build`)

Implemented in `components/marketing/BuildWebsiteFlow.tsx`.

| Step | Mode | Behavior |
|------|------|----------|
| Options | — | Choose AI, template, migrate, or blank |
| AI | `ai` | Prompt → creates site → builder with `?flow=ai` |
| Template | `template` | Category → template pick → creates site from marketing template |
| Migrate | `migrate` | URL input → creates site → builder with `?flow=migrate` |
| Blank | `blank` | Creates empty site → builder |

**Unauthenticated users:** Intent is saved to `sessionStorage` (`lib/build-website-intent.ts`), signup modal opens **without leaving `/build`**. After sign-up, `BuildWebsiteIntentResume` executes the saved intent and redirects to the builder.

**Key files:**

- `components/marketing/BuildWebsiteFlow.tsx` — full-page UI
- `components/marketing/BuildWebsiteModalProvider.tsx` — `openBuildWebsite()` → `router.push('/build')`
- `components/marketing/BuildWebsiteIntentResume.tsx` — resumes flow after auth
- `lib/build-website-intent.ts` — intent storage and website creation

Template cards in the build flow reuse `TemplatePreviewCard` (`wx-tpl-card` styles) — same as `/templates`.

---

## Authentication

### User auth (modals)

Regular users sign in/up via modals, not the `/login` page.

| URL param | Opens |
|-----------|-------|
| `/?login=1` | Sign-in modal |
| `/?signup=1` | Sign-up modal |
| `?next=/path` | Post-login redirect (non-admin paths) |
| `?from=/path` | Return path when modal is closed without signing in |

**Return path:** `AuthModalProvider` remembers where the user was when the modal opened. Closing the modal (X, backdrop, Escape) navigates back to that path — e.g. closing signup on `/build` keeps you on `/build`.

Helpers in `lib/auth/user-login-url.ts`: `buildUserLoginUrl`, `buildUserSignupUrl`, `captureAuthReturnPath`, `sanitizeAuthReturnPath`.

### Admin auth

- Full-page login at `/login?next=/admin`
- Admin routes guarded by `lib/auth/admin.ts`
- Google OAuth supported for both user and admin flows

### Dashboard gate

Unauthenticated `/dashboard` requests redirect to `/?login=1&next=/dashboard&from=/`.

---

## Admin panel

Routes under `/admin` (admin role required):

| Route | Purpose |
|-------|---------|
| `/admin` | Overview |
| `/admin/users` | User list and role management |
| `/admin/websites` | Website list; name links open live site in new tab |
| `/admin/templates` | Placeholder |

Features: JSON export/import, secure delete confirm via portal popover, themed admin shell (`app/admin.css`).

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

Top bar: **Save** (draft), **Publish** (draft → live), **Undo/Redo**, status text, **View live site**.

### Left sidebar — Pages & section outline

`PagesList.tsx` — add, rename, delete, and switch between pages.

`SectionOutline.tsx` lists sections on the **active page**. Click a block to scroll the canvas to it. Supports:

- Reordering awareness (sections managed on canvas)
- Replace header / footer via section library modal

### Center — Canvas

`Canvas.tsx` renders the live page with edit mode enabled. Includes a **device preview bar** (mobile 375px / tablet 768px / desktop full width). Each section is wrapped in `SectionWrapper` (or `FixedSlotWrapper` for header/footer).

Header and footer support **add/remove** nav links, footer columns, and links; logo can switch between text and image.

### Right sidebar — Style & settings

`RightSidebar.tsx` tabs between:

- **Style** — `StylePanel.tsx` with sub-tabs:
  - **Themes** — brand colors, layout, custom theme presets
  - **Fonts** — Google font pairings and per-role font pickers
  - **Buttons** — global button size, weight, padding, radius, hover, shadow, default variant
  - **Cards** — card colors, border radius, reset-to-theme
- **Settings** — `SiteSettingsPanel.tsx` edits site name, global SEO, favicon, per-page title/slug/SEO, and **draft export/import**

### Section library modal

`SectionLibraryModal.tsx` — add or replace sections. Modes:

- Add section at index
- Replace existing section
- Replace header variant
- Replace footer variant
- Browse **Saved** sections (add mode only)

**Live previews** use `SectionVariantPreview.tsx` and `SavedSectionPreview.tsx`, wrapped in `SectionLibraryPreviewFrame.tsx`:

- Renders at 1200px width, scaled to fit each card
- Dynamic viewport height shows the **full section** (no cropping)
- Injects active theme CSS variables, Google Fonts, `site-theme-root`, `section-typography`, and `@container`
- Preview settings run through `migrateThemeBoundSectionSettings` so backgrounds match the user theme
- Dummy content from `lib/preview-props.ts`

Category sidebar with layout counts; saved sections show name, type badge, and variant label above the preview.

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
| `FeatureIcon.tsx` | Lucide-based icons for feature cards |
| `EditableIconPicker.tsx` | Click-to-pick icon editor for feature grid items |

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

- Style: Primary / Secondary / Outline / Light (stacked 2×2 grid in popover)
- Link type: Page / URL
- Page picker or URL input

**Styling** (`lib/button-styles.ts`, `app/globals.css`):

- Global `.site-button` variants driven by theme button settings
- Section and CTA overrides for contrast on colored backgrounds
- Button labels use `inheritSectionColor={false}` so section text color does not override button styles

`SectionContent.tsx` manages button arrays (add, remove, reorder) for hero, CTA, and header sections.

### Feature icon picker

`EditableIconPicker.tsx` — click the icon on a feature grid card in edit mode.

**Flow:**

1. Click icon badge → `IconPickerPopover.tsx` opens (floating, anchored below)
2. Grid of 19 Lucide icons from `lib/feature-icons.ts`
3. Select icon → updates `icon` field on the feature item via `SectionDataContext`
4. Popover injects theme CSS variables so icons use `--color-card-icon`

**Icon catalog** (`lib/feature-icons.ts`):

`layers`, `palette`, `sparkle`, `target`, `compass`, `grid`, `zap`, `shield`, `rocket`, `heart`, `star`, `globe`, `chart`, `users`, `clock`, `check`, `lightbulb`, `wrench`, `smartphone`

Rendered by `FeatureIcon.tsx` (Lucide React). Validated in `schema-grid.ts` via `z.enum(FEATURE_ICON_IDS)`.

**Note:** Icon picker uses `PopoverShell` with `variant="editor"` (not `toolbar`) because `.popover--toolbar .popover__body { display: none }` would hide the grid.

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
| `PopoverSegmented.tsx` | Segmented control for select fields (`inline` or `stacked` layout) |
| `PopoverSwitch.tsx` | Toggle switch for boolean traits |
| `SettingField.tsx` | Renders trait field by type (number, select, color, toggle, image) |
| `IconPickerPopover.tsx` | Feature card icon grid picker |
| `GoogleFontSelect.tsx` | Searchable Google Fonts dropdown for style panel |

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
| `importDraft` | Replace draft from validated JSON |
| `undo` / `redo` | Site history stack (~50 steps); ⌘Z / ⌘⇧Z |
| `previewDevice`, `scrollToSection` | Device preview width and outline scroll |
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

- `.site-button`, `.site-button--primary`, `.site-button--secondary`, `.site-button--outline`, `.site-button--light`
- `.button-item-trigger`, `.button-item-add` — button list UI

### Feature icons & icon picker

- `.feature-icon-wrap`, `.feature-icon-wrap--editable` — icon badge on feature cards
- `.feature-icon` — Lucide icon wrapper using `--color-card-icon`
- `.icon-picker-grid`, `.icon-picker-option` — 4-column picker grid in popover

### Section library previews

- `.section-library-preview`, `.section-library-preview-viewport` — scaled live section thumbnails
- `.section-library-preview-scale`, `.section-library-preview-content` — 1200px render + transform scale
- `.section-library-card`, `.section-library-grid` — modal layout cards

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
│   ├── page.tsx                    # Marketing homepage
│   ├── build/page.tsx              # Build website flow
│   ├── templates/page.tsx          # Template gallery
│   ├── dashboard/                  # User dashboard + per-site builder
│   ├── admin/                      # Admin panel
│   ├── login/                      # Admin login page
│   ├── w/[websiteSlug]/            # Published customer sites
│   ├── marketing.css               # Marketing styles
│   └── globals.css                 # Global + editor design system
├── components/
│   ├── marketing/                  # Homepage, build flow, template cards
│   ├── auth/                       # Auth modals and forms
│   ├── admin/                      # Admin UI
│   ├── builder/                    # Builder chrome
│   └── sections/                   # Section components + Zod schemas
├── lib/
│   ├── build-website-intent.ts     # Post-signup build resume
│   ├── auth/                       # Session, OAuth, login URLs
│   ├── editor/                     # Inline editing system
│   ├── traits/                     # Section settings traits
│   └── marketing/content.ts        # Marketing copy, templates, categories
├── docs/
│   └── PROJECT_DOCUMENTATION.md
└── store/
    └── builderStore.ts             # Zustand state
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

### Section library & previews

- [x] Section library modal with category sidebar and live previews
- [x] `SectionLibraryPreviewFrame` — theme-aware, full-height scaled previews
- [x] Theme-bound preview settings (`migrateThemeBoundSectionSettings`)
- [x] Saved sections tab in add mode
- [x] Google Fonts loaded in library previews

### Feature icon picker

- [x] Click-to-pick icon popover on feature grid cards
- [x] 19 Lucide icons in `lib/feature-icons.ts`
- [x] Theme-colored icons via `--color-card-icon` with fallback
- [x] Zod schema + migration use shared icon catalog

### Global style system

- [x] Style sidebar: Themes, Fonts, Buttons, Cards panels
- [x] Card colors sync on theme preset apply + reset-to-theme
- [x] Uniform site-wide button styles (primary, secondary, outline, light)
- [x] CTA banner contrast, spacing, and full button style options

### Git

- [x] Committed and pushed to `main` (`6953f21`)

### Marketing site & platform (2026)

- [x] Webeix marketing homepage with AI hero and category/template discovery
- [x] Template gallery at `/templates`
- [x] Full-page build flow at `/build` (AI, template, migrate, blank)
- [x] Build intent session storage + resume after sign-up
- [x] User auth modals (`/?login=1`, `/?signup=1`) with return-path on close
- [x] Admin panel (`/admin`) — users, websites, roles, export/import
- [x] User dashboard with multi-site management
- [x] Google OAuth sign-in
- [x] Published sites at `/w/{websiteSlug}`

---

## Known limitations

| Area | Limitation |
|------|------------|
| HEIC | Not supported in most browsers; user must convert to JPEG/PNG |
| Rich text | Only `<span>` highlights; no lists, links inside text, etc. |
| Header/footer | Single variant each in registry (extensible) |
| Image size | Large uploads increase JSON size; 8 MB upload cap, 1920px max dimension |
| Accounts | Multi-user with roles; admin panel for management |
| AI / migrate build | UI and intent storage in place; generation/migration logic is placeholder |
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

## Adding a new feature icon

1. Add id and label to `FEATURE_ICON_IDS` / `FEATURE_ICON_LABELS` in `lib/feature-icons.ts`
2. Map id → Lucide component in `components/sections/features/FeatureIcon.tsx`
3. Schema in `schema-grid.ts` picks up new ids automatically via `z.enum(FEATURE_ICON_IDS)`

---

*Last updated: June 2026 — reflects marketing site, `/build` flow, auth modals, admin panel, and builder on `main`.*
