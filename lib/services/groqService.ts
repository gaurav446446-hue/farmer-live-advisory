// Groq AI service for farming advisory

import type { AdvisoryContext, AdvisoryItem, AdvisoryCategory } from "@/lib/types/advisory"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "mixtral-8x7b-32768"

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!key) {
    throw new Error(
      "Groq API key is not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your .env.local file."
    )
  }
  return key
}

/**
 * Build a context-aware prompt for each advisory category.
 */
function buildPrompt(category: AdvisoryCategory, ctx: AdvisoryContext): string {
  const season = ctx.season ?? "current season"
  const location = ctx.location ?? "your region"
  const crop = ctx.cropType ?? "your crop"

  const weatherSummary =
    ctx.temperature != null || ctx.humidity != null || ctx.rainfall != null
      ? `Current weather: temperature ${ctx.temperature ?? "unknown"}°C, humidity ${ctx.humidity ?? "unknown"}%, rain chance ${ctx.rainfall ?? "unknown"}%.`
      : ""

  const marketSummary = (() => {
    if (ctx.marketPrice == null) return ""
    const priceChangeStr =
      ctx.priceChange != null
        ? `${ctx.priceChange >= 0 ? "+" : ""}${ctx.priceChange.toFixed(1)}% today`
        : "trend unknown"
    return `Current market price of ${crop}: ₹${ctx.marketPrice}/quintal (${priceChangeStr}).`
  })()

  const baseContext = `You are an expert agricultural advisor helping Indian farmers. ${weatherSummary} ${marketSummary} Season: ${season}. Location: ${location}. Crop: ${crop}.`

  const categoryInstructions: Record<AdvisoryCategory, string> = {
    planting: `Give concise planting advice (2-3 sentences). Include: whether now is a good time to plant ${crop}, ideal soil conditions, and any weather-related cautions.`,
    irrigation: `Give concise irrigation advice (2-3 sentences). Include: how much water ${crop} needs right now based on temperature and humidity, and the best time of day to irrigate.`,
    fertilizer: `Give concise fertilizer advice (2-3 sentences). Include: which fertilizer type is best for ${crop} during ${season}, recommended quantity per acre, and application timing.`,
    market: `Give concise market timing advice (2-3 sentences). Include: whether this is a good time to sell ${crop} based on current price and trend, and a short-term price outlook.`,
    pest: `Give concise pest and disease prevention advice (2-3 sentences). Include: the most common pests or diseases affecting ${crop} during ${season} in ${location}, and simple preventive measures.`,
  }

  return `${baseContext}\n\n${categoryInstructions[category]}\n\nRespond ONLY with a JSON object in this exact format:\n{\n  "title": "<short title>",\n  "advice": "<2-3 sentence advice>",\n  "urgency": "<high|medium|low>"\n}`
}

/**
 * Fetch a single advisory item for one category from Groq.
 */
async function fetchCategoryAdvice(
  category: AdvisoryCategory,
  ctx: AdvisoryContext
): Promise<AdvisoryItem> {
  const apiKey = getApiKey()
  const prompt = buildPrompt(category, ctx)

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 200,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } }).error?.message ??
        `Groq API request failed (HTTP ${res.status})`
    )
  }

  const json = await res.json()
  const content: string = (json.choices?.[0]?.message?.content as string) ?? ""

  // Extract JSON from the model response (it may include extra whitespace/markdown)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Unexpected response format from Groq for category "${category}"`)
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title?: string
    advice?: string
    urgency?: "high" | "medium" | "low"
  }

  return {
    category,
    title: parsed.title ?? categoryDefaultTitle(category),
    advice: parsed.advice ?? "No advice available at this time.",
    urgency: parsed.urgency,
  }
}

function categoryDefaultTitle(category: AdvisoryCategory): string {
  const titles: Record<AdvisoryCategory, string> = {
    planting: "Planting Advice",
    irrigation: "Irrigation Guidance",
    fertilizer: "Fertilizer Recommendations",
    market: "Market Timing Insight",
    pest: "Pest & Disease Prevention",
  }
  return titles[category]
}

/**
 * Fetch farming advisory for all categories in parallel.
 *
 * @param ctx - Context data (weather, market prices, crop, location, season)
 * @param categories - Which categories to fetch. Defaults to all five.
 * @returns Array of advisory items, one per requested category
 */
export async function fetchFarmingAdvisory(
  ctx: AdvisoryContext,
  categories: AdvisoryCategory[] = ["planting", "irrigation", "fertilizer", "market", "pest"]
): Promise<AdvisoryItem[]> {
  const results = await Promise.allSettled(
    categories.map((cat) => fetchCategoryAdvice(cat, ctx))
  )

  const items: AdvisoryItem[] = []
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(result.value)
    }
    // Silently skip failed categories — caller can check for missing items
  }

  return items
}
