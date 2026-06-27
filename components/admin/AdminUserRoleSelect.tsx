"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

interface AdminUserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}

export default function AdminUserRoleSelect({
  userId,
  currentRole,
  disabled = false,
}: AdminUserRoleSelectProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextRole: UserRole) {
    setRole(nextRole);
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to update role.");
      }

      router.refresh();
    } catch (err) {
      setRole(currentRole);
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <select
        className="admin-role-select"
        value={role}
        disabled={disabled || pending}
        onChange={(event) => handleChange(event.target.value as UserRole)}
      >
        <option value={USER_ROLES.USER}>User</option>
        <option value={USER_ROLES.ADMIN}>Admin</option>
      </select>
      {error ? <p className="admin-inline-error">{error}</p> : null}
    </div>
  );
}
