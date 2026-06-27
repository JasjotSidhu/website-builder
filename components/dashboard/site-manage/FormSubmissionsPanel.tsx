"use client";

import { ArrowLeft } from "lucide-react";
import type { FormDisplayItem } from "@/lib/forms/forms";
import type { FormSubmissionRecord } from "@/lib/form-submissions-store";

export type SubmissionsView = "table" | "detail";

function formatDateTime(value: Date, style: "short" | "full" = "short") {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: style === "full" ? "full" : "medium",
    timeStyle: "short",
  }).format(value);
}

function getFieldLabel(form: FormDisplayItem | undefined, fieldId: string) {
  return form?.fields.find((field) => field.id === fieldId)?.label ?? fieldId;
}

interface FormSubmissionsPanelProps {
  forms: FormDisplayItem[];
  submissions: FormSubmissionRecord[];
  view: SubmissionsView;
  selectedFormId: string;
  selectedSubmissionId: string | null;
  onBackToForms: () => void;
  onBackToTable: () => void;
  onSelectSubmission: (submissionId: string) => void;
  onToggleRead: (submissionId: string, read: boolean) => void;
}

export default function FormSubmissionsPanel({
  forms,
  submissions,
  view,
  selectedFormId,
  selectedSubmissionId,
  onBackToForms,
  onBackToTable,
  onSelectSubmission,
  onToggleRead,
}: FormSubmissionsPanelProps) {
  const selectedForm = forms.find((form) => form.id === selectedFormId) ?? null;
  const formSubmissions = submissions.filter((entry) => entry.formId === selectedFormId);
  const selectedSubmission =
    submissions.find((entry) => entry.id === selectedSubmissionId) ?? null;

  if (view === "detail" && selectedSubmission) {
    const form = forms.find((entry) => entry.id === selectedSubmission.formId);

    return (
      <div className="site-forms__submissions-panel">
        <button type="button" className="site-blog__back-btn site-forms__submissions-back" onClick={onBackToTable}>
          <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
          Back to submissions
        </button>

        <div className="site-forms__submission-detail">
          <div className="site-forms__submission-detail-header">
            <div>
              <h2>{selectedSubmission.formName}</h2>
              <p>{formatDateTime(selectedSubmission.createdAt, "full")}</p>
            </div>
            <button
              type="button"
              className="dash-btn dash-btn--outline site-manage__action-btn"
              onClick={() => onToggleRead(selectedSubmission.id, !selectedSubmission.read)}
            >
              {selectedSubmission.read ? "Mark unread" : "Mark read"}
            </button>
          </div>
          <dl className="site-forms__submission-fields">
            {Object.entries(selectedSubmission.data).map(([key, value]) => (
              <div key={key} className="site-forms__submission-field">
                <dt>{getFieldLabel(form, key)}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return null;
  }

  const tableFields = selectedForm.fields.filter((field) => field.type !== "checkbox").slice(0, 4);

  return (
    <div className="site-forms__submissions-panel">
      <button type="button" className="site-blog__back-btn site-forms__submissions-back" onClick={onBackToForms}>
        <ArrowLeft size={18} strokeWidth={1.75} aria-hidden />
        Back to forms
      </button>

      <div className="site-forms__submissions-table-header">
        <div>
          <h2 className="site-forms__submissions-table-title">{selectedForm.name}</h2>
          <p className="site-forms__submissions-table-meta">
            {formSubmissions.length} submission{formSubmissions.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {formSubmissions.length === 0 ? (
        <p className="site-forms__empty-fields">No submissions for this form yet.</p>
      ) : (
        <div className="site-forms__table-wrap">
          <table className="site-forms__table">
            <thead>
              <tr>
                <th scope="col">Received</th>
                {tableFields.map((field) => (
                  <th key={field.id} scope="col">
                    {field.label}
                  </th>
                ))}
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {formSubmissions.map((submission) => (
                <tr
                  key={submission.id}
                  className={`site-forms__table-row${submission.read ? "" : " site-forms__table-row--unread"}`}
                >
                  <td>
                    <button
                      type="button"
                      className="site-forms__table-link"
                      onClick={() => onSelectSubmission(submission.id)}
                    >
                      {formatDateTime(submission.createdAt)}
                    </button>
                  </td>
                  {tableFields.map((field) => (
                    <td key={field.id}>
                      <button
                        type="button"
                        className="site-forms__table-link"
                        onClick={() => onSelectSubmission(submission.id)}
                      >
                        {submission.data[field.id] || "—"}
                      </button>
                    </td>
                  ))}
                  <td>
                    <span
                      className={`site-forms__status-badge${submission.read ? " site-forms__status-badge--read" : ""}`}
                    >
                      {submission.read ? "Read" : "New"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
