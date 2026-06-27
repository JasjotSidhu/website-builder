import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import AuthModalRoot from "@/components/auth/AuthModalRoot";
import BuildWebsiteModalRoot from "@/components/marketing/BuildWebsiteModalRoot";
import "./globals.css";
import "./marketing.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-platform",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Webeix — Launch a professional website, faster",
  description:
    "Generate a complete site with AI, then refine it with the simple visual editor. The easiest way to launch a professional website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">
        <AuthModalRoot>
          <BuildWebsiteModalRoot>{children}</BuildWebsiteModalRoot>
        </AuthModalRoot>
      </body>
    </html>
  );
}
