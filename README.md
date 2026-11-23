# Urban Air Quality Assistant

A GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application suggests low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to location and lifestyle, while clearly explaining the direct impact of user choices.

## Features

- **Real-time Air Quality Dashboard** - AQI, PM2.5, PM10, NO₂, O₃, CO monitoring with health advice
- **AI Chat Assistant** - GenAI-powered conversational assistant for air quality questions
- **Indoor Air Quality Hacks** - Practical, low-cost ways to reduce indoor pollution
- **Sustainable Alternatives** - Eco-friendly swaps with CO₂ savings and cost comparisons
- **Carbon Impact Calculator** - Estimate annual carbon footprint from daily habits
- **Location-based Recommendations** - Tailored advice based on city air quality
- **Accessibility** - WCAG 2.2 AA compliant with keyboard navigation and screen reader support
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** GenAI-powered chat assistant (knowledge base + pattern matching)
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Deployment

Deploy to Vercel (recommended):

```bash
npx vercel
```

Or any other hosting platform (Netlify, Render, etc.).

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # AI chat API endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── test/
│   ├── chat.test.ts         # Chat API tests
│   └── setup.ts             # Test setup
└── ...
```

## Environment Variables

No external API keys required. The app uses a built-in knowledge base for AI responses.

## License

MIT
```

I'll create the README file now.<|end|><|start|>start<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="content">
# Urban Air Quality Assistant

A GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application suggests low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to location and lifestyle, while clearly explaining the direct impact of user choices.

## Features

- **Real-time Air Quality Dashboard** - AQI, PM2.5, PM10, NO₂, O₃, CO monitoring with health advice
- **AI Chat Assistant** - GenAI-powered conversational assistant for air quality questions
- **Indoor Air Quality Hacks** - Practical, low-cost ways to reduce indoor pollution
- **Sustainable Alternatives** - Eco-friendly swaps with CO₂ savings and cost comparisons
- **Carbon Impact Calculator** - Estimate annual carbon footprint from daily habits
- **Location-based Recommendations** - Tailored advice based on city air quality
- **Accessibility** - WCAG 2.2 AA compliant with keyboard navigation and screen reader support
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** GenAI-powered chat assistant (knowledge base + pattern matching)
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Deployment

Deploy to Vercel (recommended):

```bash
npx vercel
```

Or any other hosting platform (Netlify, Render, etc.).

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # AI chat API endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── test/
│   ├── chat.test.ts         # Chat API tests
│   └── setup.ts             # Test setup
└── ...
```

## Environment Variables

No external API keys required. The app uses a built-in knowledge base for AI responses.

## License

MIT
```

Now let me run the build to check for errors.<|end|><|start|>start<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd "C:\Users\abini\OneDrive\Desktop\LifeLine AI\urban-air-quality-assistant"; npm run build 2>&1 | Select-Object -Last 25