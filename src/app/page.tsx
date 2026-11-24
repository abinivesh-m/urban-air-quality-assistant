"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Calculator,
  Home as HomeIcon,
  Leaf,
  MessageCircle,
  Wind,
} from "lucide-react";

import { AirQualityPanel } from "@/components/AirQualityPanel";
import { AssistantChat } from "@/components/AssistantChat";
import { CitySelector } from "@/components/CitySelector";
import { Footer } from "@/components/Footer";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import { IndoorHacks } from "@/components/IndoorHacks";
import { PollutantGuide } from "@/components/PollutantGuide";
import { Recommendations } from "@/components/Recommendations";
import { SustainableAlternatives } from "@/components/SustainableAlternatives";
import { TabNav, type TabDefinition } from "@/components/TabNav";
import { CITIES, DEFAULT_CITY_ID, getCity, isKnownCity } from "@/lib/air-quality";

type TabId = "dashboard" | "assistant" | "indoor" | "alternatives" | "impact";

const TABS: readonly TabDefinition<TabId>[] = [
  { id: "dashboard", label: "Dashboard", icon: <Wind className="h-3.5 w-3.5" /> },
  {
    id: "assistant",
    label: "Assistant",
    icon: <MessageCircle className="h-3.5 w-3.5" />,
  },
  { id: "indoor", label: "Indoor hacks", icon: <HomeIcon className="h-3.5 w-3.5" /> },
  {
    id: "alternatives",
    label: "Sustainable",
    icon: <Leaf className="h-3.5 w-3.5" />,
  },
  { id: "impact", label: "Impact", icon: <Calculator className="h-3.5 w-3.5" /> },
];

const panelId = (id: TabId) => `panel-${id}`;

const PANEL_FOCUS_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

interface TabPanelProps {
  readonly id: TabId;
  readonly activeTab: TabId;
  /** Layout width for the panel; content is centred unless overridden. */
  readonly widthClass?: string;
  readonly children: ReactNode;
}

/**
 * A single accessible tab panel.
 *
 * Keeping the role, labelling, focus ring and hidden state in one component
 * means none of the five tabs can drift out of sync with the others.
 */
function TabPanel({ id, activeTab, widthClass = "", children }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelId(id)}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      hidden={activeTab !== id}
      className={`${PANEL_FOCUS_CLASS} ${widthClass}`.trim()}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const reading = useMemo(() => getCity(cityId) ?? CITIES[0], [cityId]);

  const handleCityChange = useCallback((next: string) => {
    if (isKnownCity(next)) setCityId(next);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white"
              aria-hidden="true"
            >
              <Wind className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
                Urban Air Quality Assistant
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                Breathe easier through smog season
              </p>
            </div>
          </div>
          <CitySelector value={cityId} onChange={handleCityChange} />
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
        <TabNav
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
          panelId={panelId}
        />

        <div>
          <TabPanel id="dashboard" activeTab={activeTab}>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AirQualityPanel reading={reading} />
              </div>
              <div className="space-y-5">
                <Recommendations reading={reading} />
                <PollutantGuide />
              </div>
            </div>
          </TabPanel>

          <TabPanel id="assistant" activeTab={activeTab} widthClass="mx-auto max-w-3xl">
            <AssistantChat cityId={reading.id} cityName={reading.city} />
          </TabPanel>

          <TabPanel id="indoor" activeTab={activeTab} widthClass="mx-auto max-w-3xl">
            <IndoorHacks />
          </TabPanel>

          <TabPanel
            id="alternatives"
            activeTab={activeTab}
            widthClass="mx-auto max-w-5xl"
          >
            <SustainableAlternatives />
          </TabPanel>

          <TabPanel id="impact" activeTab={activeTab} widthClass="mx-auto max-w-3xl">
            <ImpactCalculator />
          </TabPanel>
        </div>
      </main>

      <Footer />
    </div>
  );
}
