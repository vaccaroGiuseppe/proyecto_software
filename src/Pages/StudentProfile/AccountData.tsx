"use client";
import * as React from "react";
import { AccountDataField } from "./AccountDataField";

interface AccountDataProps {
  name: string;
  email: string;
  password: string;
  phone: string;
  editIconUrl: string;
  onEditName?: () => void;
  onEditEmail?: () => void;
  onEditPassword?: () => void;
  onEditPhone?: () => void;
}

export function AccountData({
  name,
  email,
  password,
  phone,
  editIconUrl,
  onEditName,
  onEditEmail,
  onEditPassword,
  onEditPhone
}: AccountDataProps) {
  return (
    <section className="account-section">
      <h2 className="section-title">
        Datos de mi cuenta
      </h2>
      <div className="account-data-container">
        <AccountDataField
          label="Nombre"
          value={name}
          onEdit={onEditName}
          iconUrl={editIconUrl}
        />

        <AccountDataField
          label="Correo electrónico"
          value={email}
          onEdit={onEditEmail}
          iconUrl={editIconUrl}
          isWide={true}
        />

        <AccountDataField
          label="Contraseña"
          value={password}
          onEdit={onEditPassword}
          iconUrl={editIconUrl}
        />

        <AccountDataField
          label="Número de teléfono"
          value={phone}
          onEdit={onEditPhone}
          iconUrl={editIconUrl}
        />
      </div>
    </section>
  );
}
