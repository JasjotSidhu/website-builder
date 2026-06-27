"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Upload } from "lucide-react";
import AdminConfirmPopover from "./AdminConfirmPopover";
import AdminIconAction from "./AdminIconAction";

interface AdminWebsiteActionsProps {
  websiteId: string;
  websiteName: string;
}

export default function AdminWebsiteActions({ websiteId, websiteName }: AdminWebsiteActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<"import" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(file: File) {
    setPendingAction("import");
    setError(null);

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;

      const res = await fetch(`/api/admin/websites/${websiteId}/import`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to update from JSON.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update from JSON.");
    } finally {
      setPendingAction(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(): Promise<boolean> {
    setPendingAction("delete");
    setError(null);

    try {
      const res = await fetch(`/api/admin/websites/${websiteId}`, { method: "DELETE" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to delete website.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete website.");
      setPendingAction(null);
      return false;
    }
  }

  return (
    <div className="admin-user-actions">
      <div className="admin-user-actions__buttons">
        <AdminIconAction label="Download JSON" href={`/api/admin/websites/${websiteId}/export`}>
          <Download size={16} strokeWidth={1.75} />
        </AdminIconAction>
        <AdminIconAction
          label={pendingAction === "import" ? "Updating…" : "Update JSON"}
          disabled={pendingAction !== null}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} strokeWidth={1.75} />
        </AdminIconAction>
        <AdminConfirmPopover
          title={`Delete "${websiteName}"?`}
          description="This removes the website and all form submissions. This action cannot be undone."
          confirmLabel="Delete website"
          pending={pendingAction === "delete"}
          disabled={pendingAction !== null && pendingAction !== "delete"}
          onConfirm={handleDelete}
          trigger={(open) => (
            <AdminIconAction
              label="Delete website"
              disabled={pendingAction !== null}
              danger
              onClick={open}
            >
              <Trash2 size={16} strokeWidth={1.75} />
            </AdminIconAction>
          )}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImport(file);
          }
        }}
      />
      {error ? <p className="admin-inline-error">{error}</p> : null}
    </div>
  );
}
