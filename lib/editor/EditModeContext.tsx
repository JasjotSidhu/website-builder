"use client";

import { createContext, useContext } from "react";

export const EditModeContext = createContext<{ isEditing: boolean }>({
  isEditing: false,
});

export function useEditMode() {
  return useContext(EditModeContext);
}
