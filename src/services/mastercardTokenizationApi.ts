// Mastercard Tokenization API Mock Service - Simulates Mastercard Digital Enablement Service (MDES)
import { delay } from '@/utils/delay';

export interface TokenizationRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerId?: string;
  merchantId: string;
  tokenType: 'CLOUD' | 'EMBEDDED_SE' | 'HOSTED_SE';
  productConfig?: {
    contactlessEnabled: boolean;
    internationalEnabled: boolean;
    domesticEnabled: boolean;
    transactionLimits?: {
      daily: number;
      monthly: number;
      perTransaction: number;
    };
  };
}

export interface TokenizationResponse {
  tokenId: string;
  tokenUniqueReference: string;
  tokenStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  tokenInfo: {
    tokenPanSuffix: string;
    brandAssetId: string;
    issuerName: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
  };
  productConfig: {
    contactlessEnabled: boolean;
    internationalEnabled: boolean;
    domesticEnabled: boolean;
    transactionLimits: {
      daily: number;
      monthly: number;
      perTransaction: number;
    };
  };
  tokenCreatedDate: string;
  tokenLastUpdatedDate: string;
  paymentAppInstanceId?: string;
}

export interface TokenUpdateRequest {
  tokenId: string;
  action: 'SUSPEND' | 'RESUME' | 'DELETE';
  reason?: string;
}

export interface TokenLimitUpdateRequest {
  tokenId: string;
  transactionLimits: {
    daily?: number;
    monthly?: number;
    perTransaction?: number;
  };
}

export interface TokenTransactionRequest {
  tokenId: string;
  amount: number;
  currency: string;
  merchantCategoryCode?: string;
  merchantName?: string;
  merchantCity?: string;
  merchantCountry?: string;
  transactionType: 'PURCHASE' | 'ATM' | 'CASH_ADVANCE';
  isInternational: boolean;
}

export interface TokenTransactionResponse {
  transactionId: string;
  tokenId: string;
  amount: number;
  currency: string;
  status: 'APPROVED' | 'DECLINED' | 'PENDING';
  responseCode: string;
  authCode?: string;
  declineReason?: string;
  processingDate: string;
}

export interface TokenNotification {
  notificationId: string;
  tokenId: string;
  eventType: 'TOKEN_CREATED' | 'TOKEN_UPDATED' | 'TOKEN_DELETED' | 'TRANSACTION' | 'SUSPICIOUS_ACTIVITY';
  eventData: any;
  timestamp: string;
}

class MastercardTokenizationApiService {
  private tokens: Map<string, TokenizationResponse> = new Map();
  private transactions: Map<string, TokenTransactionResponse> = new Map();
  private notifications: TokenNotification[] = [];

  // Tokenize card
  async tokenizeCard(request: TokenizationRequest): Promise<TokenizationResponse> {
    await delay(1500); // Simulate tokenization process

    // Validate card details
    if (!this.isValidCardNumber(request.cardNumber)) {
      throw new Error('Invalid card number');
    }

    if (!this.isValidExpiry(request.expiryMonth, request.expiryYear)) {
      throw new Error('Invalid expiry date');
    }

    const tokenId = `mct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenUniqueReference = `TUR_${Date.now()}`;

    const token: TokenizationResponse = {
      tokenId,
      tokenUniqueReference,
      tokenStatus: 'ACTIVE',
      tokenInfo: {
        tokenPanSuffix: request.cardNumber.slice(-4),
        brandAssetId: this.detectCardBrand(request.cardNumber),
        issuerName: 'Mock Bank',
        cardholderName: request.cardholderName,
        expiryMonth: request.expiryMonth,
        expiryYear: request.expiryYear,
      },
      productConfig: {
        contactlessEnabled: request.productConfig?.contactlessEnabled ?? true,
        internationalEnabled: request.productConfig?.internationalEnabled ?? true,
        domesticEnabled: request.productConfig?.domesticEnabled ?? true,
        transactionLimits: {
          daily: request.productConfig?.transactionLimits?.daily ?? 50000,
          monthly: request.productConfig?.transactionLimits?.monthly ?? 200000,
          perTransaction: request.productConfig?.transactionLimits?.perTransaction ?? 10000,
        },
      },
      tokenCreatedDate: new Date().toISOString(),
      tokenLastUpdatedDate: new Date().toISOString(),
      paymentAppInstanceId: request.tokenType === 'CLOUD' ? `pai_${Date.now()}` : undefined,
    };

    this.tokens.set(tokenId, token);

    // Create notification
    this.createNotification({
      notificationId: `notif_${Date.now()}`,
      tokenId,
      eventType: 'TOKEN_CREATED',
      eventData: { tokenUniqueReference },
      timestamp: new Date().toISOString(),
    });

    console.log('Mastercard Tokenization API: Card tokenized', token);
    return token;
  }

  // Get token details
  async getToken(tokenId: string): Promise<TokenizationResponse | null> {
    await delay(300);
    return this.tokens.get(tokenId) || null;
  }

  // Update token
  async updateToken(request: TokenUpdateRequest): Promise<{ success: boolean; message: string }> {
    await delay(800);

    const token = this.tokens.get(request.tokenId);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    switch (request.action) {
      case 'SUSPEND':
        token.tokenStatus = 'SUSPENDED';
        break;
      case 'RESUME':
        token.tokenStatus = 'ACTIVE';
        break;
      case 'DELETE':
        token.tokenStatus = 'DEACTIVATED';
        break;
    }

    token.tokenLastUpdatedDate = new Date().toISOString();
    this.tokens.set(request.tokenId, token);

    // Create notification
    this.createNotification({
      notificationId: `notif_${Date.now()}`,
      tokenId: request.tokenId,
      eventType: 'TOKEN_UPDATED',
      eventData: { action: request.action, reason: request.reason },
      timestamp: new Date().toISOString(),
    });

    console.log('Mastercard Tokenization API: Token updated', request);
    return { success: true, message: `Token ${request.action.toLowerCase()} successfully` };
  }

  // Update token limits
  async updateTokenLimits(request: TokenLimitUpdateRequest): Promise<{ success: boolean; message: string }> {
    await delay(600);

    const token = this.tokens.get(request.tokenId);
    if (!token) {
      return { success: false, message: 'Token not found' };
    }

    if (request.transactionLimits.daily !== undefined) {
      token.productConfig.transactionLimits.daily = request.transactionLimits.daily;
    }
    if (request.transactionLimits.monthly !== undefined) {
      token.productConfig.transactionLimits.monthly = request.transactionLimits.monthly;
    }
    if (request.transactionLimits.perTransaction !== undefined) {
      token.productConfig.transactionLimits.perTransaction = request.transactionLimits.perTransaction;
    }

    token.tokenLastUpdatedDate = new Date().toISOString();
    this.tokens.set(request.tokenId, token);

    console.log('Mastercard Tokenization API: Token limits updated', request);
    return { success: true, message: 'Token limits updated successfully' };
  }

  // Process token transaction
  async processTokenTransaction(request: TokenTransactionRequest): Promise<TokenTransactionResponse> {
    await delay(1000); // Simulate transaction processing

    const token = this.tokens.get(request.tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    if (token.tokenStatus !== 'ACTIVE') {
      throw new Error('Token is not active');
    }

    // Check transaction limits
    const limits = token.productConfig.transactionLimits;
    if (request.amount > limits.perTransaction) {
      const response: TokenTransactionResponse = {
        transactionId: `txn_${Date.now()}`,
        tokenId: request.tokenId,
        amount: request.amount,
        currency: request.currency,
        status: 'DECLINED',
        responseCode: '51',
        declineReason: 'Amount exceeds per transaction limit',
        processingDate: new Date().toISOString(),
      };
      this.transactions.set(response.transactionId, response);
      return response;
    }

    // Check international/domestic restrictions
    if (request.isInternational && !token.productConfig.internationalEnabled) {
      const response: TokenTransactionResponse = {
        transactionId: `txn_${Date.now()}`,
        tokenId: request.tokenId,
        amount: request.amount,
        currency: request.currency,
        status: 'DECLINED',
        responseCode: '57',
        declineReason: 'Transaction not permitted for international use',
        processingDate: new Date().toISOString(),
      };
      this.transactions.set(response.transactionId, response);
      return response;
    }

    if (!request.isInternational && !token.productConfig.domesticEnabled) {
      const response: TokenTransactionResponse = {
        transactionId: `txn_${Date.now()}`,
        tokenId: request.tokenId,
        amount: request.amount,
        currency: request.currency,
        status: 'DECLINED',
        responseCode: '57',
        declineReason: 'Transaction not permitted for domestic use',
        processingDate: new Date().toISOString(),
      };
      this.transactions.set(response.transactionId, response);
      return response;
    }

    // Simulate transaction approval/decline
    const successRate = Math.random();
    let status: TokenTransactionResponse['status'] = 'APPROVED';
    let responseCode = '00';
    let authCode: string | undefined;
    let declineReason: string | undefined;

    if (successRate > 0.95) {
      status = 'DECLINED';
      responseCode = '05';
      declineReason = 'Do not honor';
    } else if (successRate > 0.9) {
      status = 'DECLINED';
      responseCode = '51';
      declineReason = 'Insufficient funds';
    } else {
      authCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    const response: TokenTransactionResponse = {
      transactionId: `txn_${Date.now()}`,
      tokenId: request.tokenId,
      amount: request.amount,
      currency: request.currency,
      status,
      responseCode,
      authCode,
      declineReason,
      processingDate: new Date().toISOString(),
    };

    this.transactions.set(response.transactionId, response);

    // Create transaction notification
    this.createNotification({
      notificationId: `notif_${Date.now()}`,
      tokenId: request.tokenId,
      eventType: 'TRANSACTION',
      eventData: {
        transactionId: response.transactionId,
        amount: request.amount,
        currency: request.currency,
        status: response.status,
        merchantName: request.merchantName,
        isInternational: request.isInternational,
      },
      timestamp: new Date().toISOString(),
    });

    console.log('Mastercard Tokenization API: Transaction processed', response);
    return response;
  }

  // Get token transactions
  async getTokenTransactions(tokenId: string, limit: number = 10): Promise<TokenTransactionResponse[]> {
    await delay(400);

    return Array.from(this.transactions.values())
      .filter(txn => txn.tokenId === tokenId)
      .sort((a, b) => new Date(b.processingDate).getTime() - new Date(a.processingDate).getTime())
      .slice(0, limit);
  }

  // Get notifications
  async getNotifications(tokenId?: string, since?: string): Promise<TokenNotification[]> {
    await delay(300);

    let notifications = [...this.notifications];

    if (tokenId) {
      notifications = notifications.filter(n => n.tokenId === tokenId);
    }

    if (since) {
      const sinceDate = new Date(since);
      notifications = notifications.filter(n => new Date(n.timestamp) > sinceDate);
    }

    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get customer tokens
  async getCustomerTokens(customerId: string): Promise<TokenizationResponse[]> {
    await delay(400);

    // In real implementation, tokens would be associated with customerId
    // For demo, return all active tokens
    return Array.from(this.tokens.values()).filter(token => token.tokenStatus === 'ACTIVE');
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

  private createNotification(notification: TokenNotification): void {
    this.notifications.push(notification);

    // Keep only last 1000 notifications
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(-1000);
    }
  }
}

export const mastercardTokenizationApiService = new MastercardTokenizationApiService();
