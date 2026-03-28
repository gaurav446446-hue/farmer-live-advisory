// Comprehensive crop and soil data for CropGuide India

export interface SoilType {
  id: string
  name: string
  nameHi: string
  description: string
  phRange: string
  characteristics: string[]
  regions: string[]
}

export interface CropInfo {
  id: string
  name: string
  nameHi: string
  season: "kharif" | "rabi" | "zaid"
  suitableSoils: string[]
  waterRequirement: "low" | "medium" | "high"
  growingPeriodDays: number
  currentDemandLevel: "low" | "medium" | "high" | "very-high"
  currentSupplyLevel: "shortage" | "balanced" | "surplus"
  pricePerQuintal: number
  priceTrend: "up" | "stable" | "down"
  priceChange: number
  mspPrice: number | null
  idealTempRange: string
  profitabilityScore: number
  tips: string[]
}

export interface GovernmentScheme {
  id: string
  name: string
  nameHi: string
  description: string
  eligibility: string
  benefit: string
  category: "subsidy" | "insurance" | "credit" | "infrastructure" | "training"
  link: string
}

export interface RegionalData {
  state: string
  stateHi: string
  district: string
  dominantCrops: string[]
  totalFarmers: number
  registeredFarmers: number
  cropDistribution: { crop: string; percentage: number }[]
}

export const soilTypes: SoilType[] = [
  {
    id: "alluvial",
    name: "Alluvial Soil",
    nameHi: "जलोढ़ मिट्टी",
    description: "Rich in potash, phosphoric acid, and lime. Found in river plains and deltas.",
    phRange: "6.5 - 8.0",
    characteristics: ["High fertility", "Good water retention", "Rich in minerals", "Sandy to clayey texture"],
    regions: ["Indo-Gangetic Plains", "Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal"],
  },
  {
    id: "black",
    name: "Black Soil (Regur)",
    nameHi: "काली मिट्टी (रेगुर)",
    description: "Rich in calcium, magnesium, potash, and lime. Self-ploughing nature.",
    phRange: "7.2 - 8.5",
    characteristics: ["High moisture retention", "Self-ploughing", "Rich in iron", "Sticky when wet"],
    regions: ["Maharashtra", "Gujarat", "Madhya Pradesh", "Karnataka", "Andhra Pradesh"],
  },
  {
    id: "red",
    name: "Red Soil",
    nameHi: "लाल मिट्टी",
    description: "Rich in iron oxide giving it red color. Generally poor in nitrogen and humus.",
    phRange: "6.0 - 7.0",
    characteristics: ["Well-drained", "Iron-rich", "Low in nitrogen", "Porous and friable"],
    regions: ["Tamil Nadu", "Karnataka", "Jharkhand", "Odisha", "Chhattisgarh"],
  },
  {
    id: "laterite",
    name: "Laterite Soil",
    nameHi: "लैटेराइट मिट्टी",
    description: "Formed in tropical regions with heavy rainfall. Rich in iron and aluminium.",
    phRange: "5.0 - 6.5",
    characteristics: ["Acidic nature", "Poor in nutrients", "High iron content", "Suitable with fertilizers"],
    regions: ["Kerala", "Karnataka", "Tamil Nadu", "Assam", "Meghalaya"],
  },
  {
    id: "sandy",
    name: "Sandy / Desert Soil",
    nameHi: "रेतीली / मरुस्थलीय मिट्टी",
    description: "Low moisture and humus content. Found in arid and semi-arid regions.",
    phRange: "7.0 - 8.5",
    characteristics: ["Low water retention", "High sand content", "Poor in organic matter", "Well aerated"],
    regions: ["Rajasthan", "Gujarat (Kutch)", "Haryana (parts)", "Punjab (parts)"],
  },
  {
    id: "mountain",
    name: "Mountain / Forest Soil",
    nameHi: "पर्वतीय / वन मिट्टी",
    description: "Rich in humus but deficient in potash, phosphorus, and lime.",
    phRange: "5.0 - 6.5",
    characteristics: ["Rich in humus", "Acidic", "Good organic content", "Low mineral content"],
    regions: ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Sikkim", "Arunachal Pradesh"],
  },
]

export const crops: CropInfo[] = [
  // Kharif Crops (July-October)
  {
    id: "rice",
    name: "Rice (Paddy)",
    nameHi: "चावल (धान)",
    season: "kharif",
    suitableSoils: ["alluvial", "black", "laterite"],
    waterRequirement: "high",
    growingPeriodDays: 120,
    currentDemandLevel: "very-high",
    currentSupplyLevel: "balanced",
    pricePerQuintal: 2320,
    priceTrend: "up",
    priceChange: 5.2,
    mspPrice: 2300,
    idealTempRange: "20-35°C",
    profitabilityScore: 78,
    tips: ["Use SRI method for better yield", "Maintain 5cm water level", "Apply fertilizer in 3 splits"],
  },
  {
    id: "wheat",
    name: "Wheat",
    nameHi: "गेहूं",
    season: "rabi",
    suitableSoils: ["alluvial", "black"],
    waterRequirement: "medium",
    growingPeriodDays: 135,
    currentDemandLevel: "very-high",
    currentSupplyLevel: "balanced",
    pricePerQuintal: 2275,
    priceTrend: "stable",
    priceChange: 1.8,
    mspPrice: 2275,
    idealTempRange: "10-25°C",
    profitabilityScore: 75,
    tips: ["Sow by mid-November for best yield", "Irrigate at crown root initiation stage", "Use certified seeds"],
  },
  {
    id: "cotton",
    name: "Cotton",
    nameHi: "कपास",
    season: "kharif",
    suitableSoils: ["black", "alluvial"],
    waterRequirement: "medium",
    growingPeriodDays: 180,
    currentDemandLevel: "high",
    currentSupplyLevel: "surplus",
    pricePerQuintal: 6620,
    priceTrend: "down",
    priceChange: -8.3,
    mspPrice: 6620,
    idealTempRange: "21-30°C",
    profitabilityScore: 60,
    tips: ["Avoid overplanting - surplus expected", "Consider intercropping", "IPM for pest control"],
  },
  {
    id: "soybean",
    name: "Soybean",
    nameHi: "सोयाबीन",
    season: "kharif",
    suitableSoils: ["black", "alluvial", "red"],
    waterRequirement: "medium",
    growingPeriodDays: 100,
    currentDemandLevel: "high",
    currentSupplyLevel: "shortage",
    pricePerQuintal: 4600,
    priceTrend: "up",
    priceChange: 12.5,
    mspPrice: 4600,
    idealTempRange: "20-30°C",
    profitabilityScore: 88,
    tips: ["High demand - good opportunity", "Use Rhizobium culture", "Seed treatment essential"],
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    nameHi: "गन्ना",
    season: "kharif",
    suitableSoils: ["alluvial", "black", "red"],
    waterRequirement: "high",
    growingPeriodDays: 360,
    currentDemandLevel: "high",
    currentSupplyLevel: "surplus",
    pricePerQuintal: 315,
    priceTrend: "down",
    priceChange: -3.1,
    mspPrice: 315,
    idealTempRange: "20-35°C",
    profitabilityScore: 55,
    tips: ["Long duration crop - plan carefully", "Sugar mills may delay payment", "Consider alternative crops"],
  },
  {
    id: "mustard",
    name: "Mustard",
    nameHi: "सरसों",
    season: "rabi",
    suitableSoils: ["alluvial", "sandy", "red"],
    waterRequirement: "low",
    growingPeriodDays: 110,
    currentDemandLevel: "high",
    currentSupplyLevel: "shortage",
    pricePerQuintal: 5650,
    priceTrend: "up",
    priceChange: 15.2,
    mspPrice: 5650,
    idealTempRange: "10-25°C",
    profitabilityScore: 92,
    tips: ["Excellent opportunity - high demand", "Low water requirement", "Good for dryland farming"],
  },
  {
    id: "chickpea",
    name: "Chickpea (Chana)",
    nameHi: "चना",
    season: "rabi",
    suitableSoils: ["black", "alluvial", "red"],
    waterRequirement: "low",
    growingPeriodDays: 100,
    currentDemandLevel: "very-high",
    currentSupplyLevel: "shortage",
    pricePerQuintal: 5440,
    priceTrend: "up",
    priceChange: 8.7,
    mspPrice: 5440,
    idealTempRange: "15-30°C",
    profitabilityScore: 85,
    tips: ["Strong demand for pulses", "Fixes nitrogen in soil", "Good rotation crop after rice"],
  },
  {
    id: "maize",
    name: "Maize (Corn)",
    nameHi: "मक्का",
    season: "kharif",
    suitableSoils: ["alluvial", "red", "black", "sandy"],
    waterRequirement: "medium",
    growingPeriodDays: 95,
    currentDemandLevel: "high",
    currentSupplyLevel: "balanced",
    pricePerQuintal: 2090,
    priceTrend: "stable",
    priceChange: 2.1,
    mspPrice: 2090,
    idealTempRange: "21-27°C",
    profitabilityScore: 72,
    tips: ["Growing demand for animal feed", "Short duration crop", "Good intercrop option"],
  },
  {
    id: "groundnut",
    name: "Groundnut",
    nameHi: "मूंगफली",
    season: "kharif",
    suitableSoils: ["sandy", "red", "alluvial"],
    waterRequirement: "low",
    growingPeriodDays: 110,
    currentDemandLevel: "medium",
    currentSupplyLevel: "balanced",
    pricePerQuintal: 6377,
    priceTrend: "stable",
    priceChange: 0.8,
    mspPrice: 6377,
    idealTempRange: "20-30°C",
    profitabilityScore: 70,
    tips: ["Gypsum application improves yield", "Sandy soil is ideal", "Good oil crop"],
  },
  {
    id: "turmeric",
    name: "Turmeric",
    nameHi: "हल्दी",
    season: "kharif",
    suitableSoils: ["alluvial", "red", "laterite"],
    waterRequirement: "medium",
    growingPeriodDays: 270,
    currentDemandLevel: "high",
    currentSupplyLevel: "shortage",
    pricePerQuintal: 12500,
    priceTrend: "up",
    priceChange: 22.0,
    mspPrice: null,
    idealTempRange: "20-30°C",
    profitabilityScore: 90,
    tips: ["Export demand growing rapidly", "Long duration but high value", "Store properly for best price"],
  },
  {
    id: "millet",
    name: "Millets (Bajra/Jowar)",
    nameHi: "बाजरा / ज्वार",
    season: "kharif",
    suitableSoils: ["sandy", "red", "black", "laterite"],
    waterRequirement: "low",
    growingPeriodDays: 80,
    currentDemandLevel: "high",
    currentSupplyLevel: "shortage",
    pricePerQuintal: 2500,
    priceTrend: "up",
    priceChange: 18.0,
    mspPrice: 2500,
    idealTempRange: "25-35°C",
    profitabilityScore: 82,
    tips: ["International Year of Millets boost", "Low input cost crop", "Drought resistant"],
  },
  {
    id: "tomato",
    name: "Tomato",
    nameHi: "टमाटर",
    season: "zaid",
    suitableSoils: ["alluvial", "red", "black"],
    waterRequirement: "medium",
    growingPeriodDays: 75,
    currentDemandLevel: "very-high",
    currentSupplyLevel: "balanced",
    pricePerQuintal: 2800,
    priceTrend: "up",
    priceChange: 35.0,
    mspPrice: null,
    idealTempRange: "15-30°C",
    profitabilityScore: 75,
    tips: ["Price highly volatile", "Cold storage access important", "Stagger planting for continuous supply"],
  },
]

export const governmentSchemes: GovernmentScheme[] = [
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana (PMFBY)",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    description: "Comprehensive crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities, pests, and diseases.",
    eligibility: "All farmers growing notified crops in notified areas",
    benefit: "Insurance coverage for crop loss with premium of 2% for Kharif and 1.5% for Rabi crops",
    category: "insurance",
    link: "https://pmfby.gov.in",
  },
  {
    id: "pmkisan",
    name: "PM-KISAN",
    nameHi: "पीएम-किसान सम्मान निधि",
    description: "Direct income support of Rs. 6,000 per year in three equal installments to small and marginal farmer families.",
    eligibility: "All farmer families with cultivable land",
    benefit: "Rs. 6,000 per year (Rs. 2,000 every 4 months)",
    category: "subsidy",
    link: "https://pmkisan.gov.in",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    nameHi: "किसान क्रेडिट कार्ड",
    description: "Provides affordable credit to farmers for agriculture and allied activities at subsidized interest rates.",
    eligibility: "All farmers, sharecroppers, tenant farmers, and SHGs",
    benefit: "Credit at 4% interest rate (with prompt repayment) up to Rs. 3 lakh",
    category: "credit",
    link: "https://www.pmkisan.gov.in/KCC",
  },
  {
    id: "enam",
    name: "e-NAM (National Agriculture Market)",
    nameHi: "ई-नाम (राष्ट्रीय कृषि बाज़ार)",
    description: "Online trading platform for agriculture commodities providing better price discovery and transparent auction process.",
    eligibility: "All farmers with Aadhaar and bank account",
    benefit: "Access to nationwide market, better price realization, and transparent trading",
    category: "infrastructure",
    link: "https://enam.gov.in",
  },
  {
    id: "pmkmy",
    name: "PM Krishi Sinchai Yojana",
    nameHi: "प्रधानमंत्री कृषि सिंचाई योजना",
    description: "Ensures access to protective irrigation for every farm (Har Khet Ko Paani) and efficient water use (Per Drop More Crop).",
    eligibility: "All farmers, priority to small and marginal farmers",
    benefit: "55% subsidy for small farmers, 45% for others on micro-irrigation systems",
    category: "infrastructure",
    link: "https://pmksy.gov.in",
  },
  {
    id: "soilhealth",
    name: "Soil Health Card Scheme",
    nameHi: "मृदा स्वास्थ्य कार्ड योजना",
    description: "Provides soil health cards to farmers carrying crop-wise recommendations of nutrients and fertilizers.",
    eligibility: "All farmers",
    benefit: "Free soil testing and crop-specific nutrient recommendations",
    category: "training",
    link: "https://soilhealth.dac.gov.in",
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana",
    nameHi: "परंपरागत कृषि विकास योजना",
    description: "Promotes organic farming through adoption of organic village clusters with PGS certification.",
    eligibility: "Groups of 50+ farmers in a cluster of 50 acres",
    benefit: "Rs. 50,000 per hectare for 3 years for organic farming inputs and certification",
    category: "subsidy",
    link: "https://pgsindia-ncof.gov.in",
  },
  {
    id: "agriinfra",
    name: "Agriculture Infrastructure Fund",
    nameHi: "कृषि अवसंरचना कोष",
    description: "Financing facility for post-harvest management infrastructure and community farming assets.",
    eligibility: "Farmers, FPOs, PACS, agri-entrepreneurs",
    benefit: "3% interest subvention on loans up to Rs. 2 crore with credit guarantee",
    category: "infrastructure",
    link: "https://agriinfra.dac.gov.in",
  },
]

export const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

// Simulated regional data generation
export function getRegionalData(state: string): RegionalData {
  const stateData: Record<string, RegionalData> = {
    "Uttar Pradesh": {
      state: "Uttar Pradesh",
      stateHi: "उत्तर प्रदेश",
      district: "Lucknow",
      dominantCrops: ["wheat", "rice", "sugarcane", "mustard"],
      totalFarmers: 2340000,
      registeredFarmers: 1560000,
      cropDistribution: [
        { crop: "Wheat", percentage: 35 },
        { crop: "Rice", percentage: 28 },
        { crop: "Sugarcane", percentage: 20 },
        { crop: "Mustard", percentage: 10 },
        { crop: "Others", percentage: 7 },
      ],
    },
    "Maharashtra": {
      state: "Maharashtra",
      stateHi: "महाराष्ट्र",
      district: "Pune",
      dominantCrops: ["cotton", "soybean", "sugarcane", "turmeric"],
      totalFarmers: 1520000,
      registeredFarmers: 980000,
      cropDistribution: [
        { crop: "Cotton", percentage: 30 },
        { crop: "Soybean", percentage: 25 },
        { crop: "Sugarcane", percentage: 22 },
        { crop: "Turmeric", percentage: 12 },
        { crop: "Others", percentage: 11 },
      ],
    },
    "Punjab": {
      state: "Punjab",
      stateHi: "पंजाब",
      district: "Ludhiana",
      dominantCrops: ["wheat", "rice", "cotton", "maize"],
      totalFarmers: 1090000,
      registeredFarmers: 890000,
      cropDistribution: [
        { crop: "Wheat", percentage: 42 },
        { crop: "Rice", percentage: 38 },
        { crop: "Cotton", percentage: 10 },
        { crop: "Maize", percentage: 6 },
        { crop: "Others", percentage: 4 },
      ],
    },
  }

  return stateData[state] || {
    state,
    stateHi: state,
    district: "N/A",
    dominantCrops: ["rice", "wheat"],
    totalFarmers: 800000,
    registeredFarmers: 450000,
    cropDistribution: [
      { crop: "Rice", percentage: 30 },
      { crop: "Wheat", percentage: 25 },
      { crop: "Pulses", percentage: 20 },
      { crop: "Oilseeds", percentage: 15 },
      { crop: "Others", percentage: 10 },
    ],
  }
}

export function getRecommendedCrops(soilId: string, waterAvailability: "low" | "medium" | "high"): CropInfo[] {
  return crops
    .filter((crop) => {
      const soilMatch = crop.suitableSoils.includes(soilId)
      const waterMatch =
        waterAvailability === "high" ||
        (waterAvailability === "medium" && crop.waterRequirement !== "high") ||
        (waterAvailability === "low" && crop.waterRequirement === "low")
      return soilMatch && waterMatch
    })
    .sort((a, b) => b.profitabilityScore - a.profitabilityScore)
}

export function getSupplyDemandAlert(crop: CropInfo): {
  level: "safe" | "caution" | "warning"
  message: string
} {
  if (crop.currentSupplyLevel === "surplus") {
    return {
      level: "warning",
      message: `${crop.name} is already in surplus. Growing more may lead to price drops. Consider alternatives.`,
    }
  }
  if (crop.currentSupplyLevel === "shortage") {
    return {
      level: "safe",
      message: `${crop.name} has high demand with low supply. Great opportunity for good prices.`,
    }
  }
  return {
    level: "caution",
    message: `${crop.name} supply is balanced. Monitor regional planting trends before deciding.`,
  }
}
