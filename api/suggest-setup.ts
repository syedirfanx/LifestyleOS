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
    const { setupTitle, country = 'United States', currency = 'USD' } = req.body || {};
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
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
      model: 'gemini-2.5-flash',
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
    return res.status(200).json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate setup suggestions' });
  }
}
