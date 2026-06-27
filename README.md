# Webeix — Website Builder

A section-based visual website builder with a **Webeix marketing site**, **user dashboard**, **full-page build flow**, and **admin panel**. Built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Zustand**.

## Quick start

```bash
npm install
npx prisma migrate deploy
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Marketing homepage (logged-out visitors) |
| http://localhost:3000/build | Build a website — AI, templates, migrate, or blank |
| http://localhost:3000/templates | Template gallery |
| http://localhost:3000/dashboard | User dashboard (requires sign-in) |
| http://localhost:3000/admin | Admin panel (admin role only) |
| http://localhost:3000/login | Admin sign-in (full page); users sign in via modal |

## Features

### Marketing & onboarding
- **Homepage** with AI prompt hero and category-based template discovery
- **`/build` flow** — generate with AI, pick a template, migrate a site, or start blank
- **Auth modals** — sign in / sign up via `/?login=1` or `/?signup=1`; closing returns to the page that opened the modal
- **Template gallery** at `/templates` with industry filters

### Builder
- **Section library** — hero, features, testimonials, CTA, header, footer variants
- **Inline editing** — click text, images, buttons, and links directly on the canvas
- **Floating toolbars** — text styling, partial highlights, button settings, image upload
- **Section settings** — background, spacing, grid, colors via trait panel
- **Theme panel** — global color and font tokens
- **Draft / publish** — edit draft in builder; visitors see published data

### Platform
- **User accounts** — email/password and Google OAuth
- **Multi-site dashboard** — create and manage websites per user
- **Admin panel** — users, websites, roles, JSON export/import

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Zustand · Prisma · SQLite · Zod · Lucide React · Ant Design (admin)

## Documentation

Full project documentation — architecture, routes, editor features, auth, build flow, and changelog:

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
app/
  page.tsx              Marketing homepage
  build/                Full-page build website flow
  templates/            Template gallery
  dashboard/            User dashboard & per-site builder
  admin/                Admin panel
  login/                Admin login page
  w/[websiteSlug]/      Published customer sites
components/
  marketing/            Homepage, nav, build flow, template cards
  auth/                 Login/signup modals and forms
  admin/                Admin shell and pages
  builder/              Canvas, outline, modals
  sections/             Section components + Zod schemas
lib/
  build-website-intent.ts   Session intent for post-signup resume
  auth/                 Session, OAuth, login URL helpers
  editor/               Inline editing
  traits/               Section settings
store/                  Zustand site state
docs/                   Project documentation
```

## License

Private project.
