import { Setup, SetupItem, Currency } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (BDT)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)' },
];

export const INITIAL_SETUPS: Setup[] = [];

export const INITIAL_ITEMS: SetupItem[] = [];
