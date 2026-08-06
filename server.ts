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
      model: 'gemini-3.6-flash',
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
    const { setupTitle, country = 'United States', currency = 'USD' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        items: [
          { name: 'Core Primary Furniture', brand: '', model: '', quantity: 1, estimatedPrice: 500 },
          { name: 'Secondary Unit', brand: '', model: '', quantity: 1, estimatedPrice: 250 },
          { name: 'Ambient Lighting', brand: '', model: '', quantity: 2, estimatedPrice: 80 },
        ],
      });
    }

    const systemInstruction = `You are a dream setup planner. Suggest 5 essential items for a "${setupTitle}" setup.
Provide item name, optional brand, optional model, quantity, and realistic unit price in ${currency}.
Do not use em dashes or emoji.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Suggest 5 items for a ${setupTitle} setup in ${country} using ${currency}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
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
      },
    });

    const parsed = JSON.parse(response.text || '{"items": []}');
    return res.json(parsed);
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
