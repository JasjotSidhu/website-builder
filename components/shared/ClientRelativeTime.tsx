"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/format-datetime";

interface ClientRelativeTimeProps {
  date: Date;
  prefix?: string;
}

export default function ClientRelativeTime({ date, prefix = "" }: ClientRelativeTimeProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeTime(date));
  }, [date]);

  return (
    <span suppressHydrationWarning>
      {prefix}
      {label ?? "\u00a0"}
    </span>
  );
}
