"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const EditModeContext = createContext<{ isEditing: boolean }>({
  isEditing: false,
});

export function useEditMode() {
  return useContext(EditModeContext);
}

export function EditModeProvider({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditing: enabled && mounted }}>
      {children}
    </EditModeContext.Provider>
  );
}
