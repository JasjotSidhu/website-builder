import type { ReactNode } from "react";
import BuildWebsiteModalProvider from "./BuildWebsiteModalProvider";

export default function BuildWebsiteModalRoot({ children }: { children: ReactNode }) {
  return <BuildWebsiteModalProvider>{children}</BuildWebsiteModalProvider>;
}
