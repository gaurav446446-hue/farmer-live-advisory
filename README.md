# Farmer Live Advisory

A real-time farming advisory app built with Next.js, providing weather data, market prices, and AI-powered crop recommendations.

## Weather: Open-Meteo (No API Key Required)

Weather data is fetched from [Open-Meteo](https://open-meteo.com/) — a completely free, open-source weather API that requires **no registration and no API key**.

### Features

- Real-time weather conditions (temperature, feels-like, humidity, wind speed, pressure, visibility)
- 5-day daily forecast
- Coordinate-based (`lat`/`lon`) or city-name lookup with automatic geocoding
- Global coverage
- No rate limiting for normal use
- Zero configuration

### Example API Call

```
https://api.open-meteo.com/v1/forecast?latitude=28.7041&longitude=77.1025&current=temperature_2m,relative_humidity_2m,weather_code&forecast_days=5
```

## Getting Started

```bash
git clone https://github.com/gaurav446446-hue/farmer-live-advisory.git
cd farmer-live-advisory
npm install
```

Copy the example environment file (only needed for optional services like Groq AI):

```bash
cp .env.local.example .env.local
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See [`.env.local.example`](.env.local.example) for the full list. Weather requires **no environment variables** — it works out of the box.

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GROQ_API_KEY` | Optional | Groq AI key for farming advisory ([get free key](https://console.groq.com/)) |

## Tech Stack

- [Next.js](https://nextjs.org/) — React framework
- [Open-Meteo](https://open-meteo.com/) — Free weather API (no key)
- [Groq](https://groq.com/) — Free AI inference (optional)
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [TypeScript](https://www.typescriptlang.org/) — Type safety