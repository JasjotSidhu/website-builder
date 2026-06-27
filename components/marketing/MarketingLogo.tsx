import Link from "next/link";

interface MarketingLogoProps {
  variant?: "dark" | "light";
}

export default function MarketingLogo({ variant = "dark" }: MarketingLogoProps) {
  return (
    <Link
      href="/"
      className={`wx-logo${variant === "light" ? " wx-logo--light" : ""}`}
      aria-label="Webeix home"
    >
      <span className="wx-logo__w">W</span>
      <span>EBEIX</span>
    </Link>
  );
}
