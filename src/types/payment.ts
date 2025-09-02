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

export type CheckoutMode = 'quick' | 'full';

export interface CheckoutState {
  mode: CheckoutMode;
  currentStep: 'methods' | 'payment' | 'processing' | 'result';
  selectedMethod?: PaymentMethod;
  savedCards: SavedCard[];
  loading: boolean;
  error?: PaymentError;
}