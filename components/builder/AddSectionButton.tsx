"use client";

interface AddSectionButtonProps {
  onClick: () => void;
}

export default function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <div className="add-section-divider">
      <span className="add-section-divider__line" aria-hidden />
      <button type="button" className="add-section-divider__btn" onClick={onClick}>
        ADD SECTION
      </button>
    </div>
  );
}
