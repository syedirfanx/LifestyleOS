import { Currency } from '../types';

export interface LocationState {
  country: string;
  countryCode: string;
  city?: string;
  currency: Currency;
  isDetecting: boolean;
  source: 'gps' | 'ip' | 'default';
  error?: string;
}

export const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  AE: { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  PK: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
};

export const COMMON_CURRENCIES: Currency[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function getCurrencyForCountryCode(code: string): Currency {
  const upper = code ? code.toUpperCase() : 'BD';
  return (
    COUNTRY_CURRENCY_MAP[upper] || {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
    }
  );
}

export async function detectLocationFromGpsOrIp(): Promise<LocationState> {
  // Try GPS position
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 7000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode with Nominatim OpenStreetMap
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const countryCode = (address.country_code || '').toUpperCase();
        const country = address.country || 'Detected Location';
        const city = address.city || address.town || address.state || '';
        const currency = getCurrencyForCountryCode(countryCode);

        return {
          country,
          countryCode,
          city,
          currency,
          isDetecting: false,
          source: 'gps',
        };
      }
    } catch (e) {
      console.warn('GPS location request failed or was denied, falling back to IP detection');
    }
  }

  // Fallback to IP geolocation
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      const countryCode = (ipData.country_code || 'BD').toUpperCase();
      const country = ipData.country_name || 'Bangladesh';
      const city = ipData.city || '';
      const currency = getCurrencyForCountryCode(countryCode);

      return {
        country,
        countryCode,
        city,
        currency,
        isDetecting: false,
        source: 'ip',
      };
    }
  } catch (e) {
    console.warn('IP location request failed', e);
  }

  // Ultimate fallback
  return {
    country: 'Bangladesh',
    countryCode: 'BD',
    currency: COUNTRY_CURRENCY_MAP['BD'],
    isDetecting: false,
    source: 'default',
  };
}
