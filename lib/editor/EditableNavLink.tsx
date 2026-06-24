"use client";

import EditableLink from "@/lib/editor/EditableLink";
import EditableText from "@/lib/editor/EditableText";

interface EditableNavLinkProps {
  className?: string;
  maxLength?: number;
  onNavigate?: () => void;
}

export default function EditableNavLink({
  className,
  maxLength = 40,
  onNavigate,
}: EditableNavLinkProps) {
  return (
    <EditableLink dataKey="link" className={className} onNavigate={onNavigate}>
      <EditableText as="span" dataKey="label" maxLength={maxLength} />
    </EditableLink>
  );
}
