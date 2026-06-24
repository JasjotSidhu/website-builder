"use client";

interface PopoverSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function PopoverSwitch({ label, checked, onChange }: PopoverSwitchProps) {
  return (
    <label className="popover-field popover-field--inline">
      <span className="popover-field__label">{label}</span>
      <span className="popover-switch">
        <input
          type="checkbox"
          className="popover-switch__input"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="popover-switch__track" aria-hidden />
      </span>
    </label>
  );
}
