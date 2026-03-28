# Farmer Live Advisory

A Next.js app providing live farming advisory powered by local AI, real-time weather, and Indian market prices — **completely free, no API keys required**.

---

## Features

- 🌤️ **Weather** — Live data via [Open-Meteo](https://open-meteo.com/) (no key needed)
- 💰 **Market Prices** — Real Indian APMC/mandi prices (no key needed)
- 🤖 **AI Advisory** — Local LLM inference via [Ollama](https://ollama.com/) (no key needed, runs on your machine)

---

## Quick Start

### 1 — Install & start Ollama

Download Ollama from **https://ollama.com/** (available for macOS, Windows, Linux).

After installation, pull and start the model:

```bash
ollama run llama2
```

Ollama will now listen on `http://localhost:11434`.  You only need to do this once; Ollama runs in the background automatically on subsequent startups.

> **Alternative models:** You can use any Ollama-compatible model (e.g. `mistral`, `phi`, `gemma`).  
> To switch models, update `OLLAMA_MODEL` in `lib/services/ollamaService.ts`.

### 2 — Clone & install dependencies

```bash
git clone https://github.com/gaurav446446-hue/farmer-live-advisory.git
cd farmer-live-advisory
npm install
```

### 3 — Start the app

```bash
npm run dev
```

Open **http://localhost:3000** 🌾

---

## AI Advisory — How It Works

The app sends farming-context prompts (weather, market price, crop, season, location) to your **locally running** Ollama instance.  No data ever leaves your machine.

| Category | What you get |
|---|---|
| 🌱 Planting | Best time to plant, soil conditions, weather cautions |
| 💧 Irrigation | Water requirements, optimal irrigation timing |
| 🧪 Fertilizer | Fertilizer type, quantity per acre, application timing |
| 📈 Market | When to sell, short-term price outlook |
| 🐛 Pest & Disease | Common threats for your crop/season, prevention tips |

### Requirements

- Ollama installed and running (`ollama serve` or via the desktop app)
- At least one model pulled (`ollama pull llama2`)

---

## Environment Variables

No API keys are required.  All external data sources used are free and open.

| Variable | Purpose | Default |
|---|---|---|
| *(none required)* | — | — |

---

## Tech Stack

- **Next.js 16** — React framework
- **Tailwind CSS** — Styling
- **Radix UI** — Accessible UI components
- **Ollama** — Local LLM inference (Llama 2, Mistral, …)
- **Open-Meteo** — Free weather API
- **Lucide React** — Icons