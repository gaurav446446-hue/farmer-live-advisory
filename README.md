# farmer-live-advisory

A Next.js application that provides live agricultural advisory services for Indian farmers, including real-time weather, APMC market prices, and AI-powered crop recommendations.

## Features

- 🌤️ **Live Weather** – powered by [Open-Meteo](https://open-meteo.com/) (no API key required)
- 📈 **Market Prices** – real-time Indian APMC mandi prices via [pyPricingAPI](https://github.com/ag-chitta/pyPricingAPI) (no API key required)
- 🤖 **AI Advisory** – crop and soil recommendations (optional Groq integration)
- 🌾 **Crop Guide** – comprehensive crop and soil data for Indian agriculture
- 🏛️ **Government Schemes** – information on subsidies, insurance, and credit schemes

## Getting Started

```bash
git clone https://github.com/gaurav446446-hue/farmer-live-advisory.git
cd farmer-live-advisory
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

### Required

None – the app works out of the box with zero configuration.

### Optional

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WEATHER_LATITUDE` | Default latitude for weather (default: 28.7041 – New Delhi) |
| `NEXT_PUBLIC_WEATHER_LONGITUDE` | Default longitude for weather (default: 77.1025 – New Delhi) |
| `NEXT_PUBLIC_GROQ_API_KEY` | Groq API key for AI advisory features |

## Market Prices API

Market prices are sourced from **pyPricingAPI**, which provides eNAM (e-National Agricultural Market) data for Indian APMC markets.

- **No API key required**
- **No registration needed**
- **Free and unlimited**
- **Data source:** eNAM (official Government of India data)
- **Endpoint:** `https://k14y5popkj.execute-api.ap-south-1.amazonaws.com/stage/commodities`

Supported query parameters:

| Parameter | Example | Description |
|---|---|---|
| `place` | `Delhi` | State or city name |
| `commodity` | `Rice` | Crop/commodity name |
| `type` | `current` / `historical` | Data type |

When the live API is unavailable, the app automatically falls back to bundled static data so the UI always shows prices.
