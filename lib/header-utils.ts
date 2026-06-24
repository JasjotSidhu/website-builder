import type { NavigationConfig } from "@/lib/types";

export function getHeaderVariantId(navigation: NavigationConfig): string {
  return navigation.variant ?? "header-simple";
}

export function getHeaderProps(navigation: NavigationConfig) {
  const { variant: _variant, ...props } = navigation;
  return props;
}
