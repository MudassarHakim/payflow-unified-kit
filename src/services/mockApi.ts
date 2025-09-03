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
    console.log('mockApiService.getPaymentMethods called');
    await delay(600);
    
    const methods: PaymentMethod[] = [
      {
        id: 'card',
        type: 'card' as const,
        name: 'Cards',
        icon: '💳',
        enabled: true,
        description: 'Credit/Debit Cards with 3DS',
      },
      {
        id: 'upi',
        type: 'upi' as const,
        name: 'UPI',
        icon: '📱',
        enabled: true,
        description: 'Pay using UPI apps',
      },
      {
        id: 'netbanking',
        type: 'netbanking' as const,
        name: 'Net Banking',
        icon: '🏦',
        enabled: true,
        description: 'Internet Banking',
      },
      {
        id: 'wallet',
        type: 'wallet' as const,
        name: 'Wallets',
        icon: '👛',
        enabled: true,
        description: 'Digital Wallets',
      },
      {
        id: 'bnpl',
        type: 'bnpl' as const,
        name: 'Buy Now, Pay Later',
        icon: '⏳',
        enabled: true,
        description: 'EMI & BNPL Options',
      },
    ];
    
    console.log('mockApiService.getPaymentMethods returning:', methods);
    return methods;
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

  async getNetBankingBanks(searchTerm?: string): Promise<Array<{ code: string; name: string; available: boolean }>> {
    await delay(300);
    
    const allBanks = [
      { code: 'HDFC', name: 'HDFC Bank', available: true },
      { code: 'ICICI', name: 'ICICI Bank', available: true },
      { code: 'SBI', name: 'State Bank of India', available: true },
      { code: 'AXIS', name: 'Axis Bank', available: true },
      { code: 'KOTAK', name: 'Kotak Mahindra Bank', available: false },
      { code: 'BOB', name: 'Bank of Baroda', available: true },
      { code: 'PNB', name: 'Punjab National Bank', available: true },
      { code: 'CANARA', name: 'Canara Bank', available: true },
      { code: 'BOI', name: 'Bank of India', available: false },
      { code: 'UNION', name: 'Union Bank of India', available: true },
      { code: 'IDBI', name: 'IDBI Bank', available: true },
      { code: 'INDUSIND', name: 'IndusInd Bank', available: true },
      { code: 'YES', name: 'Yes Bank', available: false },
      { code: 'FEDERAL', name: 'Federal Bank', available: true },
      { code: 'IDFC', name: 'IDFC First Bank', available: true },
      { code: 'RBL', name: 'RBL Bank', available: true },
      { code: 'KARNATAKA', name: 'Karnataka Bank', available: false },
      { code: 'SOUTH', name: 'South Indian Bank', available: true },
      { code: 'BANDHAN', name: 'Bandhan Bank', available: true },
      { code: 'DEUTSCHE', name: 'Deutsche Bank', available: false },
    ];
    
    if (!searchTerm) {
      return allBanks;
    }
    
    // Filter banks based on search term
    return allBanks.filter(bank => 
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bank.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
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