"use client";

import { useCallback, useMemo, useState } from "react";
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
          <div
            role="tabpanel"
            id={panelId("dashboard")}
            aria-labelledby="tab-dashboard"
            tabIndex={0}
            hidden={activeTab !== "dashboard"}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AirQualityPanel reading={reading} />
              </div>
              <div className="space-y-5">
                <Recommendations reading={reading} />
                <PollutantGuide />
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id={panelId("assistant")}
            aria-labelledby="tab-assistant"
            tabIndex={0}
            hidden={activeTab !== "assistant"}
            className="mx-auto max-w-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <AssistantChat cityId={reading.id} cityName={reading.city} />
          </div>

          <div
            role="tabpanel"
            id={panelId("indoor")}
            aria-labelledby="tab-indoor"
            tabIndex={0}
            hidden={activeTab !== "indoor"}
            className="mx-auto max-w-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <IndoorHacks />
          </div>

          <div
            role="tabpanel"
            id={panelId("alternatives")}
            aria-labelledby="tab-alternatives"
            tabIndex={0}
            hidden={activeTab !== "alternatives"}
            className="mx-auto max-w-5xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <SustainableAlternatives />
          </div>

          <div
            role="tabpanel"
            id={panelId("impact")}
            aria-labelledby="tab-impact"
            tabIndex={0}
            hidden={activeTab !== "impact"}
            className="mx-auto max-w-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <ImpactCalculator />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
