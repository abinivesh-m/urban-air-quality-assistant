"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Wind, Home as HomeIcon, Leaf, Calculator, MessageCircle, MapPin, AlertTriangle, CheckCircle2, Loader2, Send, Sparkles, Shield, Droplets, Thermometer, Sun, TreePine, Bike, Car, Bus, Recycle, Lightbulb, Fan, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

interface AirQualityData {
  location: string; aqi: number; pm25: number; pm10: number; no2: number; o3: number; co: number;
  temperature: number; humidity: number; condition: string; lastUpdated: string; category: string; color: string; healthAdvice: string;
}

interface ChatMessage { role: "user" | "assistant"; content: string; timestamp: number; }
interface IndoorHack { id: string; title: string; description: string; impact: string; effort: "Low" | "Medium" | "High"; cost: string; icon: React.ReactNode; }
interface SustainableAlt { id: string; category: string; conventional: string; sustainable: string; co2Saved: string; costComparison: string; icon: React.ReactNode; }

const mockAirQuality: Record<string, AirQualityData> = {
  delhi: { location: "New Delhi, India", aqi: 285, pm25: 142, pm10: 210, no2: 68, o3: 45, co: 1.2, temperature: 18, humidity: 65, condition: "Very Unhealthy", lastUpdated: "2026-11-22 08:30 IST", category: "Very Unhealthy", color: "bg-red-600", healthAdvice: "Everyone should avoid all outdoor exertion. Sensitive groups should remain indoors with air purifiers running." },
  mumbai: { location: "Mumbai, India", aqi: 125, pm25: 58, pm10: 95, no2: 42, o3: 38, co: 0.8, temperature: 28, humidity: 72, condition: "Unhealthy for Sensitive Groups", lastUpdated: "2026-11-22 08:30 IST", category: "Unhealthy for Sensitive Groups", color: "bg-orange-500", healthAdvice: "Sensitive groups should reduce prolonged outdoor exertion." },
  bangalore: { location: "Bangalore, India", aqi: 78, pm25: 32, pm10: 55, no2: 28, o3: 42, co: 0.5, temperature: 24, humidity: 58, condition: "Moderate", lastUpdated: "2026-11-22 08:30 IST", category: "Moderate", color: "bg-yellow-500", healthAdvice: "Unusually sensitive people should consider reducing prolonged outdoor exertion." },
  chennai: { location: "Chennai, India", aqi: 92, pm25: 41, pm10: 68, no2: 35, o3: 48, co: 0.6, temperature: 30, humidity: 78, condition: "Moderate", lastUpdated: "2026-11-22 08:30 IST", category: "Moderate", color: "bg-yellow-500", healthAdvice: "Unusually sensitive people should consider reducing prolonged outdoor exertion." },
  london: { location: "London, UK", aqi: 42, pm25: 12, pm10: 22, no2: 25, o3: 35, co: 0.3, temperature: 8, humidity: 82, condition: "Good", lastUpdated: "2026-11-22 08:30 GMT", category: "Good", color: "bg-green-500", healthAdvice: "Air quality is satisfactory. No health precautions needed." },
  beijing: { location: "Beijing, China", aqi: 198, pm25: 98, pm10: 165, no2: 55, o3: 52, co: 1.5, temperature: 5, humidity: 45, condition: "Unhealthy", lastUpdated: "2026-11-22 08:30 CST", category: "Unhealthy", color: "bg-red-500", healthAdvice: "Everyone may begin to experience health effects. Sensitive groups should avoid prolonged outdoor exertion." },
};

const indoorHacks: IndoorHack[] = [
  { id: "1", title: "DIY Air Purifier (Corsi-Rosenthal Box)", description: "Build a low-cost air purifier using a box fan and MERV-13 furnace filters. Costs ~$60 vs $300+ commercial units. Reduces PM2.5 by 60-80%.", impact: "Reduces indoor PM2.5 by 60-80%", effort: "Medium", cost: "$50-70", icon: <Fan className="w-6 h-6" /> },
  { id: "2", title: "Seal Window Gaps with Weatherstripping", description: "Apply foam weatherstripping to window and door gaps. Prevents outdoor pollutants from entering.", impact: "Blocks 40-60% of outdoor pollutant infiltration", effort: "Low", cost: "$5-15", icon: <HomeIcon className="w-6 h-6" /> },
  { id: "3", title: "Wet Mopping Over Dry Sweeping", description: "Dry sweeping resuspends settled dust. Wet mopping traps particles. Use a damp microfiber mop daily during high pollution days.", impact: "Reduces resuspended dust by 70%", effort: "Low", cost: "$0", icon: <Droplets className="w-6 h-6" /> },
  { id: "4", title: "Create a Clean Air Room", description: "Designate one room as a clean air sanctuary. Seal windows, run air purifier, keep door closed.", impact: "Reduces personal exposure by 50-70%", effort: "Medium", cost: "$100-300", icon: <Shield className="w-6 h-6" /> },
  { id: "5", title: "Houseplants for Air Quality", description: "NASA study: Spider plant, Peace lily, Snake plant remove formaldehyde, benzene, trichloroethylene.", impact: "Removes 20-30% of VOCs", effort: "Low", cost: "$10-25/plant", icon: <TreePine className="w-6 h-6" /> },
  { id: "6", title: "Cook with Lids and Exhaust Fan", description: "Cooking generates ultrafine particles. Always use exhaust fan, cook with lids, avoid high-heat frying during pollution peaks.", impact: "Reduces cooking PM by 50-60%", effort: "Low", cost: "$0", icon: <Thermometer className="w-6 h-6" /> },
];

const sustainableAlts: SustainableAlt[] = [
  { id: "1", category: "Transport", conventional: "Gasoline Car (solo)", sustainable: "Electric Vehicle / Public Transit", co2Saved: "4.6 tonnes CO2/year", costComparison: "EV: higher upfront, 60% lower running cost", icon: <Car className="w-5 h-5" /> },
  { id: "2", category: "Transport", conventional: "Short car trips (<3km)", sustainable: "Walking / Cycling / E-scooter", co2Saved: "0.5 tonnes CO2/year", costComparison: "Free (walking) or $200-500 (e-scooter)", icon: <Bike className="w-5 h-5" /> },
  { id: "3", category: "Energy", conventional: "Grid electricity (coal-heavy)", sustainable: "Rooftop Solar Panels", co2Saved: "3.5 tonnes CO2/year", costComparison: "Payback in 5-7 years, then free", icon: <Sun className="w-5 h-5" /> },
  { id: "4", category: "Energy", conventional: "Gas water heater", sustainable: "Solar water heater", co2Saved: "1.2 tonnes CO2/year", costComparison: "2-3 year payback period", icon: <Thermometer className="w-5 h-5" /> },
  { id: "5", category: "Food", conventional: "Meat-heavy diet", sustainable: "Plant-based / Reduced meat", co2Saved: "1.5 tonnes CO2/year", costComparison: "Often cheaper than meat", icon: <Leaf className="w-5 h-5" /> },
  { id: "6", category: "Waste", conventional: "Single-use plastics", sustainable: "Reusable bags, bottles, containers", co2Saved: "0.3 tonnes CO2/year", costComparison: "One-time $20-50 investment", icon: <Recycle className="w-5 h-5" /> },
  { id: "7", category: "Transport", conventional: "Private car commute", sustainable: "Carpooling / Ride-sharing", co2Saved: "1.8 tonnes CO2/year", costComparison: "Split fuel costs 2-4 ways", icon: <Bus className="w-5 h-5" /> },
  { id: "8", category: "Energy", conventional: "Incandescent bulbs", sustainable: "LED bulbs", co2Saved: "0.2 tonnes CO2/year", costComparison: "80% less electricity, 25x longer life", icon: <Lightbulb className="w-5 h-5" /> },
];

function AirQualityCard({ data }: { data: AirQualityData }) {
  const aqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-600";
    if (aqi <= 200) return "text-red-600";
    if (aqi <= 300) return "text-red-800";
    return "text-purple-800";
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" role="region" aria-label="Air Quality Dashboard">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-gray-800">{data.location}</h2>
        </div>
        <span className="text-xs text-gray-500">Updated: {data.lastUpdated}</span>
      </div>
      <div className="flex items-center gap-6 mb-6">
        <div className={`${data.color} text-white rounded-2xl p-4 text-center min-w-[120px]`} role="status" aria-label={`Air Quality Index: ${data.aqi}, ${data.category}`}>
          <div className="text-4xl font-bold">{data.aqi}</div>
          <div className="text-sm font-medium mt-1">AQI</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${aqiColor(data.aqi)}`}>{data.category}</div>
          <div className="text-sm text-gray-600 mt-1">{data.condition}</div>
          <div className="text-sm text-gray-500 mt-1">{data.temperature}C · {data.humidity}% humidity</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "PM2.5", value: data.pm25, unit: "ug/m3", danger: data.pm25 > 35 },
          { label: "PM10", value: data.pm10, unit: "ug/m3", danger: data.pm10 > 50 },
          { label: "NO2", value: data.no2, unit: "ppb", danger: data.no2 > 40 },
          { label: "O3", value: data.o3, unit: "ppb", danger: data.o3 > 70 },
          { label: "CO", value: data.co, unit: "ppm", danger: data.co > 1.0 },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 font-medium">{item.label}</div>
            <div className={`text-lg font-bold ${item.danger ? "text-red-600" : "text-gray-800"}`}>{item.value}</div>
            <div className="text-xs text-gray-400">{item.unit}</div>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" role="alert">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-amber-800">{data.healthAdvice}</p>
        </div>
      </div>
    </div>
  );
}

function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! I'm your Air Quality Assistant. Ask me about air pollution, indoor air quality, sustainable alternatives, or how to protect your family from smog.", timestamp: Date.now() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: input.trim() }) });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "I'm sorry, I couldn't process that.", timestamp: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[500px]" role="region" aria-label="AI Chat Assistant">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100">
        <Sparkles className="w-5 h-5 text-green-600" aria-hidden="true" />
        <h2 className="text-lg font-bold text-gray-800">Air Quality Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Thinking...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask about air quality, indoor hacks, or sustainable living..." className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" aria-label="Chat input" disabled={loading} />
          <button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-green-600 text-white rounded-xl px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function IndoorHacks() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" role="region" aria-label="Indoor Air Quality Hacks">
      <div className="flex items-center gap-2 mb-4">
        <HomeIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-800">Indoor Air Quality Hacks</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">Practical, low-cost ways to reduce indoor air pollution during smog season.</p>
      <div className="space-y-3">
        {indoorHacks.map((hack) => (
          <div key={hack.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors" onClick={() => setExpanded(expanded === hack.id ? null : hack.id)} aria-expanded={expanded === hack.id} aria-controls={`hack-${hack.id}`}>
              <div className="flex items-center gap-3">
                <div className="text-green-600" aria-hidden="true">{hack.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{hack.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Impact: {hack.impact} · Cost: {hack.cost} · Effort: {hack.effort}</div>
                </div>
              </div>
              {expanded === hack.id ? <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />}
            </button>
            {expanded === hack.id && <div id={`hack-${hack.id}`} className="px-4 pb-4 pt-0"><p className="text-sm text-gray-600">{hack.description}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SustainableAlternatives() {
  const [filter, setFilter] = useState<string>("All");
  const categories = ["All", ...Array.from(new Set(sustainableAlts.map((a) => a.category)))];
  const filtered = filter === "All" ? sustainableAlts : sustainableAlts.filter((a) => a.category === filter);
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" role="region" aria-label="Sustainable Alternatives">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-600" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-800">Sustainable Alternatives</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">Swap high-emission habits for greener choices. See the CO2 you save and cost comparison.</p>
      <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Filter by category">
        {categories.map((cat) => (
          <button key={cat} role="tab" aria-selected={filter === cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === cat ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((alt) => (
          <div key={alt.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-green-600" aria-hidden="true">{alt.icon}</div>
              <span className="text-xs font-semibold text-gray-500 uppercase">{alt.category}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-red-600 line-through">{alt.conventional}</span>
              <ArrowRight className="w-3 h-3 text-gray-400" aria-hidden="true" />
              <span className="text-sm text-green-700 font-medium">{alt.sustainable}</span>
            </div>
            <div className="text-xs text-green-600 font-semibold">Saves {alt.co2Saved}</div>
            <div className="text-xs text-gray-500 mt-1">{alt.costComparison}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactCalculator() {
  const [carKm, setCarKm] = useState(20);
  const [meatMeals, setMeatMeals] = useState(10);
  const [plasticBags, setPlasticBags] = useState(5);
  const co2FromCar = carKm * 0.21 * 365;
  const co2FromMeat = meatMeals * 2.5 * 52;
  const co2FromPlastic = plasticBags * 0.006 * 52;
  const totalCO2 = co2FromCar + co2FromMeat + co2FromPlastic;
  const treesNeeded = Math.ceil(totalCO2 / 21);
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100" role="region" aria-label="Carbon Impact Calculator">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-green-600" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-800">Carbon Impact Calculator</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">Estimate your annual carbon footprint from daily habits and see how switching helps.</p>
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="car-km" className="block text-sm font-medium text-gray-700 mb-1">Daily car travel (km): {carKm}</label>
          <input id="car-km" type="range" min="0" max="100" value={carKm} onChange={(e) => setCarKm(Number(e.target.value))} className="w-full accent-green-600" aria-label="Daily car travel in kilometers" />
        </div>
        <div>
          <label htmlFor="meat-meals" className="block text-sm font-medium text-gray-700 mb-1">Meat meals per week: {meatMeals}</label>
          <input id="meat-meals" type="range" min="0" max="21" value={meatMeals} onChange={(e) => setMeatMeals(Number(e.target.value))} className="w-full accent-green-600" aria-label="Meat meals per week" />
        </div>
        <div>
          <label htmlFor="plastic-bags" className="block text-sm font-medium text-gray-700 mb-1">Single-use plastic bags per week: {plasticBags}</label>
          <input id="plastic-bags" type="range" min="0" max="20" value={plasticBags} onChange={(e) => setPlasticBags(Number(e.target.value))} className="w-full accent-green-600" aria-label="Single-use plastic bags per week" />
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="text-center mb-3">
          <div className="text-3xl font-bold text-green-700">{totalCO2.toFixed(0)} kg</div>
          <div className="text-sm text-green-600">Estimated annual CO2 from these habits</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div><div className="font-bold text-gray-700">{co2FromCar.toFixed(0)} kg</div><div className="text-gray-500">Car travel</div></div>
          <div><div className="font-bold text-gray-700">{co2FromMeat.toFixed(0)} kg</div><div className="text-gray-500">Meat meals</div></div>
          <div><div className="font-bold text-gray-700">{co2FromPlastic.toFixed(0)} kg</div><div className="text-gray-500">Plastic bags</div></div>
        </div>
        <div className="mt-3 text-center text-sm text-green-700 font-medium">You would need about {treesNeeded} trees to offset this annually</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [location, setLocation] = useState("delhi");
  const [airData, setAirData] = useState<AirQualityData>(mockAirQuality.delhi);
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat" | "hacks" | "alternatives" | "calculator">("dashboard");
  const handleLocationChange = useCallback((loc: string) => { setLocation(loc); setAirData(mockAirQuality[loc]); }, []);
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: <Wind className="w-4 h-4" /> },
    { id: "chat" as const, label: "AI Assistant", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "hacks" as const, label: "Indoor Hacks", icon: <HomeIcon className="w-4 h-4" /> },
    { id: "alternatives" as const, label: "Sustainable", icon: <Leaf className="w-4 h-4" /> },
    { id: "calculator" as const, label: "Impact", icon: <Calculator className="w-4 h-4" /> },
  ];
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white rounded-xl p-2" aria-hidden="true"><Wind className="w-6 h-6" /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Urban Air Quality Assistant</h1>
              <p className="text-xs text-gray-500">Navigate smog and pollution with AI-powered insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="location-select" className="sr-only">Select location</label>
            <select id="location-select" value={location} onChange={(e) => handleLocationChange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Select city">
              {Object.keys(mockAirQuality).map((key) => (<option key={key} value={key}>{mockAirQuality[key].location}</option>))}
            </select>
          </div>
        </div>
      </header>
      <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {tabs.map((tab) => (
            <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-green-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><AirQualityCard data={airData} /></div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />Today&apos;s Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>Limit outdoor exercise to early morning (before 8 AM) when pollution is lowest</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>Keep windows closed during peak hours (10 AM - 4 PM)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>Run air purifier on high in the bedroom 2 hours before sleep</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>Wear N95 mask if going outdoors for extended periods</span></li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>Drink plenty of water to help flush toxins</span></li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Wind className="w-5 h-5 text-blue-500" aria-hidden="true" />Pollutant Guide</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between"><span className="font-medium">PM2.5</span><span>Fine particles that penetrate deep into lungs</span></div>
                  <div className="flex justify-between"><span className="font-medium">PM10</span><span>Coarse dust particles from construction/roads</span></div>
                  <div className="flex justify-between"><span className="font-medium">NO2</span><span>Traffic emissions, irritates airways</span></div>
                  <div className="flex justify-between"><span className="font-medium">O3</span><span>Ground-level ozone, worse on sunny days</span></div>
                  <div className="flex justify-between"><span className="font-medium">CO</span><span>Carbon monoxide from combustion</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "chat" && <ChatAssistant />}
        {activeTab === "hacks" && <IndoorHacks />}
        {activeTab === "alternatives" && <SustainableAlternatives />}
        {activeTab === "calculator" && <ImpactCalculator />}
      </div>
      <footer className="bg-gray-900 text-gray-400 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>Urban Air Quality Assistant · Built with GenAI · Powered by Next.js</p>
          <p className="mt-1 text-xs text-gray-500">Air quality data is simulated for demonstration. Always check official sources for real-time data.</p>
        </div>
      </footer>
    </main>
  );
}
