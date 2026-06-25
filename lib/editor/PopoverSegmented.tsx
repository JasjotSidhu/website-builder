"use client";

interface PopoverSegmentedOption {
  value: string;
  label: string;
}

interface PopoverSegmentedProps {
  label: string;
  value: string;
  options: PopoverSegmentedOption[];
  onChange: (value: string) => void;
  layout?: "inline" | "stacked";
}

export default function PopoverSegmented({
  label,
  value,
  options,
  onChange,
  layout = "inline",
}: PopoverSegmentedProps) {
  const fieldClass =
    layout === "stacked"
      ? "popover-field popover-field--segmented-stack"
      : "popover-field popover-field--inline";

  return (
    <div className={fieldClass}>
      <span className="popover-field__label">{label}</span>
      <div className="popover-segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`popover-segmented__btn${value === option.value ? " popover-segmented__btn--active" : ""}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
