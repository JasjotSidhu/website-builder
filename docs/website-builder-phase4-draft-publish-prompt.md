# Website builder — Phase 4: draft/publish workflow + autosave + site settings

## Where this picks up

Phase 3 added SQLite persistence, multi-page editing, image upload to `/uploads/`, and explicit Save. The builder now loads/saves a single site via `GET/PUT /api/site`, and public routes render from the same stored JSON at `app/[[...slug]]/page.tsx`.

**Problem today:** saving in the builder immediately updates what visitors see on the live site. There is no draft vs published split, no autosave, and no UI for site-wide or per-page SEO settings (`PageData.seo` exists in types but is not editable).

**Scope for this phase:** single site, no accounts, no multi-tenancy. Add a draft/publish workflow, autosave for the draft, and a settings panel for site + page metadata. Everything else (multi-site, auth, rich text lists, new section variants) stays out of scope.

---

## Part A — Draft vs published

### Schema migration (`prisma/schema.prisma`)

Extend the existing `Site` model. Migrate from a single `data` column to separate draft and published payloads:

```prisma
model Site {
  id            String    @id @default(cuid())
  name          String
  draftData     String    // WebsiteData JSON — builder reads/writes this
  publishedData String    // WebsiteData JSON — public routes render this
  publishedAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

Run `npx prisma migrate dev --name draft_publish`.

**Migration strategy for existing rows:**

- If `draftData` / `publishedData` are empty but legacy `data` exists, copy `data` into both columns.
- On first boot after migration, seed both from `sample-site.json` if no row exists (same lazy seed as Phase 3).

### Site store helpers (`lib/site-store.ts`)

Refactor helpers so draft and published are explicit:

```typescript
export async function getDraftSiteData(): Promise<WebsiteData>;
export async function getPublishedSiteData(): Promise<WebsiteData>;
export async function saveDraftSiteData(site: WebsiteData): Promise<void>;
export async function publishSiteData(): Promise<void>; // copies draft → published, sets publishedAt
export async function hasUnpublishedChanges(): Promise<boolean>; // shallow JSON compare or hash
```

- Always run `websiteSchema.parse` + `normalizeSiteSections` on read/write.
- `publishSiteData` copies `draftData` → `publishedData` atomically in one Prisma update.

### API routes

Replace or extend `app/api/site/route.ts`:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/site` | Return **draft** data (builder) |
| `PUT` | `/api/site` | Save **draft** data |
| `GET` | `/api/site/published` | Return published data (optional; public SSR can call store directly) |
| `POST` | `/api/site/publish` | Copy draft → published |

Public rendering (`app/[[...slug]]/page.tsx`) must call `getPublishedSiteData()`, **not** draft.

### Builder store (`store/builderStore.ts`)

| Field / action | Change |
|----------------|--------|
| `hasUnpublishedChanges` | `boolean` — true when draft differs from last known published snapshot |
| `publishedAt` | `Date \| null` — from server after load/publish |
| `loadSite` | Load draft; also fetch publish status |
| `saveSite` | Save draft only (rename internally to `saveDraft` if clearer) |
| `publishSite` | `POST /api/site/publish`; clear unpublished flag on success |

Do **not** write to published data from any existing mutating action.

### Top bar (`components/builder/BuilderTopBar.tsx`)

Extend the Phase 3 top bar:

| Element | Behavior |
|---------|----------|
| **Save** | Saves draft (disabled when `!isDirty \|\| isSaving`) |
| **Publish** | Copies draft → live; disabled when `!hasUnpublishedChanges \|\| isPublishing` |
| Status text | "All changes saved" / "Unsaved changes" / "Unpublished changes" / "Publishing…" |
| View live site | Opens `/` in new tab (shows **published** site) |

Optional: add a "Preview draft" link that opens a `/preview` route rendering draft with a query flag or separate route — only if trivial; otherwise defer.

---

## Part B — Autosave + save reliability

Phase 3 uses explicit Save only. Add debounced autosave for the draft.

### Store additions

```typescript
interface BuilderState {
  // ...existing
  saveError: string | null;
  autosaveEnabled: boolean; // default true
}
```

```typescript
// Debounce draft save ~2s after last mutation while isDirty
// Use a module-level timer or useDebouncedCallback from builder layout
autosaveDraft: () => Promise<void>;
```

Wire autosave trigger: after any mutating action sets `isDirty: true`, schedule debounced `saveSite()`.

### Error handling

- On save failure: set `saveError`, show banner or inline message in top bar.
- Do **not** silently clear `isDirty` on failure.
- On success: clear `saveError`, set `lastSavedAt`.

### Validation before save

In `PUT /api/site` and `saveDraftSiteData`:

```typescript
const site = normalizeSiteSections(websiteSchema.parse(body) as WebsiteData);
```

Return `400` with Zod issue summary if validation fails.

### Unload guard

In `BuilderLayout`, when `isDirty`:

```typescript
window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  e.returnValue = "";
});
```

---

## Part C — Site & page settings panel

`updatePageMeta` already supports `title`, `slug`, and `seo`. Expose them in the UI.

### New component: `SiteSettingsPanel.tsx`

Location: right sidebar — add a tab or section above/below `ThemePanel`, or a gear in the top bar.

**Site tab**

| Field | Maps to |
|-------|---------|
| Site name | `site.meta.name` |
| SEO title | `site.meta.seo.title` |
| SEO description | `site.meta.seo.description` |
| Favicon | `site.meta.favicon` (upload via `/api/upload` → URL) |

**Page tab** (active page from `activePageId`)

| Field | Maps to |
|-------|---------|
| Page title | `page.title` |
| Slug | `page.slug` (reuse `validatePageSlug` from `lib/page-slugs.ts`) |
| SEO title | `page.seo.title` |
| SEO description | `page.seo.description` |

Reuse slug validation from `NewPageDialog` — show inline errors, do not silent-fail.

All changes mark `isDirty: true` and flow through existing store patch helpers.

### Public meta tags

Update `app/layout.tsx` or `app/[[...slug]]/page.tsx` to emit:

```tsx
export async function generateMetadata({ params }) {
  const site = await getPublishedSiteData();
  const page = site.pages.find(...);
  return {
    title: page.seo?.title ?? page.title ?? site.meta.seo.title,
    description: page.seo?.description ?? site.meta.seo.description,
  };
}
```

Add favicon link from `site.meta.favicon` when set.

---

## Part D — Documentation refresh

Update `docs/PROJECT_DOCUMENTATION.md` to reflect Phase 3 **and** Phase 4:

- Persistence (SQLite, Prisma, `/api/site`)
- Multi-page editing (`PagesList`, `activePageId`, catch-all routes)
- Image upload to `/uploads/`
- Draft vs published workflow
- Autosave behavior
- Remove outdated "in-memory only" and "single homepage" limitations

---

## Optional follow-ups (Phase 4.5 — pick separately)

Do **not** block Phase 4 on these. Implement only if time allows after acceptance criteria pass.

### Navigation & footer structure

- Add/remove header nav links (labels already editable via `EditableNavLink`)
- Add/remove footer columns and links
- Logo type toggle (text vs image) in header/footer settings

### Builder UX polish

- Section outline click → scroll to section on canvas
- Device preview width toggle (mobile / tablet / desktop)
- Undo/redo (Zustand history stack)

### Export / import

- Download draft JSON
- Import JSON with confirmation (replace draft)

### Media housekeeping

- On publish, optionally prune orphaned files in `public/uploads/` not referenced in published JSON
- Ensure background trait `image` field uses `/api/upload` (not base64)

---

## Out of scope for this phase (don't build)

- Multi-site / user accounts / authentication
- Custom domains and hosting deployment
- Scheduled publish or version history / rollback beyond re-publish
- Rich text lists and in-text hyperlinks
- New section variants (header/footer alternates)
- Real-time collaboration
- Replacing explicit Publish with "everything auto-goes-live on save"

---

## Acceptance criteria

### Draft vs published

- [ ] Editing and saving in the builder does **not** change the live site until **Publish** is clicked
- [ ] **Publish** copies draft to published; `/` and `/about` (etc.) reflect published content
- [ ] Top bar shows when draft has unpublished changes
- [ ] "View live site" opens the **published** site, not draft
- [ ] First run with empty DB seeds both draft and published from `sample-site.json`

### Autosave & reliability

- [ ] Draft autosaves ~2s after the last edit without clicking Save
- [ ] Manual Save still works and forces immediate write
- [ ] Failed saves show an error; `isDirty` stays true
- [ ] Invalid site JSON is rejected with a readable validation error
- [ ] Browser warns before closing tab when there are unsaved local changes

### Site & page settings

- [ ] Site name editable and reflected in builder top bar
- [ ] Global SEO title/description editable and persisted
- [ ] Per-page title, slug, and SEO fields editable for the active page
- [ ] Slug validation prevents duplicates and invalid formats
- [ ] Public pages emit `<title>` and meta description from stored SEO

### Documentation

- [ ] `PROJECT_DOCUMENTATION.md` updated for Phase 3 and Phase 4

---

## Suggested implementation order

1. Prisma migration: `draftData` + `publishedData` + migrate existing `data`
2. Refactor `lib/site-store.ts` and API routes (draft save, publish endpoint)
3. Public routes → `getPublishedSiteData()`; builder → draft only
4. Top bar: Publish button + unpublished status
5. Autosave + error handling + validation on save
6. Site & page settings panel + `generateMetadata`
7. Documentation update

---

## Key files to touch

| Area | Files |
|------|-------|
| Database | `prisma/schema.prisma`, new migration |
| Server | `lib/site-store.ts`, `app/api/site/route.ts`, `app/api/site/publish/route.ts` |
| Public | `app/[[...slug]]/page.tsx`, `app/layout.tsx` |
| Builder | `store/builderStore.ts`, `components/builder/BuilderTopBar.tsx`, `components/builder/BuilderLayout.tsx` |
| Settings UI | `components/builder/SiteSettingsPanel.tsx` (new), `components/builder/ThemePanel.tsx` or layout |
| Docs | `docs/PROJECT_DOCUMENTATION.md` |

---

*Phase 4 follows commit `b688fc9` (persistence, multi-page, image upload, EditableText fixes) on `main`.*
