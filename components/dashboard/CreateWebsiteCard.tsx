"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Plus, X } from "lucide-react";
import type { WebsiteTemplateId } from "@/lib/templates/catalog";
import { WEBSITE_TEMPLATE_CATALOG } from "@/lib/templates/catalog";

interface CreateWebsiteCardProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
}

export default function CreateWebsiteCard({ open, onOpen, onClose, triggerRef }: CreateWebsiteCardProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [templateId, setTemplateId] = useState<WebsiteTemplateId>("blank");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Untitled website",
          slug: slug.trim() || undefined,
          templateId,
        }),
      });

      const payload = (await res.json()) as {
        error?: string;
        website?: { id: string };
      };

      if (!res.ok || !payload.website) {
        setError(payload.error ?? "Failed to create website.");
        return;
      }

      const builderUrl = `/dashboard/sites/${payload.website.id}/builder`;
      window.open(builderUrl, "_blank", "noopener,noreferrer");
      setName("");
      setSlug("");
      setTemplateId("blank");
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="dash-create-card"
        onClick={onOpen}
      >
        <span className="dash-create-card__icon" aria-hidden>
          <Plus size={22} strokeWidth={2} />
        </span>
        <span className="dash-create-card__title">Create a website</span>
        <span className="dash-create-card__subtitle">Start from a prompt or a template</span>
      </button>

      {open ? (
        <div className="dash-modal" role="presentation" onClick={onClose}>
          <div
            ref={dialogRef}
            className="dash-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-website-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dash-modal__header">
              <h2 id="create-website-title">Create a website</h2>
              <button type="button" className="dash-modal__close" aria-label="Close" onClick={onClose}>
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <p className="dash-modal__lead">Pick a template, name your site, then open the builder in a new tab.</p>

            <form onSubmit={handleSubmit} className="dash-modal__form">
              <div className="dash-field">
                <span className="dash-field__label">Template</span>
                <div className="create-site-templates">
                  {WEBSITE_TEMPLATE_CATALOG.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={`create-site-template${templateId === template.id ? " create-site-template--active" : ""}`}
                      onClick={() => setTemplateId(template.id)}
                    >
                      <strong>{template.name}</strong>
                      <span>{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="dash-field">
                <label htmlFor="create-site-name">Site name</label>
                <input
                  id="create-site-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="My website"
                  autoFocus
                />
              </div>
              <div className="dash-field">
                <label htmlFor="create-site-slug">URL slug (optional)</label>
                <input
                  id="create-site-slug"
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="my-website"
                />
              </div>
              {error ? <p className="dash-form-error">{error}</p> : null}
              <button type="submit" disabled={isSubmitting} className="dash-btn dash-btn--navy dash-btn--full">
                {isSubmitting ? "Creating…" : "Create & open builder"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
