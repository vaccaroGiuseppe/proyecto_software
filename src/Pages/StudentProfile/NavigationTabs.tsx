"use client";
import * as React from "react";

interface Tab {
  id: string;
  label: string;
  isActive?: boolean;
}

interface NavigationTabsProps {
  tabs: Tab[];
  onTabChange?: (tabId: string) => void;
}

export function NavigationTabs({ tabs, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="navigation-tabs">
      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <button
            className="tab-button"
            onClick={() => onTabChange?.(tab.id)}
          >
            {tab.label}
          </button>
          {index < tabs.length - 1 && (
            <div className="tab-separator" />
          )}
        </React.Fragment>
      ))}
      <div className="tab-indicator" />
    </nav>
  );
}
