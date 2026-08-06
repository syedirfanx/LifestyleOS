export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface SetupItem {
  id: string;
  setupId: string;
  name: string;
  brand?: string;
  model?: string;
  quantity: number;
  estimatedPrice: number;
  isAiEstimated?: boolean;
  priceRangeMin?: number;
  priceRangeMax?: number;
  confidence?: ConfidenceLevel;
  notes?: string;
  category?: string;
}

export interface Setup {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  description?: string;
  icon: string;
  createdAt: string;
}

export interface PriceEstimateRequest {
  itemName: string;
  brand?: string;
  model?: string;
  quantity?: number;
  country?: string;
  currency?: string;
}

export interface PriceEstimateResult {
  estimatedPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  confidence: ConfidenceLevel;
  notes?: string;
}
