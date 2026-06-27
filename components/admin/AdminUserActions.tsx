"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Upload } from "lucide-react";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";
import AdminConfirmPopover from "./AdminConfirmPopover";
import AdminIconAction from "./AdminIconAction";

interface AdminUserActionsProps {
  userId: string;
  email: string;
  role: UserRole;
  websiteCount: number;
}

export default function AdminUserActions({
  userId,
  email,
  role,
  websiteCount,
}: AdminUserActionsProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAction, setPendingAction] = useState<"import" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = role === USER_ROLES.ADMIN;
  const websiteLabel = websiteCount === 1 ? "1 website" : `${websiteCount} websites`;

  async function handleImport(file: File) {
    setPendingAction("import");
    setError(null);

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;

      const res = await fetch(`/api/admin/users/${userId}/import`, {
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
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to delete user.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user.");
      setPendingAction(null);
      return false;
    }
  }

  return (
    <div className="admin-user-actions">
      <div className="admin-user-actions__buttons">
        <AdminIconAction label="Download JSON" href={`/api/admin/users/${userId}/export`}>
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
          title={`Delete "${email}"?`}
          description={`This will remove the account and all ${websiteLabel}. This action cannot be undone.`}
          confirmLabel="Delete user"
          pending={pendingAction === "delete"}
          disabled={isAdmin || (pendingAction !== null && pendingAction !== "delete")}
          onConfirm={handleDelete}
          trigger={(open) => (
            <AdminIconAction
              label={isAdmin ? "Admin accounts cannot be deleted" : "Delete user"}
              disabled={isAdmin || pendingAction !== null}
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
