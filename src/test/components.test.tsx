import { useCallback, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import HomePage from "@/app/page";
import { AirQualityPanel } from "@/components/AirQualityPanel";
import { AssistantChat } from "@/components/AssistantChat";
import { ImpactCalculator } from "@/components/ImpactCalculator";
import { IndoorHacks } from "@/components/IndoorHacks";
import { Recommendations } from "@/components/Recommendations";
import { SustainableAlternatives } from "@/components/SustainableAlternatives";
import { TabNav, type TabDefinition } from "@/components/TabNav";
import { getCity } from "@/lib/air-quality";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AirQualityPanel", () => {
  const delhi = getCity("delhi")!;

  it("renders the city, AQI and category", () => {
    render(<AirQualityPanel reading={delhi} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "New Delhi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("285")).toBeInTheDocument();
    expect(screen.getByText("Very Unhealthy")).toBeInTheDocument();
  });

  it("lists every pollutant with its unit", () => {
    render(<AirQualityPanel reading={delhi} />);

    for (const label of ["PM2.5", "PM10", "NO₂", "O₃", "CO"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText("µg/m³")).toHaveLength(2);
  });

  it("exposes the AQI as an accessible meter", () => {
    render(<AirQualityPanel reading={delhi} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "285");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "500");
    expect(meter).toHaveAttribute("aria-valuetext", expect.stringContaining("Very Unhealthy"));
  });

  it("shows the health guidance as a note", () => {
    render(<AirQualityPanel reading={delhi} />);
    expect(screen.getByRole("note")).toHaveTextContent(/Health guidance/i);
  });
});

describe("Recommendations", () => {
  it("derives different actions for different cities", () => {
    const { unmount } = render(<Recommendations reading={getCity("delhi")!} />);
    expect(screen.getByText(/Stay indoors and seal gaps/i)).toBeInTheDocument();
    unmount();

    render(<Recommendations reading={getCity("london")!} />);
    expect(screen.getByText(/Ventilate while air is clean/i)).toBeInTheDocument();
    expect(screen.queryByText(/Stay indoors and seal gaps/i)).not.toBeInTheDocument();
  });
});

describe("IndoorHacks", () => {
  it("renders every hack as a disclosure", () => {
    render(<IndoorHacks />);
    expect(screen.getAllByText(/Corsi-Rosenthal/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Seal window and door gaps/i)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(6);
  });
});

describe("SustainableAlternatives", () => {
  it("filters the swaps by category", () => {
    render(<SustainableAlternatives />);

    expect(
      screen.getByText("Rooftop solar with net metering"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Food" }));

    expect(screen.getByText("More plant-based meals")).toBeInTheDocument();
    expect(
      screen.queryByText("Rooftop solar with net metering"),
    ).not.toBeInTheDocument();
  });

  it("marks the active filter with aria-pressed", () => {
    render(<SustainableAlternatives />);
    const allButton = screen.getByRole("button", { name: "All" });
    expect(allButton).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ImpactCalculator", () => {
  it("updates the result when a slider moves", () => {
    render(<ImpactCalculator />);

    const carSlider = screen.getByLabelText(/Car travel per day/i);
    fireEvent.change(carSlider, { target: { value: "0" } });

    expect(screen.getByText("0 km")).toBeInTheDocument();
  });

  it("resets to the typical household", () => {
    render(<ImpactCalculator />);

    fireEvent.change(screen.getByLabelText(/Car travel per day/i), {
      target: { value: "5" },
    });
    expect(screen.getByText("5 km")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect(screen.getByText("20 km")).toBeInTheDocument();
  });

  it("announces results in a live region", () => {
    render(<ImpactCalculator />);
    const output = screen.getByText(/estimated CO₂ per year/i).closest("[aria-live]");
    expect(output).toHaveAttribute("aria-live", "polite");
  });
});

describe("TabNav", () => {
  function Harness() {
    const tabs: readonly TabDefinition<"a" | "b" | "c">[] = [
      { id: "a", label: "Alpha", icon: null },
      { id: "b", label: "Bravo", icon: null },
      { id: "c", label: "Charlie", icon: null },
    ];
    const [active, setActive] = useState<"a" | "b" | "c">("a");
    return (
      <TabNav
        tabs={tabs}
        activeTab={active}
        onChange={setActive}
        panelId={(id) => `panel-${id}`}
      />
    );
  }

  it("moves selection with the arrow keys", () => {
    render(<Harness />);

    const alpha = screen.getByRole("tab", { name: "Alpha" });
    expect(alpha).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(alpha, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Bravo" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("wraps from the last tab to the first", () => {
    render(<Harness />);
    const charlie = screen.getByRole("tab", { name: "Charlie" });
    fireEvent.keyDown(charlie, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("supports Home and End", () => {
    render(<Harness />);
    const alpha = screen.getByRole("tab", { name: "Alpha" });

    fireEvent.keyDown(alpha, { key: "End" });
    expect(screen.getByRole("tab", { name: "Charlie" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.keyDown(screen.getByRole("tab", { name: "Charlie" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("only keeps the active tab in the tab order", () => {
    render(<Harness />);
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Bravo" })).toHaveAttribute("tabindex", "-1");
  });
});

describe("AssistantChat", () => {
  it("sends a message and renders the reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ reply: "Wear a fitted N95 mask.", intent: "mask" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AssistantChat cityId="delhi" cityName="New Delhi" />);

    fireEvent.change(screen.getByLabelText(/Ask the air quality assistant/i), {
      target: { value: "Which mask should I wear?" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send message/i }));

    await waitFor(() => {
      expect(screen.getByText("Wear a fitted N95 mask.")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "Which mask should I wear?", cityId: "delhi" }),
      }),
    );
  });

  it("shows an alert when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<AssistantChat cityId="delhi" cityName="New Delhi" />);

    fireEvent.change(screen.getByLabelText(/Ask the air quality assistant/i), {
      target: { value: "hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send message/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Couldn't reach/i);
    });
  });

  it("offers suggested prompts", () => {
    render(<AssistantChat cityId="delhi" cityName="New Delhi" />);
    expect(
      screen.getByRole("button", { name: /Can I run outside today\?/i }),
    ).toBeInTheDocument();
  });
});

describe("HomePage", () => {
  it("starts on the dashboard with the default city", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /Urban Air Quality Assistant/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Bengaluru" }),
    ).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
  });

  it("updates the dashboard when the city changes", () => {
    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("City"), { target: { value: "delhi" } });

    expect(
      screen.getByRole("heading", { level: 2, name: "New Delhi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("285")).toBeInTheDocument();
  });

  it("switches panels from the tab bar", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("tab", { name: /Indoor hacks/i }));

    expect(
      screen.getByRole("heading", { level: 2, name: /Indoor air quality hacks/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Bengaluru" }),
    ).not.toBeInTheDocument();
  });

  it("exposes a skip link as the first focusable element", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: /Skip to main content/i })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("keeps all tabpanels in the DOM for aria-controls validity", () => {
    render(<HomePage />);
    const tabs = screen.getAllByRole("tab");
    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls!)).not.toBeNull();
    }
  });
});
