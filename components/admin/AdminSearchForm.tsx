"use client";

import { Search } from "lucide-react";

interface AdminSearchFormProps {
  action: string;
  placeholder: string;
  defaultValue?: string;
  hiddenFields?: Record<string, string>;
  align?: "start" | "end";
}

export default function AdminSearchForm({
  action,
  placeholder,
  defaultValue = "",
  hiddenFields,
  align = "start",
}: AdminSearchFormProps) {
  return (
    <form
      className={align === "end" ? "admin-search admin-search--end" : "admin-search"}
      action={action}
      method="get"
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <Search size={16} strokeWidth={1.75} aria-hidden className="admin-search__icon" />
      <input type="search" name="q" placeholder={placeholder} defaultValue={defaultValue} />
    </form>
  );
}
