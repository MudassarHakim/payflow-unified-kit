/**
 * EMI Calculator Utility Tests
 * Comprehensive test coverage for EMI calculation functions
 */

import {
  calculateEMI,
  generateEMIPlans,
  getBestEMIPlan,
  validateEMIEligibility,
  formatEMIAmount,
  formatInterestRate,
  getStandardTenures,
  calculateEMICostComparison
} from '../emiCalculator';
import { EMIProvider } from '@/types/payment';

describe('EMI Calculator', () => {
  describe('calculateEMI', () => {
    it('should calculate EMI correctly for standard inputs', () => {
      const result = calculateEMI({
        amount: 10000,
        tenure: 12,
        interestRate: 12,
        processingFee: 100
      });

      expect(result.monthlyEMI).toBeCloseTo(888.49, 2);
      expect(result.totalAmount).toBeCloseTo(10761.88, 2);
      expect(result.totalInterest).toBeCloseTo(661.88, 2);
      expect(result.processingFee).toBe(100);
    });

    it('should handle zero processing fee', () => {
      const result = calculateEMI({
        amount: 5000,
        tenure: 6,
        interestRate: 10
      });

      expect(result.processingFee).toBe(0);
      expect(result.totalAmount).toBe(result.totalInterest + 5000);
    });

    it('should calculate EMI for different tenures', () => {
      const testCases = [
        { tenure: 3, expectedEMI: 3400.22 },
        { tenure: 6, expectedEMI: 1725.48 },
        { tenure: 12, expectedEMI: 888.49 },
        { tenure: 24, expectedEMI: 470.73 }
      ];

      testCases.forEach(({ tenure, expectedEMI }) => {
        const result = calculateEMI({
          amount: 10000,
          tenure,
          interestRate: 12
        });
        expect(result.monthlyEMI).toBeCloseTo(expectedEMI, 2);
      });
    });
  });

  describe('generateEMIPlans', () => {
    const mockProvider: EMIProvider = {
      id: 'test-bank',
      name: 'Test Bank',
      logo: '🏦',
      minAmount: 1000,
      maxAmount: 50000,
      supportedTenures: [3, 6, 12],
      interestRates: {
        3: 10,
        6: 12,
        12: 14
      },
      processingFee: 99,
      enabled: true
    };

    it('should generate EMI plans for valid amount', () => {
      const plans = generateEMIPlans(10000, mockProvider);

      expect(plans).toHaveLength(3);
      expect(plans[0].tenure).toBe(12); // Sorted by monthly amount ascending
      expect(plans[0].monthlyAmount).toBeCloseTo(897.87, 2);
      expect(plans[0].providerId).toBe('test-bank');
    });

    it('should return empty array for amount below minimum', () => {
      const plans = generateEMIPlans(500, mockProvider);
      expect(plans).toHaveLength(0);
    });

    it('should return empty array for amount above maximum', () => {
      const plans = generateEMIPlans(100000, mockProvider);
      expect(plans).toHaveLength(0);
    });

    it('should sort plans by monthly amount ascending', () => {
      const plans = generateEMIPlans(10000, mockProvider);
      for (let i = 1; i < plans.length; i++) {
        expect(plans[i].monthlyAmount).toBeGreaterThanOrEqual(plans[i-1].monthlyAmount);
      }
    });
  });

  describe('getBestEMIPlan', () => {
    it('should return plan with lowest monthly payment', () => {
      const plans = [
        { monthlyAmount: 1000, tenure: 12 } as any,
        { monthlyAmount: 800, tenure: 12 } as any,
        { monthlyAmount: 1200, tenure: 6 } as any
      ];

      const bestPlan = getBestEMIPlan(plans);
      expect(bestPlan?.monthlyAmount).toBe(800);
    });

    it('should return null for empty plans array', () => {
      const bestPlan = getBestEMIPlan([]);
      expect(bestPlan).toBeNull();
    });
  });

  describe('validateEMIEligibility', () => {
    it('should validate minimum amount', () => {
      const result = validateEMIEligibility(500);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Minimum EMI amount');
    });

    it('should validate maximum amount', () => {
      const result = validateEMIEligibility(1000000);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Maximum EMI amount');
    });

    it('should validate credit score', () => {
      const result = validateEMIEligibility(10000, 600);
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('Credit score too low');
    });

    it('should validate income ratio', () => {
      const result = validateEMIEligibility(10000, 750, 15000); // EMI would be ~900, 6% of income
      expect(result.eligible).toBe(true);
    });

    it('should return eligible for valid inputs', () => {
      const result = validateEMIEligibility(10000, 750);
      expect(result.eligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('formatEMIAmount', () => {
    it('should format amount in Indian Rupees', () => {
      expect(formatEMIAmount(1234.56)).toBe('₹1,235');
      expect(formatEMIAmount(100000)).toBe('₹1,00,000');
    });
  });

  describe('formatInterestRate', () => {
    it('should format interest rate with percentage', () => {
      expect(formatInterestRate(12.5)).toBe('12.50%');
      expect(formatInterestRate(10)).toBe('10.00%');
    });
  });

  describe('getStandardTenures', () => {
    it('should return standard EMI tenures', () => {
      const tenures = getStandardTenures();
      expect(tenures).toEqual([3, 6, 9, 12, 18, 24, 36]);
    });
  });

  describe('calculateEMICostComparison', () => {
    const mockPlan = {
      monthlyAmount: 900,
      totalAmount: 10800,
      tenure: 12
    } as any;

    it('should calculate cost comparison correctly', () => {
      const comparison = calculateEMICostComparison(10000, mockPlan);

      expect(comparison.fullPaymentCost).toBe(10000);
      expect(comparison.emiTotalCost).toBe(10800);
      expect(comparison.extraCost).toBe(800);
      expect(comparison.savingsPercentage).toBeCloseTo(8.0, 1);
    });
  });
});
