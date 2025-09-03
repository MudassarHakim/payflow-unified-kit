import { mockApiService } from '../mockApi';

describe('MockApiService', () => {
  jest.setTimeout(10000);

  it('should initialize session', async () => {
    const session = await mockApiService.initializeSession({ publicKey: 'test_key', merchantId: 'merchant_1', environment: 'sandbox' });
    expect(session).toHaveProperty('sessionId');
    expect(session.publicKey).toBe('test_key');
  });

  it('should get payment methods', async () => {
    const methods = await mockApiService.getPaymentMethods();
    expect(methods.length).toBeGreaterThan(0);
    expect(methods[0]).toHaveProperty('id');
  });

  it('should get saved cards', async () => {
    const cards = await mockApiService.getSavedCards('customer1');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0]).toHaveProperty('tokenId');
  });

  it('should process payment successfully or require 3DS or fail', async () => {
    const order = { orderId: 'order_1', amount: 100, currency: 'INR' };
    const method = { id: 'card', type: 'card' as const, name: 'Card', icon: '💳', enabled: true };
    const paymentData = {};
    const result = await mockApiService.processPayment({ order, method, paymentData });
    expect(['success', 'requires_action', 'failed']).toContain(result.status);
  });

  it('should create hosted card capture', async () => {
    const result = await mockApiService.createHostedCardCapture();
    expect(result).toHaveProperty('hccUrl');
    expect(result).toHaveProperty('challengeToken');
  });

  it('should get net banking banks', async () => {
    const banks = await mockApiService.getNetBankingBanks();
    expect(banks.length).toBeGreaterThan(0);
  });

  it('should get wallet providers', async () => {
    const wallets = await mockApiService.getWalletProviders();
    expect(wallets.length).toBeGreaterThan(0);
  });

  it('should get BNPL providers', async () => {
    const bnpl = await mockApiService.getBNPLProviders();
    expect(bnpl.length).toBeGreaterThan(0);
  });
});
