"use client";
import * as React from "react";
import { ChangeButton } from "./changeButton.tsx";

interface AccountDataFieldProps {
  label: string;
  value: string;
  onEdit?: () => void;
  iconUrl: string;
  isWide?: boolean;
}

export function AccountDataField({ label, value, onEdit, iconUrl, isWide = false }: AccountDataFieldProps) {
  return (
    <div className="data-field">
      <div className={`field-info ${isWide ? 'wide' : ''}`}>
        <p className="field-label">
          {label}
        </p>
        <p className={`field-value ${isWide ? 'wide' : ''}`}>
          {value}
        </p>
      </div>
      <div className="field-button-container">
        <ChangeButton
          onClick={onEdit}
          iconUrl={iconUrl}
        />
      </div>
    </div>
  );
}
