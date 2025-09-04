// Wallet API Service - Handles wallet-specific operations
import { delay } from '../utils/delay';

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  kycTier: 'basic' | 'intermediate' | 'full';
  balanceCheckRequired: boolean;
  supportedCurrencies: string[];
  maxTransactionLimit: number;
  fees: {
    percentage?: number;
    fixed?: number;
  };
  features: string[];
}

export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface WalletTransactionValidation {
  valid: boolean;
  reason?: string;
  suggestedAmount?: number;
}

class WalletApiService {
  private walletProviders: WalletProvider[] = [
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '💳',
      description: 'India\'s largest digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 100000,
      fees: { percentage: 0 },
      features: ['Instant transfer', 'Cashback rewards', 'Bill payments']
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'UPI-powered digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 100000,
      fees: { percentage: 0 },
      features: ['UPI integration', 'Merchant offers', 'Split payments']
    },
    {
      id: 'amazonpay',
      name: 'Amazon Pay',
      icon: '📦',
      description: 'Amazon\'s digital payment service',
      kycTier: 'intermediate',
      balanceCheckRequired: false,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 50000,
      fees: { percentage: 0 },
      features: ['One-click checkout', 'Amazon balance', 'Rewards points']
    },
    {
      id: 'mobikwik',
      name: 'MobiKwik',
      icon: '⚡',
      description: 'Fast and secure digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 50000,
      fees: { percentage: 0 },
      features: ['Instant cashback', 'Movie tickets', 'Recharge']
    },
    {
      id: 'freecharge',
      name: 'FreeCharge',
      icon: '🔋',
      description: 'Digital wallet with rewards',
      kycTier: 'intermediate',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 25000,
      fees: { percentage: 0 },
      features: ['Cashback offers', 'Utility bills', 'Gift cards']
    }
  ];

  async getWalletProviders(): Promise<WalletProvider[]> {
    await delay(300);
    return this.walletProviders.filter(provider => provider.id !== 'amazonpay' || Math.random() > 0.3); // Simulate some providers being unavailable
  }

  async checkWalletBalance(walletId: string): Promise<WalletBalance> {
    await delay(800); // Simulate balance check latency

    // Mock balance data - in real implementation, this would call the wallet provider's API
    const mockBalances: Record<string, number> = {
      'paytm': Math.floor(Math.random() * 50000) + 5000,
      'phonepe': Math.floor(Math.random() * 30000) + 2000,
      'amazonpay': Math.floor(Math.random() * 20000) + 1500,
      'mobikwik': Math.floor(Math.random() * 15000) + 800,
      'freecharge': Math.floor(Math.random() * 10000) + 500,
    };

    const balance = mockBalances[walletId] || 0;

    return {
      balance,
      currency: 'INR',
      lastUpdated: new Date().toISOString()
    };
  }

  async validateWalletTransaction(walletId: string, amount: number): Promise<WalletTransactionValidation> {
    await delay(500);

    const provider = this.walletProviders.find(p => p.id === walletId);
    if (!provider) {
      return {
        valid: false,
        reason: 'Wallet provider not found'
      };
    }

    // Check transaction limits
    if (amount > provider.maxTransactionLimit) {
      return {
        valid: false,
        reason: `Transaction amount exceeds wallet limit of ₹${provider.maxTransactionLimit.toLocaleString()}`,
        suggestedAmount: provider.maxTransactionLimit
      };
    }

    // For wallets that require balance check
    if (provider.balanceCheckRequired) {
      const balance = await this.checkWalletBalance(walletId);

      if (balance.balance < amount) {
        const shortfall = amount - balance.balance;
        return {
          valid: false,
          reason: `Insufficient wallet balance. You need ₹${shortfall.toLocaleString()} more.`,
          suggestedAmount: balance.balance
        };
      }
    }

    return { valid: true };
  }

  async initiateWalletPayment(walletId: string, amount: number, orderId: string): Promise<{
    paymentId: string;
    redirectUrl?: string;
    status: 'pending' | 'success' | 'failed';
  }> {
    await delay(1000);

    // Validate transaction first
    const validation = await this.validateWalletTransaction(walletId, amount);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Simulate payment initiation
    const paymentId = `wallet_pay_${Date.now()}`;

    // For demo purposes, simulate different outcomes
    const successRate = Math.random();

    if (successRate > 0.9) {
      return {
        paymentId,
        status: 'failed'
      };
    }

    // Some wallets require redirect, others are instant
    const requiresRedirect = ['amazonpay', 'freecharge'].includes(walletId);

    return {
      paymentId,
      redirectUrl: requiresRedirect ? `https://${walletId}.com/pay/${paymentId}` : undefined,
      status: 'pending'
    };
  }

  async getWalletTransactionStatus(paymentId: string): Promise<{
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    message?: string;
  }> {
    await delay(500);

    // Simulate status check
    const statuses: Array<'pending' | 'success' | 'failed' | 'cancelled'> = ['pending', 'success', 'failed', 'cancelled'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status: randomStatus,
      message: randomStatus === 'success' ? 'Payment completed successfully' :
               randomStatus === 'failed' ? 'Payment failed' :
               randomStatus === 'cancelled' ? 'Payment was cancelled' :
               'Payment is being processed'
    };
  }

  calculateFees(provider: WalletProvider, amount: number): number {
    if (provider.fees.percentage) {
      return (amount * provider.fees.percentage) / 100;
    }
    return provider.fees.fixed || 0;
  }

  getProviderById(id: string): WalletProvider | undefined {
    return this.walletProviders.find(provider => provider.id === id);
  }
}

export const walletApiService = new WalletApiService();
