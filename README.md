# Website Builder

A section-based visual website builder built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Zustand**. Compose pages from pre-built sections, edit text/images/buttons inline on the canvas, and customize section design settings.

## Quick start

```bash
npm install
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Published site preview |
| http://localhost:3000/builder | Visual page builder |

## Features

- **Section library** — hero, features, testimonials, CTA, header, footer variants
- **Inline editing** — click text, images, buttons, and links directly on the canvas
- **Floating toolbars** — text styling, partial highlights, button settings, image upload
- **Section settings** — background, spacing, grid, colors via trait panel
- **Theme panel** — global color and font tokens
- **Image upload** — browse or drag-and-drop from your computer (client-side, no server required)

## Tech stack

Next.js 14 · TypeScript · Tailwind CSS v3 · Zustand · Zod · Lucide React

## Documentation

Full project documentation — architecture, editor features, data model, file structure, and session changelog:

**[docs/PROJECT_DOCUMENTATION.md](./docs/PROJECT_DOCUMENTATION.md)**

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Project layout

```
app/              Next.js routes (/builder, /)
components/
  builder/        Canvas, outline, modals, section wrapper
  sections/       Section components + Zod schemas
lib/
  editor/         Inline editing (text, image, button, link)
  traits/         Section settings system
  registry.ts     Section catalog
store/            Zustand site state
data/             Sample site JSON
docs/             Project documentation
```

## License

Private project.
