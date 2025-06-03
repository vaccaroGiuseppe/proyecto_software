/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import * as React from "react";
import "./styles.css";
import { UserProfile } from "./UserProfile";
import { NavigationTabs } from "./NavigationTabs";
import { AccountData } from "./AccountData";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer"

export default function UserAccountPage() {
  const [activeTab, setActiveTab] = React.useState("account");

  const tabs = [
    { id: "account", label: "Mi Cuenta", isActive: true },
    { id: "agenda", label: "Mi agenda", isActive: false }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleEditName = () => {
    console.log("Edit name clicked");
  };

  const handleEditEmail = () => {
    console.log("Edit email clicked");
  };

  const handleEditPassword = () => {
    console.log("Edit password clicked");
  };

  const handleEditPhone = () => {
    console.log("Edit phone clicked");
  };

  return (
  <div>
    <Navbar/>
    <main>
      <UserProfile
        name="Daniel Alvarez"
        email="daniel.alvarez@correo.unimet.edu.ve"
        avatarUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/37237ad1eb7c995bee2c1d85650cd6ee3bfaeb96?placeholderIfAbsent=true&apiKey=cd9c25b0673b45239d6c4cfad51942aa"
        editIconUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/673b523753c32a3e31332c237826c90dca3e0c7b?placeholderIfAbsent=true&apiKey=cd9c25b0673b45239d6c4cfad51942aa"
      />

      <NavigationTabs
        tabs={tabs}
        onTabChange={handleTabChange}
      />

      <AccountData
        name="Daniel Alvarez"
        email="daniel.alvarez@correo.unimet.edu.ve"
        password="************"
        phone="+58 4243109558"
        editIconUrl="https://cdn.builder.io/api/v1/image/assets/TEMP/fa60eb52e2b02dff607346b1ee1f2352e410a8af?placeholderIfAbsent=true&apiKey=cd9c25b0673b45239d6c4cfad51942aa"
        onEditName={handleEditName}
        onEditEmail={handleEditEmail}
        onEditPassword={handleEditPassword}
        onEditPhone={handleEditPhone}
      />
    </main>
    <Footer />
  </div>);
}
