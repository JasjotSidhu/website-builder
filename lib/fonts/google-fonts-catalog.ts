export interface GoogleFontEntry {
  family: string;
  category: "sans-serif" | "serif" | "display" | "monospace";
  weights: string;
}

export const GOOGLE_FONTS_CATALOG: GoogleFontEntry[] = [
  { family: "Inter", category: "sans-serif", weights: "400;500;600;700" },
  { family: "Roboto", category: "sans-serif", weights: "400;500;700" },
  { family: "Open Sans", category: "sans-serif", weights: "400;600;700" },
  { family: "Lato", category: "sans-serif", weights: "400;700" },
  { family: "Montserrat", category: "sans-serif", weights: "400;600;700" },
  { family: "Poppins", category: "sans-serif", weights: "400;600;700" },
  { family: "Nunito", category: "sans-serif", weights: "400;600;700" },
  { family: "Raleway", category: "sans-serif", weights: "400;600;700" },
  { family: "Work Sans", category: "sans-serif", weights: "400;600;700" },
  { family: "DM Sans", category: "sans-serif", weights: "400;500;700" },
  { family: "Source Sans 3", category: "sans-serif", weights: "400;600;700" },
  { family: "Manrope", category: "sans-serif", weights: "400;600;700" },
  { family: "Outfit", category: "sans-serif", weights: "400;600;700" },
  { family: "Playfair Display", category: "serif", weights: "400;600;700" },
  { family: "Merriweather", category: "serif", weights: "400;700" },
  { family: "Lora", category: "serif", weights: "400;600;700" },
  { family: "Libre Baskerville", category: "serif", weights: "400;700" },
  { family: "Cormorant Garamond", category: "serif", weights: "400;600;700" },
  { family: "DM Serif Display", category: "serif", weights: "400" },
  { family: "Crimson Text", category: "serif", weights: "400;600;700" },
  { family: "Fraunces", category: "serif", weights: "400;600;700" },
  { family: "Space Grotesk", category: "sans-serif", weights: "400;500;700" },
  { family: "Sora", category: "sans-serif", weights: "400;600;700" },
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: "400;600;700" },
  { family: "Figtree", category: "sans-serif", weights: "400;600;700" },
  { family: "Oswald", category: "sans-serif", weights: "400;600" },
  { family: "Bebas Neue", category: "display", weights: "400" },
  { family: "Abril Fatface", category: "display", weights: "400" },
  { family: "JetBrains Mono", category: "monospace", weights: "400;600" },
];

export function findGoogleFont(family: string): GoogleFontEntry | undefined {
  return GOOGLE_FONTS_CATALOG.find(
    (entry) => entry.family.toLowerCase() === family.toLowerCase(),
  );
}
