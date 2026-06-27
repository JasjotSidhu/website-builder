"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, FileText, Inbox, Pencil, Plus } from "lucide-react";
import {
  collectionItemToForm,
  createFormFromTemplate,
  prepareFormForSave,
  slugifyFormName,
  type FormDisplayItem,
} from "@/lib/forms/forms";
import { FORM_TEMPLATES } from "@/lib/forms/templates";
import type { FormTemplateId } from "@/lib/collections/types";
import { DEFAULT_FORMS_COLLECTION_ID } from "@/lib/collections/types";
import type { FormCollectionItem } from "@/lib/collections/types";
import type { FormSubmissionRecord } from "@/lib/form-submissions-store";
import type { WebsiteData } from "@/lib/types";
import FormEditor from "./FormEditor";
import FormSubmissionsPanel from "./FormSubmissionsPanel";
import FormTemplatePicker from "./FormTemplatePicker";

interface SiteFormsManagerProps {
  websiteId: string;
}

type FormsListView = "grid" | "submissions";

const EMPTY_FORM_DRAFT: FormDisplayItem = {
  id: "draft-form",
  name: "",
  slug: "form",
  templateId: "custom",
  fields: [],
  settings: {
    submitLabel: "Submit",
    successMessage: "Thank you for your submission.",
  },
};

function emptyDraft(): FormDisplayItem {
  return {
    ...EMPTY_FORM_DRAFT,
    fields: [],
    settings: { ...EMPTY_FORM_DRAFT.settings },
  };
}

function templateName(templateId?: FormTemplateId) {
  if (!templateId || templateId === "custom") {
    return null;
  }
  return FORM_TEMPLATES[templateId]?.name ?? null;
}

export default function SiteFormsManager({ websiteId }: SiteFormsManagerProps) {
  const [site, setSite] = useState<WebsiteData | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);
  const [listView, setListView] = useState<FormsListView>("grid");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState<FormDisplayItem>(() => emptyDraft());
  const [submissionsView, setSubmissionsView] = useState<"table" | "detail">("table");
  const [submissionsFormId, setSubmissionsFormId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [siteRes, submissionsRes] = await Promise.all([
        fetch(`/api/websites/${websiteId}`),
        fetch(`/api/websites/${websiteId}/form-submissions`),
      ]);

      if (!siteRes.ok) {
        throw new Error("Failed to load site data");
      }

      const sitePayload = (await siteRes.json()) as { site: WebsiteData };
      setSite(sitePayload.site);

      if (submissionsRes.ok) {
        const submissionsPayload = (await submissionsRes.json()) as {
          submissions: Array<Omit<FormSubmissionRecord, "createdAt"> & { createdAt: string }>;
        };
        setSubmissions(
          submissionsPayload.submissions.map((entry) => ({
            ...entry,
            createdAt: new Date(entry.createdAt),
          })),
        );
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load forms");
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const forms = useMemo(() => {
    const collection = site?.collections?.[DEFAULT_FORMS_COLLECTION_ID];
    if (!collection || collection.type !== "forms") {
      return [] as FormDisplayItem[];
    }
    return [...(collection.items as FormCollectionItem[])]
      .sort((a, b) => a.order - b.order)
      .map(collectionItemToForm);
  }, [site]);

  const submissionCountByForm = useMemo(() => {
    const counts = new Map<string, number>();
    for (const submission of submissions) {
      counts.set(submission.formId, (counts.get(submission.formId) ?? 0) + 1);
    }
    return counts;
  }, [submissions]);

  const unreadCountByForm = useMemo(() => {
    const counts = new Map<string, number>();
    for (const submission of submissions) {
      if (!submission.read) {
        counts.set(submission.formId, (counts.get(submission.formId) ?? 0) + 1);
      }
    }
    return counts;
  }, [submissions]);

  const openSubmissionsTable = (formId: string) => {
    setSubmissionsFormId(formId);
    setSubmissionsView("table");
    setSelectedSubmissionId(null);
    setListView("submissions");
  };

  const backToFormsGrid = () => {
    setListView("grid");
    setSubmissionsFormId(null);
    setSelectedSubmissionId(null);
    setSubmissionsView("table");
  };

  const backToSubmissionsTable = () => {
    setSubmissionsView("table");
    setSelectedSubmissionId(null);
  };

  const persistForms = async (items: FormCollectionItem[], successMessage: string) => {
    if (!site) {
      return false;
    }

    const collection = site.collections?.[DEFAULT_FORMS_COLLECTION_ID];
    const now = new Date().toISOString();
    const nextSite: WebsiteData = {
      ...site,
      collections: {
        ...site.collections,
        [DEFAULT_FORMS_COLLECTION_ID]: {
          id: DEFAULT_FORMS_COLLECTION_ID,
          type: "forms",
          name: "Forms",
          items,
          createdAt: collection?.createdAt ?? now,
          updatedAt: now,
        },
      },
    };

    const res = await fetch(`/api/websites/${websiteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSite),
    });

    if (!res.ok) {
      throw new Error("Failed to save forms");
    }

    setSite(nextSite);
    setMessage(successMessage);
    return true;
  };

  const openNewForm = (templateId: FormTemplateId) => {
    setIsNew(true);
    setDraft(collectionItemToForm(createFormFromTemplate(templateId)));
    setEditorOpen(true);
    setTemplatePickerOpen(false);
    setMessage(null);
    setError(null);
  };

  const openEditForm = (form: FormDisplayItem) => {
    setIsNew(false);
    setDraft({ ...form, fields: form.fields.map((field) => ({ ...field, options: field.options ? [...field.options] : undefined })) });
    setEditorOpen(true);
    setMessage(null);
    setError(null);
  };

  const duplicateForm = async (form: FormDisplayItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!site) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const collection = site.collections?.[DEFAULT_FORMS_COLLECTION_ID];
      const existingItems =
        collection?.type === "forms" ? (collection.items as FormCollectionItem[]) : [];
      const copyName = `${form.name} copy`;
      const duplicate = prepareFormForSave(
        {
          ...form,
          id: `form-${crypto.randomUUID()}`,
          name: copyName,
          slug: slugifyFormName(copyName),
          fields: form.fields.map((field) => ({
            ...field,
            id: `field-${crypto.randomUUID()}`,
            options: field.options ? [...field.options] : undefined,
          })),
        },
        undefined,
      );

      await persistForms(
        [...existingItems, duplicate].map((item, index) => ({ ...item, order: index })),
        `"${duplicate.name}" created.`,
      );
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : "Failed to duplicate form");
    } finally {
      setSaving(false);
    }
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setIsNew(false);
    setDraft(emptyDraft());
  };

  const updateDraft = (partial: Partial<FormDisplayItem>) => {
    setDraft((current) => {
      const next = { ...current, ...partial };
      if (partial.name && (!current.slug || current.slug === slugifyFormName(current.name))) {
        next.slug = slugifyFormName(partial.name);
      }
      return next;
    });
  };

  const saveForm = async () => {
    if (!site) {
      return;
    }

    const name = draft.name.trim();
    if (!name) {
      setError("Form name is required.");
      return;
    }

    if (draft.fields.length === 0) {
      setError("Add at least one field.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const collection = site.collections?.[DEFAULT_FORMS_COLLECTION_ID];
      const existingItems =
        collection?.type === "forms" ? (collection.items as FormCollectionItem[]) : [];
      const existing = existingItems.find((item) => item.id === draft.id);
      const savedItem = prepareFormForSave(draft, existing);

      const nextItems = isNew
        ? [savedItem, ...existingItems.map((item, index) => ({ ...item, order: index + 1 }))]
        : existingItems.map((item) => (item.id === savedItem.id ? savedItem : item));

      await persistForms(
        nextItems.map((item, index) => ({ ...item, order: index })),
        isNew
          ? "Form created. Add a Form section in the builder to display it on your site."
          : "Form saved. Publish your site from the builder to make changes live.",
      );
      closeEditor();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async () => {
    if (!site || !draft.id || !window.confirm("Delete this form? Sections using it will show empty.")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const collection = site.collections?.[DEFAULT_FORMS_COLLECTION_ID];
      const existingItems =
        collection?.type === "forms" ? (collection.items as FormCollectionItem[]) : [];
      const nextItems = existingItems
        .filter((item) => item.id !== draft.id)
        .map((item, index) => ({ ...item, order: index }));

      await persistForms(nextItems, "Form deleted.");
      closeEditor();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete form");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubmissionRead = async (submissionId: string, read: boolean) => {
    const res = await fetch(`/api/websites/${websiteId}/form-submissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, read }),
    });

    if (res.ok) {
      setSubmissions((current) =>
        current.map((entry) => (entry.id === submissionId ? { ...entry, read } : entry)),
      );
    }
  };

  const openSubmissionDetail = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setSubmissionsView("detail");
    const submission = submissions.find((entry) => entry.id === submissionId);
    if (submission && !submission.read) {
      void toggleSubmissionRead(submissionId, true);
    }
  };

  if (loading) {
    return (
      <div className="site-forms">
        <p className="site-blog__loading">Loading forms…</p>
      </div>
    );
  }

  if (editorOpen) {
    return (
      <div className="site-forms">
        {error ? <p className="site-blog__error">{error}</p> : null}
        <FormEditor
          draft={draft}
          isNew={isNew}
          saving={saving}
          onBack={closeEditor}
          onChange={updateDraft}
          onSave={() => void saveForm()}
          onDelete={!isNew && draft.id ? () => void deleteForm() : undefined}
        />
      </div>
    );
  }

  const showingSubmissions = listView === "submissions" && submissionsFormId;

  return (
    <div className="site-forms">
      {!showingSubmissions ? (
        <div className="site-blog__header">
          <div>
            <h1 className="site-blog__title">Forms</h1>
            <p className="site-blog__subtitle">
              Create forms here, then add a Form section in the builder to show them on your site.
            </p>
          </div>
          <div className="site-manage__actions">
            <a
              href={`/dashboard/sites/${websiteId}/builder`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-btn dash-btn--outline site-manage__action-btn"
            >
              <Pencil size={16} strokeWidth={1.75} aria-hidden />
              Edit website
            </a>
            <button
              type="button"
              className="dash-btn dash-btn--orange site-manage__action-btn"
              onClick={() => setTemplatePickerOpen(true)}
            >
              <Plus size={16} strokeWidth={1.75} aria-hidden />
              Create form
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="site-blog__error">{error}</p> : null}
      {message ? <p className="site-blog__message">{message}</p> : null}

      <FormTemplatePicker
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelect={openNewForm}
      />

      {showingSubmissions ? (
        <FormSubmissionsPanel
          forms={forms}
          submissions={submissions}
          view={submissionsView}
          selectedFormId={submissionsFormId}
          selectedSubmissionId={selectedSubmissionId}
          onBackToForms={backToFormsGrid}
          onBackToTable={backToSubmissionsTable}
          onSelectSubmission={openSubmissionDetail}
          onToggleRead={(submissionId, read) => void toggleSubmissionRead(submissionId, read)}
        />
      ) : forms.length === 0 ? (
          <div className="site-forms__empty-state">
            <div className="site-forms__empty-copy">
              <h2>Create your first form</h2>
              <p>Pick a template to get started, or build a custom form from scratch.</p>
            </div>
            <div className="site-forms__empty-templates">
              {(["contact", "booking-salon", "newsletter", "custom"] as FormTemplateId[]).map((templateId) => {
                const template = FORM_TEMPLATES[templateId];
                return (
                  <button
                    key={templateId}
                    type="button"
                    className="site-forms__empty-template"
                    onClick={() => openNewForm(templateId)}
                  >
                    <strong>{template.name}</strong>
                    <span>{template.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="site-forms__grid">
            {forms.map((form) => {
              const badge = templateName(form.templateId);
              const submissionCount = submissionCountByForm.get(form.id) ?? 0;
              const unreadCount = unreadCountByForm.get(form.id) ?? 0;

              return (
                <article key={form.id} className="site-forms__card">
                  <div className="site-forms__card-body">
                    <span className="site-forms__card-icon">
                      <FileText size={22} strokeWidth={1.75} aria-hidden />
                      {unreadCount > 0 ? (
                        <span className="site-forms__card-new-badge" aria-label={`${unreadCount} new submissions`}>
                          {unreadCount}
                        </span>
                      ) : null}
                    </span>
                    <div className="site-forms__card-content">
                      <strong>{form.name}</strong>
                      <span className="site-forms__card-meta">
                        {form.fields.length} fields · /{form.slug}
                        {submissionCount > 0 ? ` · ${submissionCount} submissions` : ""}
                        {unreadCount > 0 ? ` · ${unreadCount} new` : ""}
                      </span>
                      {badge ? <span className="site-forms__card-badge">{badge}</span> : null}
                      <div className="site-forms__card-fields">
                        {form.fields.slice(0, 4).map((field) => (
                          <span key={field.id} className="site-forms__field-chip">
                            {field.label}
                          </span>
                        ))}
                        {form.fields.length > 4 ? (
                          <span className="site-forms__field-chip site-forms__field-chip--more">
                            +{form.fields.length - 4} more
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="site-forms__card-duplicate"
                    title="Duplicate form"
                    disabled={saving}
                    onClick={(event) => void duplicateForm(form, event)}
                  >
                    <Copy size={16} strokeWidth={1.75} aria-hidden />
                  </button>
                  <div className="site-forms__card-footer">
                    <button
                      type="button"
                      className="dash-btn dash-btn--outline site-forms__card-action"
                      onClick={() => openEditForm(form)}
                    >
                      <Pencil size={16} strokeWidth={1.75} aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn--outline site-forms__card-action"
                      onClick={() => openSubmissionsTable(form.id)}
                    >
                      <Inbox size={16} strokeWidth={1.75} aria-hidden />
                      View submissions
                      {unreadCount > 0 ? (
                        <span className="site-forms__new-badge">{unreadCount}</span>
                      ) : submissionCount > 0 ? (
                        ` (${submissionCount})`
                      ) : (
                        ""
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
      )}
    </div>
  );
}
