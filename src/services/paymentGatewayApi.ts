// Payment Gateway API Mock Service - Simulates payment gateway backend
import { delay } from '@/utils/delay';

export interface PaymentGatewayConfig {
  merchantId: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  returnUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
  paymentMethod?: {
    type: 'card' | 'upi' | 'netbanking' | 'wallet';
    details?: any;
  };
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  gatewayReference?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified, full refund if not
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface PaymentVerificationRequest {
  paymentId: string;
  orderId?: string;
}

export interface CardTokenizationRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  customerId?: string;
}

export interface CardTokenResponse {
  tokenId: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  isActive: boolean;
  createdAt: string;
}

class PaymentGatewayApiService {
  private config: PaymentGatewayConfig;
  private payments: Map<string, PaymentResponse> = new Map();
  private refunds: Map<string, RefundResponse> = new Map();
  private cardTokens: Map<string, CardTokenResponse> = new Map();

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  // Initialize payment
  async initiatePayment(request: PaymentRequest): Promise<{ paymentId: string; checkoutUrl: string; paymentData: any }> {
    await delay(800); // Simulate gateway processing

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const gatewayReference = `gw_${Date.now()}`;

    // Validate request
    if (!this.config.supportedCurrencies.includes(request.currency)) {
      throw new Error(`Currency ${request.currency} is not supported`);
    }

    if (request.amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }

    // Create payment record
    const payment: PaymentResponse = {
      paymentId,
      orderId: request.orderId,
      amount: request.amount,
      currency: request.currency,
      status: 'pending',
      paymentMethod: request.paymentMethod?.type || 'card',
      gatewayReference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: request.metadata,
    };

    this.payments.set(paymentId, payment);

    // Generate checkout URL (in real implementation, this would be the gateway's hosted checkout page)
    const checkoutUrl = `${window.location.origin}/payment-gateway/checkout?paymentId=${paymentId}`;

    console.log('Payment Gateway API: Payment initiated', payment);

    return {
      paymentId,
      checkoutUrl,
      paymentData: {
        gatewayReference,
        sessionToken: `session_${Date.now()}`,
      },
    };
  }

  // Process payment (simulate completion)
  async processPayment(paymentId: string, paymentDetails?: any): Promise<PaymentResponse> {
    await delay(2000); // Simulate payment processing time

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new Error(`Payment is already ${payment.status}`);
    }

    // Simulate different outcomes based on payment method and amount
    const successRate = Math.random();
    let newStatus: PaymentResponse['status'] = 'completed';

    if (successRate > 0.9) {
      newStatus = 'failed';
    } else if (successRate > 0.8) {
      newStatus = 'cancelled';
    }

    // Update payment
    payment.status = newStatus;
    payment.transactionId = `txn_${Date.now()}`;
    payment.updatedAt = new Date().toISOString();

    this.payments.set(paymentId, payment);

    console.log('Payment Gateway API: Payment processed', payment);
    return { ...payment };
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    await delay(300);

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    return { ...payment };
  }

  // Verify payment
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentResponse> {
    await delay(400);

    let payment: PaymentResponse | undefined;

    if (request.paymentId) {
      payment = this.payments.get(request.paymentId);
    } else if (request.orderId) {
      // Find payment by order ID
      for (const p of this.payments.values()) {
        if (p.orderId === request.orderId) {
          payment = p;
          break;
        }
      }
    }

    if (!payment) {
      throw new Error('Payment not found');
    }

    return { ...payment };
  }

  // Refund payment
  async refundPayment(request: RefundRequest): Promise<RefundResponse> {
    await delay(1000);

    const payment = this.payments.get(request.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new Error('Only completed payments can be refunded');
    }

    const refundAmount = request.amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const refund: RefundResponse = {
      refundId,
      paymentId: request.paymentId,
      amount: refundAmount,
      currency: payment.currency,
      status: 'completed', // Simulate immediate refund for demo
      reason: request.reason,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    this.refunds.set(refundId, refund);

    // Update payment status if full refund
    if (refundAmount === payment.amount) {
      payment.status = 'refunded';
      payment.updatedAt = new Date().toISOString();
      this.payments.set(request.paymentId, payment);
    }

    console.log('Payment Gateway API: Refund processed', refund);
    return refund;
  }

  // Tokenize card
  async tokenizeCard(request: CardTokenizationRequest): Promise<CardTokenResponse> {
    await delay(1200); // Simulate tokenization process

    // Validate card details
    if (!this.isValidCardNumber(request.cardNumber)) {
      throw new Error('Invalid card number');
    }

    if (!this.isValidExpiry(request.expiryMonth, request.expiryYear)) {
      throw new Error('Invalid expiry date');
    }

    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const last4 = request.cardNumber.slice(-4);
    const brand = this.detectCardBrand(request.cardNumber);

    const token: CardTokenResponse = {
      tokenId,
      last4,
      brand,
      expiryMonth: request.expiryMonth,
      expiryYear: request.expiryYear,
      cardholderName: request.cardholderName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.cardTokens.set(tokenId, token);

    console.log('Payment Gateway API: Card tokenized', { tokenId, last4, brand });
    return token;
  }

  // Get card token details
  async getCardToken(tokenId: string): Promise<CardTokenResponse | null> {
    await delay(200);
    return this.cardTokens.get(tokenId) || null;
  }

  // Delete card token
  async deleteCardToken(tokenId: string): Promise<{ success: boolean; message: string }> {
    await delay(300);

    const token = this.cardTokens.get(tokenId);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    this.cardTokens.delete(tokenId);

    console.log('Payment Gateway API: Card token deleted', tokenId);
    return { success: true, message: 'Card token deleted successfully' };
  }

  // Get customer payment methods (saved cards)
  async getCustomerPaymentMethods(customerId: string): Promise<CardTokenResponse[]> {
    await delay(400);

    return Array.from(this.cardTokens.values()).filter(token =>
      token.isActive // In real implementation, filter by customerId
    );
  }

  // Process recurring payment
  async processRecurringPayment(tokenId: string, amount: number, currency: string, orderId: string): Promise<PaymentResponse> {
    await delay(1500);

    const token = this.cardTokens.get(tokenId);
    if (!token) {
      throw new Error('Card token not found');
    }

    if (!token.isActive) {
      throw new Error('Card token is not active');
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment: PaymentResponse = {
      paymentId,
      orderId,
      amount,
      currency,
      status: 'completed', // Assume success for recurring payments
      paymentMethod: 'card',
      transactionId: `txn_${Date.now()}`,
      gatewayReference: `gw_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.payments.set(paymentId, payment);

    console.log('Payment Gateway API: Recurring payment processed', payment);
    return payment;
  }

  // Helper methods
  private isValidCardNumber(cardNumber: string): boolean {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  private isValidExpiry(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear) {
      return false;
    }

    if (expYear === currentYear && expMonth < currentMonth) {
      return false;
    }

    return expMonth >= 1 && expMonth <= 12;
  }

  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');

    if (number.startsWith('4')) {
      return 'visa';
    } else if (number.startsWith('5') || number.startsWith('2')) {
      return 'mastercard';
    } else if (number.startsWith('3')) {
      return 'amex';
    } else if (number.startsWith('6')) {
      return 'discover';
    }

    return 'unknown';
  }
}

// Default configuration
const defaultConfig: PaymentGatewayConfig = {
  merchantId: 'merchant_12345',
  apiKey: 'api_key_abcdef123456',
  environment: 'sandbox',
  supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
  supportedPaymentMethods: ['card', 'upi', 'netbanking', 'wallet'],
};

export const paymentGatewayApiService = new PaymentGatewayApiService(defaultConfig);
