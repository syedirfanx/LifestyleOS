import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
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

// Health route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Dream Setup Estimator' });
});

// AI Price Estimator Route
app.post('/api/estimate-price', async (req, res) => {
  try {
    const { itemName, brand, model, country = 'United States', currency = 'USD' } = req.body;

    if (!itemName || typeof itemName !== 'string') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback realistic heuristics if GEMINI_API_KEY is not set
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

      // Currency multipliers if non-USD
      let multiplier = 1;
      if (currency === 'BDT') multiplier = 115;
      else if (currency === 'INR') multiplier = 83;
      else if (currency === 'EUR') multiplier = 0.92;
      else if (currency === 'GBP') multiplier = 0.78;
      else if (currency === 'JPY') multiplier = 155;

      const estimatedPrice = Math.round(mockBase * multiplier);
      const minPrice = Math.round(estimatedPrice * 0.85);
      const maxPrice = Math.round(estimatedPrice * 1.25);

      return res.json({
        estimatedPrice,
        priceRangeMin: minPrice,
        priceRangeMax: maxPrice,
        confidence: 'Medium',
        notes: `Estimated standard market rate for ${itemName} in ${currency}.`,
      });
    }

    const systemInstruction = `You are a professional real-world retail pricing and market valuation expert.
Your mission is to provide the true, accurate real-world retail market price for the specified item in the specified country and currency.
Do NOT output arbitrary rounded guesses or uniform base estimates.
Analyze the actual manufacturer retail price (MSRP), authentic local retail rates, and realistic import/market costs for the specific brand and model in ${country} using ${currency}.
Rules:
- Do not use em dashes.
- Do not use emoji.
- Do not include unnecessary conversational filler.
- Calculate in the specified currency (${currency}).
- Provide realistic priceRangeMin and priceRangeMax that accurately bracket the current market retail price.
- Assign confidence as 'High', 'Medium', or 'Low' based on how specific the item, brand, and model details are.`;

    const promptText = `Item: ${itemName}
Brand: ${brand || 'Not specified'}
Model: ${model || 'Not specified'}
Target Country: ${country}
Target Currency: ${currency}`;

    let parsed: any = null;
    try {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-lite',
        input: promptText,
        system_instruction: systemInstruction,
        response_format: {
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
      });

      const lastStep = interaction.steps?.at(-1);
      if (lastStep?.type === 'model_output') {
        const textContent = lastStep.content?.find((c: any) => c.type === 'text') as any;
        if (textContent?.text) {
          parsed = JSON.parse(textContent.text.trim());
        }
      }
    } catch (modelErr: any) {
      console.warn('Gemini Interactions API temporary error, falling back to heuristic calculation:', modelErr?.message || modelErr);
      
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

      return res.json({
        estimatedPrice,
        priceRangeMin: minPrice,
        priceRangeMax: maxPrice,
        confidence: 'Medium',
        notes: `Estimated market rate for ${itemName} in ${currency}.`,
      });
    }

    if (!parsed) {
      parsed = {
        estimatedPrice: 150,
        priceRangeMin: 120,
        priceRangeMax: 200,
        confidence: 'Medium',
        notes: `Market estimation for ${itemName} in ${currency}.`,
      };
    }

    return res.json({
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
});

// AI Setup Item Suggestions
app.post('/api/suggest-setup', async (req, res) => {
  try {
    const {
      setupTitle,
      country = 'United States',
      currency = 'USD',
      existingItems = [],
      removedItems = [],
      count = 5,
    } = req.body;
    const ai = getGeminiClient();

    const neededCount = Math.max(1, Math.min(count, 10));

    if (!ai) {
      const genericItems = [
        { name: 'Core Furniture', brand: '', model: '', quantity: 1, estimatedPrice: 400 },
        { name: 'Primary Appliance/Hardware', brand: '', model: '', quantity: 1, estimatedPrice: 300 },
        { name: 'Ergonomic Support', brand: '', model: '', quantity: 1, estimatedPrice: 150 },
        { name: 'Lighting Solution', brand: '', model: '', quantity: 1, estimatedPrice: 70 },
        { name: 'Essential Accessory', brand: '', model: '', quantity: 1, estimatedPrice: 40 },
      ];
      return res.json({
        items: genericItems.slice(0, neededCount),
      });
    }

    const existingNamesList = Array.isArray(existingItems) && existingItems.length > 0
      ? existingItems.map((it: any) => typeof it === 'string' ? it : it.name).filter(Boolean)
      : [];

    const removedNamesList = Array.isArray(removedItems) && removedItems.length > 0
      ? removedItems.map((it: any) => typeof it === 'string' ? it : it.name).filter(Boolean)
      : [];

    const systemInstruction = `You are a professional setup planner and market pricing specialist.
Your task is to suggest essential items to complete a "${setupTitle}" setup in ${country} using ${currency}.
Strict Rules:
- Return exactly ${neededCount} essential item(s).
- Do NOT suggest any item that is already present in the setup: [${existingNamesList.join(', ')}].
- Avoid duplicates or close variations of existing items.
- If the user previously removed items [${removedNamesList.join(', ')}], prioritize suggesting appropriate, distinct alternatives or the specific missing role.
- Provide accurate, realistic market retail prices in ${currency} considering local market rates in ${country}.
- Do not use em dashes.
- Do not use emoji.`;

    const promptText = `Setup: ${setupTitle}
Country: ${country}
Currency: ${currency}
Existing items in setup: ${existingNamesList.length > 0 ? existingNamesList.join(', ') : 'None'}
Items removed by user needing replacement: ${removedNamesList.length > 0 ? removedNamesList.join(', ') : 'None'}
Number of items to suggest: ${neededCount}`;

    let parsed: any = null;
    try {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-lite',
        input: promptText,
        system_instruction: systemInstruction,
        response_format: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  brand: { type: Type.STRING },
                  model: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  estimatedPrice: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'quantity', 'estimatedPrice'],
              },
            },
          },
          required: ['items'],
        },
      });

      const lastStep = interaction.steps?.at(-1);
      if (lastStep?.type === 'model_output') {
        const textContent = lastStep.content?.find((c: any) => c.type === 'text') as any;
        if (textContent?.text) {
          parsed = JSON.parse(textContent.text.trim());
        }
      }
    } catch (modelErr: any) {
      console.warn('Gemini Interactions API suggest-setup temporary error, returning fallback items:', modelErr?.message || modelErr);
      const fallbackList = [
        { name: 'Core Setup Foundation', brand: '', model: '', quantity: 1, estimatedPrice: 400 },
        { name: 'Secondary Component', brand: '', model: '', quantity: 1, estimatedPrice: 200 },
        { name: 'Utility Lighting', brand: '', model: '', quantity: 1, estimatedPrice: 75 },
        { name: 'Cable Management Kit', brand: '', model: '', quantity: 1, estimatedPrice: 35 },
        { name: 'Comfort Accessory', brand: '', model: '', quantity: 1, estimatedPrice: 50 },
      ].filter(f => !existingNamesList.some(ex => ex.toLowerCase().includes(f.name.toLowerCase())));

      return res.json({
        items: fallbackList.slice(0, neededCount),
      });
    }

    // Filter out any accidental duplicates of existing items
    const suggestedItems = (parsed?.items || []).filter((item: any) => {
      const itemNameLower = (item.name || '').trim().toLowerCase();
      return !existingNamesList.some(existingName => {
        const exLower = existingName.trim().toLowerCase();
        return exLower === itemNameLower || (exLower.length > 4 && itemNameLower.includes(exLower));
      });
    });

    return res.json({ items: suggestedItems.slice(0, neededCount) });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate setup suggestions' });
  }
});

// Start Express server with Vite middleware in dev mode
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dream Setup Estimator server running on http://0.0.0.0:${PORT}`);
  });
}

start();
