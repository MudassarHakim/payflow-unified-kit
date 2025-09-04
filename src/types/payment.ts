// Payment SDK Types - Following the PRD requirements

export interface PaymentSDKConfig {
  merchantId: string;
  publicKey: string;
  environment: 'sandbox' | 'production';
  theme?: PaymentTheme;
}

export interface PaymentTheme {
  primaryColor?: string;
  merchantLogo?: string;
  borderRadius?: 'sm' | 'md' | 'lg';
  mode?: 'light' | 'dark';
}

export interface PaymentSession {
  sessionId: string;
  publicKey: string;
  ttl: number;
  policyFlags: {
    enableSaveCard: boolean;
    enable3DS: boolean;
    enableQuickCheckout: boolean;
  };
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'bnpl';
  name: string;
  icon: string;
  enabled: boolean;
  description?: string;
}

export interface SavedCard {
  tokenId: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'rupay' | 'amex';
  expiryMonth: string;
  expiryYear: string;
  holderName?: string;
}

export interface PaymentResult {
  paymentId: string;
  status: 'success' | 'failed' | 'pending' | 'requires_action';
  amount: number;
  currency: string;
  paymentMethod: string;
  message?: string;
  error?: PaymentError;
}

export interface PaymentError {
  code: string;
  message: string;
  category: 'network' | 'issuer' | 'auth' | 'risk' | 'validation';
  retryable: boolean;
}

export interface UPIPaymentData {
  vpa?: string;
  intent?: boolean;
  collectRequest?: {
    vpa: string;
    expiryMinutes: number;
  };
}

export interface NetBankingData {
  bankCode: string;
  bankName: string;
}

export interface WalletData {
  walletProvider: string;
  walletId?: string;
}

export interface BNPLData {
  provider: string;
  tenure: number;
  interestRate: number;
}

export interface EMIProvider {
  id: string;
  name: string;
  logo: string;
  minAmount: number;
  maxAmount: number;
  supportedTenures: number[];
  interestRates: Record<number, number>; // tenure -> interest rate
  processingFee?: number;
  enabled: boolean;
}

export interface EMIPlan {
  providerId: string;
  providerName: string;
  tenure: number; // in months
  interestRate: number;
  monthlyAmount: number;
  totalAmount: number;
  processingFee: number;
  totalInterest: number;
  emiAmount: number;
}

export interface EMIData {
  providerId: string;
  planId: string;
  tenure: number;
  emiAmount: number;
  totalAmount: number;
  interestRate: number;
  processingFee: number;
}

export interface EMICalculationRequest {
  amount: number;
  tenure: number;
  interestRate: number;
  processingFee?: number;
}

export interface EMICalculationResponse {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
  processingFee: number;
  emiBreakdown: {
    principal: number;
    interest: number;
    processingFee: number;
  };
}

export type CheckoutMode = 'quick' | 'full';

export interface CheckoutState {
  mode: CheckoutMode;
  currentStep: 'methods' | 'payment' | 'processing' | 'result';
  selectedMethod?: PaymentMethod;
  savedCards: SavedCard[];
  loading: boolean;
  error?: PaymentError;
}