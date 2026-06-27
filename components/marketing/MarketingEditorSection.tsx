import Link from "next/link";
import { Copy, GripVertical, Pencil } from "lucide-react";
import { editPoints } from "@/lib/marketing/content";

export default function MarketingEditorSection() {
  return (
    <section className="wx-section">
      <div className="wx-container wx-editor">
        <div>
          <div className="wx-eyebrow">Edit live, see it instantly</div>
          <h2 className="wx-editor__title">
            AI gets you started.
            <br />
            You stay in control.
          </h2>
          <p className="wx-editor__copy">
            Click any text to rewrite it. Drag sections to reorder. Swap colors, logos and images in
            seconds. No code, no learning curve — exactly the simple, visual editing Webeix has always
            been about.
          </p>

          <div className="wx-editor__points">
            {editPoints.map((point) => (
              <div key={point} className="wx-editor__point">
                <span className="wx-editor__check" aria-hidden>
                  ✓
                </span>
                {point}
              </div>
            ))}
          </div>

          <Link href="/signup" className="wx-btn wx-btn--ghost" style={{ marginTop: "1.875rem" }}>
            See the editor →
          </Link>
        </div>

        <div className="wx-editor__mock" aria-hidden>
          <div className="wx-editor__mock-bar">Editing · Hero section</div>
          <div className="wx-editor__mock-body">
            <div className="wx-editor__mock-selected">
              <span className="wx-editor__mock-tag">Hero · selected</span>
              <div className="wx-editor__mock-tools">
                <span className="wx-editor__mock-tool">
                  <Pencil size={14} strokeWidth={2} />
                </span>
                <span className="wx-editor__mock-tool">
                  <Copy size={14} strokeWidth={2} />
                </span>
                <span className="wx-editor__mock-tool">
                  <GripVertical size={14} strokeWidth={2} />
                </span>
              </div>
              <div className="wx-editor__mock-title">Confident smiles, gentle care.</div>
              <p className="wx-editor__mock-sub">
                Modern dentistry for the whole family — same-week appointments in a calm, welcoming
                clinic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
