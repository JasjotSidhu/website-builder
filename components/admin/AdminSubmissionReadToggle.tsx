"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminSubmissionReadToggleProps {
  submissionId: string;
  read: boolean;
}

export default function AdminSubmissionReadToggle({
  submissionId,
  read,
}: AdminSubmissionReadToggleProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggleRead() {
    setPending(true);
    try {
      await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !read }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="dash-btn dash-btn--outline"
      onClick={toggleRead}
      disabled={pending}
    >
      {read ? "Mark unread" : "Mark read"}
    </button>
  );
}
