import type { ReactNode } from "react";
import AuthModalProvider from "./AuthModalProvider";

export default function AuthModalRoot({ children }: { children: ReactNode }) {
  return <AuthModalProvider>{children}</AuthModalProvider>;
}
