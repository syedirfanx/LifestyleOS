import { GoogleGenAI, Type } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export default async function handler(req: any, res: any) {
  // Enable CORS if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemName, brand, model, country = 'United States', currency = 'USD' } = req.body || {};

    if (!itemName || typeof itemName !== 'string') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback realistic heuristics if GEMINI_API_KEY is not configured
      let mockBase = 250;
      const lower = itemName.toLowerCase();
      if (lower.includes('ac') || lower.includes('air conditioner')) mockBase = 650;
      else if (lower.includes('bed')) mockBase = 500;
      else if (lower.includes('mattress')) mockBase = 450;
      else if (lower.includes('sofa') || lower.includes('couch')) mockBase = 800;
      else if (lower.includes('tv') || lower.includes('television')) mockBase = 750;
      else if (lower.includes('monitor')) mockBase = 350;
      else if (lower.includes('chair') || lower.includes('desk')) mockBase = 200;
      else if (lower.includes('camera') || lower.includes('lens')) mockBase = 1200;
      else if (lower.includes('car') || lower.includes('wheel')) mockBase = 400;

      let multiplier = 1;
      if (currency === 'BDT') multiplier = 115;
      else if (currency === 'INR') multiplier = 83;
      else if (currency === 'EUR') multiplier = 0.92;
      else if (currency === 'GBP') multiplier = 0.78;
      else if (currency === 'JPY') multiplier = 155;

      const estimatedPrice = Math.round(mockBase * multiplier);
      const minPrice = Math.round(estimatedPrice * 0.85);
      const maxPrice = Math.round(estimatedPrice * 1.25);

      return res.status(200).json({
        estimatedPrice,
        priceRangeMin: minPrice,
        priceRangeMax: maxPrice,
        confidence: 'Medium',
        notes: `Estimated standard market rate for ${itemName} in ${currency}.`,
      });
    }

    const systemInstruction = `You are an expert market valuation AI for dream setups.
Estimate a realistic market price for the item based on item name, brand, model, country, and currency.
Rules:
- Do not use em dashes.
- Do not use emoji.
- Do not include unnecessary conversational filler.
- Calculate in the specified currency (${currency}).
- Provide realistic priceRangeMin and priceRangeMax.
- Assign confidence as 'High', 'Medium', or 'Low'.`;

    const promptText = `Item: ${itemName}
Brand: ${brand || 'Not specified'}
Model: ${model || 'Not specified'}
Target Country: ${country}
Target Currency: ${currency}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedPrice: { type: Type.NUMBER, description: 'Estimated single unit price in specified currency' },
            priceRangeMin: { type: Type.NUMBER, description: 'Lower bound realistic market price' },
            priceRangeMax: { type: Type.NUMBER, description: 'Upper bound realistic market price' },
            confidence: { type: Type.STRING, description: 'High, Medium, or Low' },
            notes: { type: Type.STRING, description: 'Short note regarding market estimation' },
          },
          required: ['estimatedPrice', 'priceRangeMin', 'priceRangeMax', 'confidence'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.status(200).json({
      estimatedPrice: parsed.estimatedPrice || 100,
      priceRangeMin: parsed.priceRangeMin || 80,
      priceRangeMax: parsed.priceRangeMax || 150,
      confidence: parsed.confidence || 'Medium',
      notes: parsed.notes || '',
    });
  } catch (err: any) {
    console.error('Estimate price error:', err);
    return res.status(500).json({ error: 'Failed to estimate price' });
  }
}
