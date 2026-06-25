export const FEATURE_ICON_IDS = [
  "layers",
  "palette",
  "sparkle",
  "target",
  "compass",
  "grid",
  "zap",
  "shield",
  "rocket",
  "heart",
  "star",
  "globe",
  "chart",
  "users",
  "clock",
  "check",
  "lightbulb",
  "wrench",
  "smartphone",
] as const;

export type FeatureIconId = (typeof FEATURE_ICON_IDS)[number];

export const FEATURE_ICON_LABELS: Record<FeatureIconId, string> = {
  layers: "Layers",
  palette: "Palette",
  sparkle: "Sparkle",
  target: "Target",
  compass: "Compass",
  grid: "Grid",
  zap: "Bolt",
  shield: "Shield",
  rocket: "Rocket",
  heart: "Heart",
  star: "Star",
  globe: "Globe",
  chart: "Chart",
  users: "Users",
  clock: "Clock",
  check: "Check",
  lightbulb: "Ideas",
  wrench: "Tools",
  smartphone: "Mobile",
};

export function isFeatureIconId(value: string): value is FeatureIconId {
  return (FEATURE_ICON_IDS as readonly string[]).includes(value);
}
