// Mock API Service - Simulates bank backend for demo purposes
import { PaymentSDKConfig, PaymentSession, PaymentMethod, SavedCard, PaymentResult, PaymentOrder } from '@/types/payment';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockApiService {
  async initializeSession(config: PaymentSDKConfig): Promise<PaymentSession> {
    await delay(800); // Simulate network latency
    
    return {
      sessionId: `session_${Date.now()}`,
      publicKey: config.publicKey,
      ttl: 3600,
      policyFlags: {
        enableSaveCard: true,
        enable3DS: true,
        enableQuickCheckout: true,
      },
    };
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await delay(600);
    
    return [
      {
        id: 'card',
        type: 'card',
        name: 'Cards',
        icon: '💳',
        enabled: true,
        description: 'Credit/Debit Cards with 3DS',
      },
      {
        id: 'upi',
        type: 'upi',
        name: 'UPI',
        icon: '📱',
        enabled: true,
        description: 'Pay using UPI apps',
      },
      {
        id: 'netbanking',
        type: 'netbanking',
        name: 'Net Banking',
        icon: '🏦',
        enabled: true,
        description: 'Internet Banking',
      },
      {
        id: 'wallet',
        type: 'wallet',
        name: 'Wallets',
        icon: '👛',
        enabled: true,
        description: 'Digital Wallets',
      },
      {
        id: 'bnpl',
        type: 'bnpl',
        name: 'Buy Now, Pay Later',
        icon: '⏳',
        enabled: true,
        description: 'EMI & BNPL Options',
      },
    ];
  }

  async getSavedCards(customerId: string): Promise<SavedCard[]> {
    await delay(400);
    
    return [
      {
        tokenId: 'token_1234',
        last4: '4242',
        brand: 'visa',
        expiryMonth: '12',
        expiryYear: '2027',
        holderName: 'John Doe',
      },
      {
        tokenId: 'token_5678',
        last4: '1111',
        brand: 'mastercard',
        expiryMonth: '08',
        expiryYear: '2026',
        holderName: 'John Doe',
      },
    ];
  }

  async processPayment(data: {
    order: PaymentOrder;
    method: PaymentMethod;
    paymentData: any;
  }): Promise<PaymentResult> {
    await delay(2000); // Simulate payment processing time
    
    // Simulate different outcomes based on payment method
    const successRate = Math.random();
    
    if (successRate > 0.85) {
      // Simulate payment failure
      throw new Error('Payment failed');
    } else if (successRate > 0.7 && data.method.type === 'card') {
      // Simulate 3DS challenge requirement
      return {
        paymentId: `pay_${Date.now()}`,
        status: 'requires_action',
        amount: data.order.amount,
        currency: data.order.currency,
        paymentMethod: data.method.name,
        message: '3DS authentication required',
      };
    } else {
      // Simulate successful payment
      return {
        paymentId: `pay_${Date.now()}`,
        status: 'success',
        amount: data.order.amount,
        currency: data.order.currency,
        paymentMethod: data.method.name,
        message: 'Payment completed successfully',
      };
    }
  }

  async createHostedCardCapture(): Promise<{ hccUrl: string; challengeToken: string }> {
    await delay(500);
    
    return {
      hccUrl: 'https://secure.bankdomain.com/hcc/capture',
      challengeToken: `challenge_${Date.now()}`,
    };
  }

  async getNetBankingBanks(): Promise<Array<{ code: string; name: string; available: boolean }>> {
    await delay(300);
    
    return [
      { code: 'HDFC', name: 'HDFC Bank', available: true },
      { code: 'ICICI', name: 'ICICI Bank', available: true },
      { code: 'SBI', name: 'State Bank of India', available: true },
      { code: 'AXIS', name: 'Axis Bank', available: true },
      { code: 'KOTAK', name: 'Kotak Mahindra Bank', available: false },
    ];
  }

  async getWalletProviders(): Promise<Array<{ id: string; name: string; available: boolean }>> {
    await delay(300);
    
    return [
      { id: 'paytm', name: 'Paytm', available: true },
      { id: 'phonepe', name: 'PhonePe', available: true },
      { id: 'googlepay', name: 'Google Pay', available: true },
      { id: 'amazonpay', name: 'Amazon Pay', available: false },
    ];
  }

  async getBNPLProviders(): Promise<Array<{ id: string; name: string; tenures: number[]; rates: number[] }>> {
    await delay(400);
    
    return [
      { id: 'zest', name: 'ZestMoney', tenures: [3, 6, 9], rates: [0, 2, 4] },
      { id: 'lazypay', name: 'LazyPay', tenures: [1], rates: [0] },
      { id: 'simpl', name: 'Simpl', tenures: [3, 6], rates: [1, 3] },
    ];
  }
}

export const mockApiService = new MockApiService();