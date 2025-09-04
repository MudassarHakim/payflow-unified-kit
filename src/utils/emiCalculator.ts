/**
 * EMI Calculator Utility
 * Following RBI guidelines and industry best practices for EMI calculations
 */

import { EMIProvider, EMIPlan, EMICalculationRequest, EMICalculationResponse } from '@/types/payment';

/**
 * Calculate EMI using standard EMI formula
 * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
 * Where:
 * P = Principal amount
 * R = Monthly interest rate
 * N = Number of installments
 */
export function calculateEMI(request: EMICalculationRequest): EMICalculationResponse {
  const { amount, tenure, interestRate, processingFee = 0 } = request;

  // Convert annual interest rate to monthly
  const monthlyRate = interestRate / 12 / 100;

  // EMI calculation
  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
              (Math.pow(1 + monthlyRate, tenure) - 1);

  const monthlyEMI = Math.round(emi * 100) / 100; // Round to 2 decimal places
  const totalEMIAmount = monthlyEMI * tenure;
  const totalInterest = totalEMIAmount - amount;
  const totalAmount = totalEMIAmount + processingFee;

  return {
    monthlyEMI,
    totalAmount,
    totalInterest,
    processingFee,
    emiBreakdown: {
      principal: amount,
      interest: totalInterest,
      processingFee
    }
  };
}

/**
 * Generate EMI plans for a given amount and provider
 */
export function generateEMIPlans(
  amount: number,
  provider: EMIProvider
): EMIPlan[] {
  const plans: EMIPlan[] = [];

  // Check if amount is within provider limits
  if (amount < provider.minAmount || amount > provider.maxAmount) {
    return plans;
  }

  provider.supportedTenures.forEach(tenure => {
    const interestRate = provider.interestRates[tenure];
    if (!interestRate) return;

    const calculation = calculateEMI({
      amount,
      tenure,
      interestRate,
      processingFee: provider.processingFee || 0
    });

    plans.push({
      providerId: provider.id,
      providerName: provider.name,
      tenure,
      interestRate,
      monthlyAmount: calculation.monthlyEMI,
      totalAmount: calculation.totalAmount,
      processingFee: calculation.processingFee,
      totalInterest: calculation.totalInterest,
      emiAmount: calculation.monthlyEMI
    });
  });

  // Sort plans by monthly amount ascending (lowest first)
  return plans.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
}

/**
 * Get the best EMI plan based on lowest monthly payment
 */
export function getBestEMIPlan(plans: EMIPlan[]): EMIPlan | null {
  if (plans.length === 0) return null;

  return plans.reduce((best, current) =>
    current.monthlyAmount < best.monthlyAmount ? current : best
  );
}

/**
 * Validate EMI eligibility based on RBI guidelines
 */
export function validateEMIEligibility(
  amount: number,
  customerCreditScore?: number,
  customerIncome?: number
): { eligible: boolean; reason?: string } {
  // Minimum amount check (RBI guideline)
  if (amount < 1000) {
    return { eligible: false, reason: 'Minimum EMI amount is ₹1,000' };
  }

  // Maximum amount check (RBI guideline for retail)
  if (amount > 500000) {
    return { eligible: false, reason: 'Maximum EMI amount is ₹5,00,000 for retail customers' };
  }

  // Credit score validation (if provided)
  if (customerCreditScore !== undefined && customerCreditScore < 650) {
    return { eligible: false, reason: 'Credit score too low for EMI. Minimum 650 required.' };
  }

  // Income validation (if provided) - EMI should not exceed 50% of monthly income
  if (customerIncome !== undefined) {
    const maxEMI = customerIncome * 0.5;
    const estimatedEMI = amount / 12; // Rough estimate
    if (estimatedEMI > maxEMI) {
      return { eligible: false, reason: 'EMI amount exceeds 50% of monthly income' };
    }
  }

  return { eligible: true };
}

/**
 * Format EMI amount for display
 */
export function formatEMIAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format interest rate for display
 */
export function formatInterestRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Get EMI tenure options commonly offered
 */
export function getStandardTenures(): number[] {
  return [3, 6, 9, 12, 18, 24, 36];
}

/**
 * Calculate total cost of EMI vs full payment
 */
export function calculateEMICostComparison(
  amount: number,
  emiPlan: EMIPlan
): {
  fullPaymentCost: number;
  emiTotalCost: number;
  extraCost: number;
  savingsPercentage: number;
} {
  const fullPaymentCost = amount;
  const emiTotalCost = emiPlan.totalAmount;
  const extraCost = emiTotalCost - fullPaymentCost;
  const savingsPercentage = (extraCost / fullPaymentCost) * 100;

  return {
    fullPaymentCost,
    emiTotalCost,
    extraCost,
    savingsPercentage
  };
}
