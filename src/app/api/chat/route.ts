import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
});

const knowledgeBase: Record<string, string> = {
  pm25: "PM2.5 refers to fine particulate matter. Reduce exposure by staying indoors, using air purifiers, and wearing N95 masks.",
  mask: "For pollution protection, use N95 or KN95 masks. They filter 95% of particles 0.3 microns or larger.",
  purifier: "Air purifiers with HEPA filters remove 99.97% of particles. DIY Corsi-Rosenthal boxes cost about 60 dollars.",
  indoor: "Indoor tips: seal window gaps, wet mop daily, use exhaust fans, keep indoor plants, create a clean air room.",
  exercise: "During high pollution (AQI > 150): avoid outdoor exercise. Exercise early morning when pollution is lowest.",
  children: "Children are more vulnerable. Keep them indoors during high AQI days. Use child-sized N95 masks.",
  cooking: "Use exhaust fan always, cook with lids, avoid high-heat frying during pollution peaks.",
  plants: "NASA study: Spider Plant, Peace Lily, Snake Plant remove VOCs. Use 1 plant per 100 sq ft.",
  commute: "Reduce emissions: use public transport, carpool, cycle for short trips, work from home on high-pollution days.",
  smog: "Winter smog forms when cold air traps pollutants. Common in Delhi, Beijing. Worsens with low wind and humidity.",
  carbon: "Daily carbon footprint: car (0.21 kg CO2 per km), meat meal (2.5 kg), plastic bag (0.006 kg). Switching cuts 40-60%.",
  alternatives: "Sustainable swaps: Car to EV or transit (saves 4.6 tonnes CO2 per year), Gas heater to Solar (saves 1.2 tonnes), Meat to plant-based (saves 1.5 tonnes).",
};

function generateResponse(message: string): string {
  const lower = message.toLowerCase();
  const keywords: [string, string[]][] = [
    ["pm25", ["pm2.5", "pm 2.5", "fine particle", "particulate"]],
    ["mask", ["mask", "n95", "kn95", "protection"]],
    ["purifier", ["purifier", "hepa", "filter", "clean air"]],
    ["indoor", ["indoor", "inside", "home", "room", "seal"]],
    ["exercise", ["exercise", "workout", "running", "jogging"]],
    ["children", ["child", "kid", "baby", "school"]],
    ["cooking", ["cooking", "cook", "kitchen", "stove"]],
    ["plants", ["plant", "houseplant", "spider", "peace lily"]],
    ["commute", ["commute", "travel", "transport", "car", "bus"]],
    ["smog", ["smog", "fog", "haze", "winter", "pollution"]],
    ["carbon", ["carbon", "co2", "footprint", "emission"]],
    ["alternatives", ["alternative", "sustainable", "swap", "eco", "green"]],
  ];
  for (const [key, terms] of keywords) {
    if (terms.some((t) => lower.includes(t))) {
      return knowledgeBase[key];
    }
  }
  return "Great question! Ask me about: air quality (PM2.5, AQI), masks, air purifiers, indoor hacks, exercise during pollution, protecting children, cooking tips, houseplants, sustainable commute, carbon footprint, or eco-friendly alternatives.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const reply = generateResponse(parsed.data.message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
