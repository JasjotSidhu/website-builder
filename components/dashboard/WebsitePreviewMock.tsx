function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PALETTES = [
  { header: "#2dd4bf", accent: "#f97316", block: "#a78bfa" },
  { header: "#38bdf8", accent: "#fb7185", block: "#fbbf24" },
  { header: "#34d399", accent: "#818cf8", block: "#f472b6" },
  { header: "#f97316", accent: "#2dd4bf", block: "#60a5fa" },
  { header: "#a78bfa", accent: "#f97316", block: "#4ade80" },
  { header: "#fb7185", accent: "#38bdf8", block: "#fbbf24" },
];

export default function WebsitePreviewMock({ websiteId }: { websiteId: string }) {
  const palette = PALETTES[hashString(websiteId) % PALETTES.length];

  return (
    <div className="dash-preview" aria-hidden>
      <div className="dash-preview__frame">
        <div className="dash-preview__header" style={{ background: palette.header }} />
        <div className="dash-preview__hero" style={{ background: `${palette.accent}33` }} />
        <div className="dash-preview__lines">
          <span />
          <span />
          <span className="dash-preview__line--short" />
        </div>
        <div className="dash-preview__blocks">
          <span style={{ background: palette.block }} />
          <span style={{ background: palette.header }} />
          <span style={{ background: palette.accent }} />
        </div>
      </div>
    </div>
  );
}
