"use client";

interface AddSectionButtonProps {
  onClick: () => void;
}

export default function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <button type="button" className="add-section-btn" onClick={onClick}>
      + Add New Section
    </button>
  );
}
