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
    const {
      setupTitle,
      country = 'United States',
      currency = 'USD',
      existingItems = [],
      removedItems = [],
      count = 5,
    } = req.body || {};
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
      return res.status(200).json({
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
      console.warn('Vercel API suggest-setup model error, returning fallback items:', modelErr?.message || modelErr);
      const fallbackList = [
        { name: 'Core Setup Foundation', brand: '', model: '', quantity: 1, estimatedPrice: 400 },
        { name: 'Secondary Component', brand: '', model: '', quantity: 1, estimatedPrice: 200 },
        { name: 'Utility Lighting', brand: '', model: '', quantity: 1, estimatedPrice: 75 },
        { name: 'Cable Management Kit', brand: '', model: '', quantity: 1, estimatedPrice: 35 },
        { name: 'Comfort Accessory', brand: '', model: '', quantity: 1, estimatedPrice: 50 },
      ].filter(f => !existingNamesList.some(ex => ex.toLowerCase().includes(f.name.toLowerCase())));

      return res.status(200).json({
        items: fallbackList.slice(0, neededCount),
      });
    }

    const suggestedItems = (parsed?.items || []).filter((item: any) => {
      const itemNameLower = (item.name || '').trim().toLowerCase();
      return !existingNamesList.some(existingName => {
        const exLower = existingName.trim().toLowerCase();
        return exLower === itemNameLower || (exLower.length > 4 && itemNameLower.includes(exLower));
      });
    });

    return res.status(200).json({ items: suggestedItems.slice(0, neededCount) });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate setup suggestions' });
  }
}
