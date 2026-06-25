import {
  BarChart3,
  CircleCheck,
  Clock,
  Compass,
  Globe,
  Heart,
  Layers,
  LayoutGrid,
  Lightbulb,
  Palette,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { isFeatureIconId, type FeatureIconId } from "@/lib/feature-icons";

const ICON_COMPONENTS: Record<FeatureIconId, LucideIcon> = {
  layers: Layers,
  palette: Palette,
  sparkle: Sparkles,
  target: Target,
  compass: Compass,
  grid: LayoutGrid,
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  heart: Heart,
  star: Star,
  globe: Globe,
  chart: BarChart3,
  users: Users,
  clock: Clock,
  check: CircleCheck,
  lightbulb: Lightbulb,
  wrench: Wrench,
  smartphone: Smartphone,
};

interface FeatureIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function FeatureIcon({ name, size = 24, className = "" }: FeatureIconProps) {
  const resolved: FeatureIconId = isFeatureIconId(name) ? name : "grid";
  const Icon = ICON_COMPONENTS[resolved];

  return (
    <span
      className={`feature-icon ${className}`.trim()}
      style={{ color: "var(--color-card-icon, #6366f1)" }}
    >
      <Icon size={size} strokeWidth={2} color="currentColor" aria-hidden />
    </span>
  );
}
