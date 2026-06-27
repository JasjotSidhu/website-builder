"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import type { FormDisplayItem } from "@/lib/forms/forms";
import type { FormField, FormFieldType, FormTemplateId } from "@/lib/collections/types";
import { FIELD_TYPE_META, QUICK_ADD_FIELD_TYPES } from "@/lib/forms/field-meta";
import { FORM_TEMPLATES } from "@/lib/forms/templates";
import FormPreview from "./FormPreview";

interface FormEditorProps {
  draft: FormDisplayItem;
  isNew: boolean;
  saving: boolean;
  onBack: () => void;
  onChange: (partial: Partial<FormDisplayItem>) => void;
  onSave: () => void;
  onDelete?: () => void;
}

function createField(type: FormFieldType, label?: string): FormField {
  return {
    id: `field-${crypto.randomUUID()}`,
    type,
    label: label ?? FIELD_TYPE_META[type].label,
    required: type === "email",
    width: type === "textarea" || type === "select" ? "full" : "half",
    placeholder:
      type === "textarea" ? "Enter your message…" : type === "email" ? "you@example.com" : undefined,
    options: type === "select" ? ["Option 1", "Option 2"] : undefined,
  };
}

export default function FormEditor({
  draft,
  isNew,
  saving,
  onBack,
  onChange,
  onSave,
  onDelete,
}: FormEditorProps) {
  const [expandedFieldId, setExpandedFieldId] = useState<string | null>(
    draft.fields[0]?.id ?? null,
  );

  const templateLabel =
    draft.templateId && draft.templateId !== "custom"
      ? FORM_TEMPLATES[draft.templateId as FormTemplateId]?.name
      : null;

  const updateField = (index: number, partial: Partial<FormField>) => {
    const nextFields = draft.fields.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, ...partial } : field,
    );
    onChange({ fields: nextFields });
  };

  const addField = (type: FormFieldType = "text") => {
    const nextField = createField(type);
    onChange({ fields: [...draft.fields, nextField] });
    setExpandedFieldId(nextField.id);
  };

  const duplicateField = (index: number) => {
    const source = draft.fields[index];
    if (!source) {
      return;
    }

    const copy: FormField = {
      ...source,
      id: `field-${crypto.randomUUID()}`,
      label: `${source.label} copy`,
      options: source.options ? [...source.options] : undefined,
    };

    const nextFields = [...draft.fields];
    nextFields.splice(index + 1, 0, copy);
    onChange({ fields: nextFields });
    setExpandedFieldId(copy.id);
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draft.fields.length) {
      return;
    }

    const nextFields = [...draft.fields];
    const [item] = nextFields.splice(index, 1);
    nextFields.splice(targetIndex, 0, item);
    onChange({ fields: nextFields });
  };

  const removeField = (index: number) => {
    const removed = draft.fields[index];
    const nextFields = draft.fields.filter((_, fieldIndex) => fieldIndex !== index);
    onChange({ fields: nextFields });
    if (removed?.id === expandedFieldId) {
      setExpandedFieldId(nextFields[0]?.id ?? null);
    }
  };

  return (
    <div className="site-forms__editor">
      <div className="site-blog__editor-top">
        <button type="button" className="site-blog__back-btn" onClick={onBack}>
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
          Back to forms
        </button>
        <div className="site-blog__editor-actions">
          <button
            type="button"
            className="dash-btn dash-btn--orange site-manage__action-btn"
            disabled={saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : isNew ? "Create form" : "Save form"}
          </button>
        </div>
      </div>

      {templateLabel ? (
        <p className="form-editor__template-badge">Based on {templateLabel} template</p>
      ) : null}

      <div className="form-editor__layout">
        <div className="form-editor__main">
          <input
            type="text"
            className="blog-editor-medium__title"
            value={draft.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Form name"
            aria-label="Form name"
          />

          <div className="form-editor__section">
            <div className="form-editor__section-header">
              <div>
                <h2 className="form-editor__section-title">Fields</h2>
                <p className="form-editor__section-hint">
                  {draft.fields.length} field{draft.fields.length === 1 ? "" : "s"} · drag order with arrows
                </p>
              </div>
            </div>

            <div className="form-editor__quick-add" role="group" aria-label="Quick add fields">
              <span className="form-editor__quick-add-label">Quick add</span>
              <div className="form-editor__quick-add-buttons">
                {QUICK_ADD_FIELD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="form-editor__quick-add-btn"
                    onClick={() => addField(type)}
                  >
                    <Plus size={14} strokeWidth={2} aria-hidden />
                    {FIELD_TYPE_META[type].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-editor__field-list">
              {draft.fields.length === 0 ? (
                <div className="form-editor__field-empty">
                  <p>No fields yet. Use quick add above or pick a field type.</p>
                  <button
                    type="button"
                    className="dash-btn dash-btn--outline site-manage__action-btn"
                    onClick={() => addField("text")}
                  >
                    <Plus size={16} strokeWidth={1.75} aria-hidden />
                    Add first field
                  </button>
                </div>
              ) : (
                draft.fields.map((field, index) => {
                  const expanded = expandedFieldId === field.id;
                  const typeMeta = FIELD_TYPE_META[field.type];

                  return (
                    <div key={field.id} className="form-editor__field-card">
                      <button
                        type="button"
                        className="form-editor__field-summary"
                        aria-expanded={expanded}
                        onClick={() => setExpandedFieldId(expanded ? null : field.id)}
                      >
                        <span className="form-editor__field-index">{index + 1}</span>
                        <span className="form-editor__field-summary-text">
                          <strong>{field.label || "Untitled field"}</strong>
                          <span>
                            {typeMeta.label}
                            {field.required ? " · Required" : ""}
                          </span>
                        </span>
                        <span className="form-editor__field-type-pill">{typeMeta.shortLabel}</span>
                        <ChevronDown
                          size={18}
                          strokeWidth={1.75}
                          className={`form-editor__field-chevron${expanded ? " form-editor__field-chevron--open" : ""}`}
                          aria-hidden
                        />
                      </button>

                      {expanded ? (
                        <div className="form-editor__field-body">
                          <div className="form-editor__field-row">
                            <label className="site-manage__field">
                              <span>Label</span>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(event) => updateField(index, { label: event.target.value })}
                              />
                            </label>
                            <label className="site-manage__field">
                              <span>Field type</span>
                              <select
                                value={field.type}
                                onChange={(event) =>
                                  updateField(index, { type: event.target.value as FormFieldType })
                                }
                              >
                                {QUICK_ADD_FIELD_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {FIELD_TYPE_META[type].label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>

                          <div className="form-editor__field-row">
                            <label className="site-manage__field">
                              <span>Placeholder</span>
                              <input
                                type="text"
                                value={field.placeholder ?? ""}
                                onChange={(event) =>
                                  updateField(index, { placeholder: event.target.value })
                                }
                                placeholder="Optional hint text"
                              />
                            </label>
                            <label className="site-manage__field">
                              <span>Width</span>
                              <select
                                value={field.width ?? "full"}
                                onChange={(event) =>
                                  updateField(index, {
                                    width: event.target.value as "full" | "half",
                                  })
                                }
                              >
                                <option value="full">Full width</option>
                                <option value="half">Half width</option>
                              </select>
                            </label>
                          </div>

                          {field.type === "select" ? (
                            <label className="site-manage__field">
                              <span>Dropdown options (one per line)</span>
                              <textarea
                                rows={4}
                                value={(field.options ?? []).join("\n")}
                                onChange={(event) =>
                                  updateField(index, {
                                    options: event.target.value
                                      .split("\n")
                                      .map((line) => line.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </label>
                          ) : null}

                          <div className="form-editor__field-actions">
                            <label className="site-blog__featured-checkbox">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(event) =>
                                  updateField(index, { required: event.target.checked })
                                }
                              />
                              <span>Required field</span>
                            </label>

                            <div className="form-editor__field-action-buttons">
                              <button
                                type="button"
                                className="form-editor__icon-btn"
                                title="Move up"
                                disabled={index === 0}
                                onClick={() => moveField(index, -1)}
                              >
                                <ArrowUp size={16} strokeWidth={1.75} aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="form-editor__icon-btn"
                                title="Move down"
                                disabled={index === draft.fields.length - 1}
                                onClick={() => moveField(index, 1)}
                              >
                                <ArrowDown size={16} strokeWidth={1.75} aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="form-editor__icon-btn"
                                title="Duplicate field"
                                onClick={() => duplicateField(index)}
                              >
                                <Copy size={16} strokeWidth={1.75} aria-hidden />
                              </button>
                              <button
                                type="button"
                                className="dash-btn site-blog__delete-btn form-editor__remove-btn"
                                onClick={() => removeField(index)}
                              >
                                <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="form-editor__sidebar" aria-label="Form settings and preview">
          <FormPreview form={draft} />

          <div className="form-editor__settings">
            <h2 className="site-blog__editor-sidebar-title">Settings</h2>

            <label className="site-manage__field">
              <span>URL slug</span>
              <input
                type="text"
                value={draft.slug}
                onChange={(event) => onChange({ slug: event.target.value })}
                placeholder="contact"
              />
              <span className="form-editor__slug-hint">Submissions URL: /forms/{draft.slug || "your-slug"}</span>
            </label>

            <label className="site-manage__field">
              <span>Submit button</span>
              <input
                type="text"
                value={draft.settings.submitLabel}
                onChange={(event) =>
                  onChange({ settings: { ...draft.settings, submitLabel: event.target.value } })
                }
              />
            </label>

            <label className="site-manage__field">
              <span>Success message</span>
              <textarea
                rows={3}
                value={draft.settings.successMessage}
                onChange={(event) =>
                  onChange({ settings: { ...draft.settings, successMessage: event.target.value } })
                }
              />
            </label>

            {!isNew && onDelete ? (
              <div className="site-blog__sidebar-footer">
                <button
                  type="button"
                  className="dash-btn site-blog__delete-btn site-blog__delete-btn--full"
                  disabled={saving}
                  onClick={onDelete}
                >
                  <Trash2 size={16} strokeWidth={1.75} aria-hidden />
                  Delete form
                </button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
