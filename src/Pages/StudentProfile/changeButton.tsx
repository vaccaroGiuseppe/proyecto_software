"use client";

interface ChangeButtonProps {
  onClick?: () => void;
  iconUrl: string;
  label?: string;
}

export function ChangeButton({ onClick, iconUrl, label = "Cambiar" }: ChangeButtonProps) {
  return (
    <button
      className="change-button"
      onClick={onClick}
    >
      <img
        src={iconUrl}
        alt=""
        className="change-button-icon"
      />
      <span className="change-button-text">
        {label}
      </span>
    </button>
  );
}
