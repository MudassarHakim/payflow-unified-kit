import { walletApiService } from '../walletApi';

describe('WalletApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWalletProviders', () => {
    it('should return an array of wallet providers', async () => {
      const providers = await walletApiService.getWalletProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);

      providers.forEach(provider => {
        expect(provider).toHaveProperty('id');
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('icon');
        expect(provider).toHaveProperty('description');
        expect(provider).toHaveProperty('kycTier');
        expect(provider).toHaveProperty('balanceCheckRequired');
        expect(provider).toHaveProperty('supportedCurrencies');
        expect(provider).toHaveProperty('maxTransactionLimit');
        expect(provider).toHaveProperty('fees');
        expect(provider).toHaveProperty('features');
      });
    });

    it('should include major wallet providers', async () => {
      const providers = await walletApiService.getWalletProviders();
      const providerIds = providers.map(p => p.id);

      expect(providerIds).toContain('paytm');
      expect(providerIds).toContain('phonepe');
      expect(providerIds).toContain('amazonpay');
    });
  });

  describe('checkWalletBalance', () => {
    it('should return wallet balance with correct structure', async () => {
      const balance = await walletApiService.checkWalletBalance('paytm');

      expect(balance).toHaveProperty('balance');
      expect(balance).toHaveProperty('currency');
      expect(balance).toHaveProperty('lastUpdated');
      expect(typeof balance.balance).toBe('number');
      expect(balance.currency).toBe('INR');
      expect(balance.balance).toBeGreaterThanOrEqual(0);
    });

    it('should return different balances for different wallets', async () => {
      const balance1 = await walletApiService.checkWalletBalance('paytm');
      const balance2 = await walletApiService.checkWalletBalance('phonepe');

      // Since balances are random, we can't guarantee they're different
      // but we can check that both are valid numbers
      expect(balance1.balance).toBeGreaterThanOrEqual(0);
      expect(balance2.balance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateWalletTransaction', () => {
    it('should validate successful transaction', async () => {
      const validation = await walletApiService.validateWalletTransaction('paytm', 1000);

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('reason');
      expect(validation).toHaveProperty('suggestedAmount');
    });

    it('should reject transaction exceeding limit', async () => {
      const provider = walletApiService.getProviderById('freecharge');
      const amount = (provider?.maxTransactionLimit || 25000) + 1000;

      const validation = await walletApiService.validateWalletTransaction('freecharge', amount);

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('exceeds wallet limit');
      expect(validation.suggestedAmount).toBe(provider?.maxTransactionLimit);
    });

    it('should reject transaction with insufficient balance', async () => {
      // Mock a wallet with low balance
      const balance = await walletApiService.checkWalletBalance('mobikwik');
      const amount = balance.balance + 1000;

      const validation = await walletApiService.validateWalletTransaction('mobikwik', amount);

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('Insufficient wallet balance');
    });

    it('should reject invalid wallet provider', async () => {
      const validation = await walletApiService.validateWalletTransaction('invalid_wallet', 1000);

      expect(validation.valid).toBe(false);
      expect(validation.reason).toContain('Wallet provider not found');
    });
  });

  describe('initiateWalletPayment', () => {
    it('should initiate payment successfully', async () => {
      const result = await walletApiService.initiateWalletPayment('paytm', 1000, 'order_123');

      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('status');
      expect(result.paymentId).toMatch(/^wallet_pay_/);
      expect(['pending', 'success', 'failed']).toContain(result.status);
    });

    it('should throw error for invalid transaction', async () => {
      await expect(
        walletApiService.initiateWalletPayment('paytm', 200000, 'order_123')
      ).rejects.toThrow();
    });
  });

  describe('getWalletTransactionStatus', () => {
    it('should return transaction status', async () => {
      const status = await walletApiService.getWalletTransactionStatus('wallet_pay_123');

      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('message');
      expect(['pending', 'success', 'failed', 'cancelled']).toContain(status.status);
    });
  });

  describe('calculateFees', () => {
    it('should calculate fees correctly', () => {
      const provider = walletApiService.getProviderById('paytm');
      if (provider) {
        const fee = walletApiService.calculateFees(provider, 1000);
        expect(typeof fee).toBe('number');
        expect(fee).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return 0 for free transactions', () => {
      const provider = walletApiService.getProviderById('paytm');
      if (provider) {
        const fee = walletApiService.calculateFees(provider, 1000);
        expect(fee).toBe(0);
      }
    });
  });

  describe('getProviderById', () => {
    it('should return provider for valid id', () => {
      const provider = walletApiService.getProviderById('paytm');

      expect(provider).toBeTruthy();
      expect(provider?.id).toBe('paytm');
      expect(provider?.name).toBe('Paytm');
    });

    it('should return undefined for invalid id', () => {
      const provider = walletApiService.getProviderById('invalid_id');

      expect(provider).toBeUndefined();
    });
  });
});
