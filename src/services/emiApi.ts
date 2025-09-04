/**
 * EMI API Service
 * Handles EMI provider management, plan generation, and payment processing
 * Following RBI compliance and industry best practices
 */

import { EMIProvider, EMIPlan, EMIData, EMICalculationRequest } from '@/types/payment';
import { calculateEMI, generateEMIPlans, validateEMIEligibility } from '@/utils/emiCalculator';
import { delay } from '@/utils/delay';

// Mock EMI providers data - In production, this would come from backend API
const MOCK_EMI_PROVIDERS: EMIProvider[] = [
  {
    id: 'hdfc-emi',
    name: 'HDFC Bank',
    logo: '🏦',
    minAmount: 1000,
    maxAmount: 500000,
    supportedTenures: [3, 6, 9, 12, 18, 24],
    interestRates: {
      3: 12.99,
      6: 13.99,
      9: 14.99,
      12: 15.99,
      18: 16.99,
      24: 17.99
    },
    processingFee: 99,
    enabled: true
  },
  {
    id: 'icici-emi',
    name: 'ICICI Bank',
    logo: '🏦',
    minAmount: 1000,
    maxAmount: 300000,
    supportedTenures: [3, 6, 9, 12, 18],
    interestRates: {
      3: 11.99,
      6: 12.99,
      9: 13.99,
      12: 14.99,
      18: 15.99
    },
    processingFee: 149,
    enabled: true
  },
  {
    id: 'sbi-emi',
    name: 'SBI Credit Card',
    logo: '🏦',
    minAmount: 500,
    maxAmount: 200000,
    supportedTenures: [3, 6, 9, 12],
    interestRates: {
      3: 14.99,
      6: 15.99,
      9: 16.99,
      12: 17.99
    },
    processingFee: 0,
    enabled: true
  },
  {
    id: 'amazonpay-emi',
    name: 'Amazon Pay Later',
    logo: '📦',
    minAmount: 100,
    maxAmount: 100000,
    supportedTenures: [3, 6, 9],
    interestRates: {
      3: 0, // No interest for first 3 months
      6: 12.99,
      9: 13.99
    },
    processingFee: 0,
    enabled: true
  }
];

export class EMIAPIService {
  private providers: EMIProvider[] = MOCK_EMI_PROVIDERS;

  /**
   * Get all available EMI providers
   */
  async getEMIProviders(): Promise<EMIProvider[]> {
    await delay(500); // Simulate API call
    return this.providers.filter(provider => provider.enabled);
  }

  /**
   * Get EMI provider by ID
   */
  async getEMIProvider(providerId: string): Promise<EMIProvider | null> {
    await delay(300);
    return this.providers.find(provider => provider.id === providerId) || null;
  }

  /**
   * Get EMI plans for a specific amount
   */
  async getEMIPlans(amount: number): Promise<EMIPlan[]> {
    await delay(800);

    // Validate EMI eligibility
    const eligibility = validateEMIEligibility(amount);
    if (!eligibility.eligible) {
      throw new Error(eligibility.reason);
    }

    const allPlans: EMIPlan[] = [];

    for (const provider of this.providers) {
      if (!provider.enabled) continue;

      const plans = generateEMIPlans(amount, provider);
      allPlans.push(...plans);
    }

    // Sort by monthly amount (lowest first)
    return allPlans.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
  }

  /**
   * Get EMI plans for a specific provider and amount
   */
  async getEMIPlansByProvider(providerId: string, amount: number): Promise<EMIPlan[]> {
    await delay(600);

    const provider = await this.getEMIProvider(providerId);
    if (!provider) {
      throw new Error('EMI provider not found');
    }

    return generateEMIPlans(amount, provider);
  }

  /**
   * Calculate EMI for custom parameters
   */
  async calculateEMI(request: EMICalculationRequest) {
    await delay(400);
    return calculateEMI(request);
  }

  /**
   * Validate EMI payment data
   */
  async validateEMIPayment(data: EMIData): Promise<{ valid: boolean; errors?: string[] }> {
    await delay(500);

    const errors: string[] = [];

    // Validate provider
    const provider = await this.getEMIProvider(data.providerId);
    if (!provider) {
      errors.push('Invalid EMI provider');
    }

    // Validate tenure
    if (provider && !provider.supportedTenures.includes(data.tenure)) {
      errors.push('Invalid tenure for selected provider');
    }

    // Validate amounts
    if (data.emiAmount <= 0) {
      errors.push('Invalid EMI amount');
    }

    if (data.totalAmount <= 0) {
      errors.push('Invalid total amount');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Process EMI payment
   */
  async processEMIPayment(data: EMIData, orderId: string): Promise<{
    paymentId: string;
    status: 'success' | 'pending' | 'failed';
    emiDetails: {
      firstPaymentDate: string;
      nextPaymentDate: string;
      totalInstallments: number;
      monthlyAmount: number;
    };
  }> {
    await delay(1500); // Simulate processing time

    // Validate payment data
    const validation = await this.validateEMIPayment(data);
    if (!validation.valid) {
      throw new Error(`EMI validation failed: ${validation.errors?.join(', ')}`);
    }

    // Simulate payment processing
    const paymentId = `EMI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate first payment date (typically next month)
    const firstPaymentDate = new Date();
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    firstPaymentDate.setDate(5); // 5th of next month

    const nextPaymentDate = new Date(firstPaymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    return {
      paymentId,
      status: 'success',
      emiDetails: {
        firstPaymentDate: firstPaymentDate.toISOString().split('T')[0],
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        totalInstallments: data.tenure,
        monthlyAmount: data.emiAmount
      }
    };
  }

  /**
   * Get EMI transaction status
   */
  async getEMIStatus(paymentId: string): Promise<{
    status: 'active' | 'completed' | 'defaulted' | 'cancelled';
    paidInstallments: number;
    remainingInstallments: number;
    nextPaymentDate?: string;
    totalPaid: number;
    remainingAmount: number;
  }> {
    await delay(600);

    // Mock status - in production, this would query the actual EMI system
    return {
      status: 'active',
      paidInstallments: 1,
      remainingInstallments: 11,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPaid: 1500,
      remainingAmount: 16500
    };
  }

  /**
   * Cancel EMI agreement
   */
  async cancelEMI(paymentId: string): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    // Mock cancellation - in production, this would call the EMI provider's API
    return {
      success: true,
      message: 'EMI agreement cancelled successfully. Any processing fees may still apply.'
    };
  }

  /**
   * Get EMI terms and conditions
   */
  async getEMITerms(providerId: string): Promise<{
    terms: string;
    privacyPolicy: string;
    cancellationPolicy: string;
  }> {
    await delay(400);

    return {
      terms: `Standard EMI terms for ${providerId}. Interest rates and fees apply as per agreement.`,
      privacyPolicy: 'Your data is protected under RBI guidelines and our privacy policy.',
      cancellationPolicy: 'EMI can be cancelled within 3 days of agreement. Processing fees may apply.'
    };
  }
}

// Export singleton instance
export const emiApiService = new EMIAPIService();
