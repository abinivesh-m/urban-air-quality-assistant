"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

export interface TabDefinition<T extends string> {
  readonly id: T;
  readonly label: string;
  readonly icon: ReactNode;
}

interface TabNavProps<T extends string> {
  readonly tabs: readonly TabDefinition<T>[];
  readonly activeTab: T;
  readonly onChange: (id: T) => void;
  /** Id of the panel a tab controls, for `aria-controls`. */
  readonly panelId: (id: T) => string;
}

/**
 * WAI-ARIA tabs with roving tabindex and full keyboard support
 * (Left/Right/Home/End), matching the APG tabs pattern.
 */
export function TabNav<T extends string>({
  tabs,
  activeTab,
  onChange,
  panelId,
}: TabNavProps<T>) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const lastIndex = tabs.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    onChange(nextTab.id);
    buttonRefs.current[nextTab.id]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Air quality assistant sections"
      className="flex gap-1 overflow-x-auto pb-2"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttonRefs.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={panelId(tab.id)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
              isActive
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
