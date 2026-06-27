"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminConfirmPopover from "./AdminConfirmPopover";

interface AdminDeleteWebsiteButtonProps {
  websiteId: string;
  websiteName: string;
}

export default function AdminDeleteWebsiteButton({
  websiteId,
  websiteName,
}: AdminDeleteWebsiteButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(): Promise<boolean> {
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/websites/${websiteId}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to delete website.");
      }
      router.push("/admin/websites");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete website.");
      setPending(false);
      return false;
    }
  }

  return (
    <div>
      <AdminConfirmPopover
        title={`Delete "${websiteName}"?`}
        description="This removes the website and all form submissions. This action cannot be undone."
        confirmLabel="Delete website"
        pending={pending}
        placement="bottom"
        onConfirm={handleDelete}
        trigger={(open) => (
          <button type="button" className="dash-btn dash-btn--outline" disabled={pending} onClick={open}>
            Delete website
          </button>
        )}
      />
      {error ? <p className="admin-inline-error">{error}</p> : null}
    </div>
  );
}
