import { LayoutTemplate } from "lucide-react";

export default function AdminTemplatesPage() {
  return (
    <>
      <h1 className="admin-page-title">Templates</h1>
      <p className="admin-page-subtitle">Create and manage website templates for the template gallery.</p>

      <section className="admin-card admin-empty-state">
        <LayoutTemplate size={40} strokeWidth={1.5} aria-hidden className="admin-empty-state__icon" />
        <h2 className="admin-empty-state__title">Template builder coming soon</h2>
        <p className="admin-empty-state__text">
          You&apos;ll be able to create starter templates here that appear when users choose a template for a new
          website.
        </p>
      </section>
    </>
  );
}
