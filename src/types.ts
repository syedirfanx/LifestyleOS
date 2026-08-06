export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type ItemStatus = 'Planning' | 'Wishlist' | 'Ready to Buy' | 'Purchased' | 'Sold' | 'Removed' | 'Active' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'EMI' | 'Loan';
export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';

export interface PaymentDetails {
  // EMI
  purchasePrice?: number;
  downPayment?: number;
  remainingAmount?: number;
  interestRate?: number;
  numberOfInstallments?: number;
  monthlyEMI?: number;
  emiStartDate?: string;
  firstPaymentDate?: string;
  isMonthlyEmiManual?: boolean;

  // Loan
  loanAmount?: number;
  monthlyPayment?: number; 
  startDate?: string;
  endDate?: string;

  // Subscription
  monthlyCost?: number;
  billingCycle?: BillingCycle;
  nextBillingDate?: string;
  billingDay?: number;
  autoRenew?: boolean;

  // Rent
  securityDeposit?: number;

  // Other
  customDetails?: string;
}

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
  status?: ItemStatus;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
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
