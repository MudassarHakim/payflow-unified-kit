/**
 * EMI API Service Tests
 * Comprehensive test coverage for EMI API functionality
 */

import { emiApiService } from '../emiApi';
import { EMIProvider, EMIPlan } from '@/types/payment';

// Mock the delay utility
jest.mock('@/utils/delay', () => ({
  delay: jest.fn().mockResolvedValue(undefined)
}));

describe('EMI API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEMIProviders', () => {
    it('should return all enabled EMI providers', async () => {
      const providers = await emiApiService.getEMIProviders();

      expect(providers).toHaveLength(4);
      expect(providers.every(p => p.enabled)).toBe(true);
      expect(providers[0]).toHaveProperty('id', 'hdfc-emi');
      expect(providers[0]).toHaveProperty('name', 'HDFC Bank');
    });

    it('should filter out disabled providers', async () => {
      // Mock a disabled provider
      const originalProviders = emiApiService['providers'];
      emiApiService['providers'] = [
        ...originalProviders,
        {
          id: 'disabled-bank',
          name: 'Disabled Bank',
          logo: '🏦',
          minAmount: 1000,
          maxAmount: 50000,
          supportedTenures: [3, 6],
          interestRates: { 3: 10, 6: 12 },
          processingFee: 0,
          enabled: false
        }
      ];

      const providers = await emiApiService.getEMIProviders();
      expect(providers).toHaveLength(4); // Should still be 4, disabled one filtered out

      // Restore original providers
      emiApiService['providers'] = originalProviders;
    });
  });

  describe('getEMIProvider', () => {
    it('should return provider by ID', async () => {
      const provider = await emiApiService.getEMIProvider('hdfc-emi');

      expect(provider).toBeTruthy();
      expect(provider?.id).toBe('hdfc-emi');
      expect(provider?.name).toBe('HDFC Bank');
    });

    it('should return null for non-existent provider', async () => {
      const provider = await emiApiService.getEMIProvider('non-existent');

      expect(provider).toBeNull();
    });
  });

  describe('getEMIPlans', () => {
    it('should return EMI plans for valid amount', async () => {
      const plans = await emiApiService.getEMIPlans(10000);

      expect(plans.length).toBeGreaterThan(0);
      expect(plans[0]).toHaveProperty('providerId');
      expect(plans[0]).toHaveProperty('tenure');
      expect(plans[0]).toHaveProperty('monthlyAmount');
      expect(plans[0]).toHaveProperty('totalAmount');
    });

    it('should sort plans by monthly amount ascending', async () => {
      const plans = await emiApiService.getEMIPlans(10000);

      for (let i = 1; i < plans.length; i++) {
        expect(plans[i].monthlyAmount).toBeGreaterThanOrEqual(plans[i-1].monthlyAmount);
      }
    });

    it('should throw error for invalid amount', async () => {
      await expect(emiApiService.getEMIPlans(500)).rejects.toThrow('Minimum EMI amount');
    });
  });

  describe('getEMIPlansByProvider', () => {
    it('should return plans for specific provider', async () => {
      const plans = await emiApiService.getEMIPlansByProvider('hdfc-emi', 10000);

      expect(plans.length).toBeGreaterThan(0);
      expect(plans.every(p => p.providerId === 'hdfc-emi')).toBe(true);
    });

    it('should throw error for non-existent provider', async () => {
      await expect(
        emiApiService.getEMIPlansByProvider('non-existent', 10000)
      ).rejects.toThrow('EMI provider not found');
    });
  });

  describe('calculateEMI', () => {
    it('should calculate EMI correctly', async () => {
      const result = await emiApiService.calculateEMI({
        amount: 10000,
        tenure: 12,
        interestRate: 12
      });

      expect(result).toHaveProperty('monthlyEMI');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('totalInterest');
      expect(result.monthlyEMI).toBeCloseTo(888.49, 2);
    });
  });

  describe('validateEMIPayment', () => {
    const validEMIData = {
      providerId: 'hdfc-emi',
      planId: 'hdfc-emi_12',
      tenure: 12,
      emiAmount: 900,
      totalAmount: 10800,
      interestRate: 12,
      processingFee: 99
    };

    it('should validate correct EMI data', async () => {
      const result = await emiApiService.validateEMIPayment(validEMIData);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid provider', async () => {
      const invalidData = { ...validEMIData, providerId: 'invalid' };
      const result = await emiApiService.validateEMIPayment(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid EMI provider');
    });

    it('should reject invalid tenure', async () => {
      const invalidData = { ...validEMIData, tenure: 99 };
      const result = await emiApiService.validateEMIPayment(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid tenure for selected provider');
    });

    it('should reject invalid amounts', async () => {
      const invalidData = { ...validEMIData, emiAmount: -100 };
      const result = await emiApiService.validateEMIPayment(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid EMI amount');
    });
  });

  describe('processEMIPayment', () => {
    const validEMIData = {
      providerId: 'hdfc-emi',
      planId: 'hdfc-emi_12',
      tenure: 12,
      emiAmount: 900,
      totalAmount: 10800,
      interestRate: 12,
      processingFee: 99
    };

    it('should process valid EMI payment', async () => {
      const result = await emiApiService.processEMIPayment(validEMIData, 'order_123');

      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('emiDetails');
      expect(result.emiDetails).toHaveProperty('totalInstallments', 12);
      expect(result.emiDetails).toHaveProperty('monthlyAmount', 900);
    });

    it('should generate unique payment IDs', async () => {
      const result1 = await emiApiService.processEMIPayment(validEMIData, 'order_1');
      const result2 = await emiApiService.processEMIPayment(validEMIData, 'order_2');

      expect(result1.paymentId).not.toBe(result2.paymentId);
    });

    it('should reject invalid EMI data', async () => {
      const invalidData = { ...validEMIData, providerId: 'invalid' };

      await expect(
        emiApiService.processEMIPayment(invalidData, 'order_123')
      ).rejects.toThrow('EMI validation failed');
    });
  });

  describe('getEMIStatus', () => {
    it('should return EMI status for valid payment ID', async () => {
      const status = await emiApiService.getEMIStatus('EMI_123');

      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('paidInstallments');
      expect(status).toHaveProperty('remainingInstallments');
      expect(status).toHaveProperty('totalPaid');
      expect(status).toHaveProperty('remainingAmount');
    });
  });

  describe('cancelEMI', () => {
    it('should cancel EMI agreement', async () => {
      const result = await emiApiService.cancelEMI('EMI_123');

      expect(result.success).toBe(true);
      expect(result.message).toContain('cancelled successfully');
    });
  });

  describe('getEMITerms', () => {
    it('should return EMI terms and conditions', async () => {
      const terms = await emiApiService.getEMITerms('hdfc-emi');

      expect(terms).toHaveProperty('terms');
      expect(terms).toHaveProperty('privacyPolicy');
      expect(terms).toHaveProperty('cancellationPolicy');
      expect(terms.terms).toContain('hdfc-emi');
    });
  });
});
