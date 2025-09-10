// Travel Insurance Provider API Mock Service - Simulates travel insurance backend
import { delay } from '@/utils/delay';

export interface InsuranceNominee {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  contactNumber: string;
  email?: string;
}

export interface TravelInsurancePlan {
  id: string;
  name: string;
  coverage: {
    medicalExpenses: number;
    tripCancellation: number;
    lostBaggage: number;
    personalAccident: number;
    emergencyAssistance: boolean;
  };
  duration: {
    minDays: number;
    maxDays: number;
  };
  premium: {
    amount: number;
    currency: string;
    frequency: 'one-time' | 'annual';
  };
  destinations: string[]; // Countries covered
  maxAge: number;
  termsAndConditions: string;
}

export interface TravelInsuranceQuoteRequest {
  customerId: string;
  tripDetails: {
    destination: string;
    startDate: string;
    endDate: string;
    purpose: 'leisure' | 'business' | 'education';
    numberOfTravellers: number;
  };
  travellerDetails: {
    name: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber?: string;
  }[];
  nominee: InsuranceNominee;
}

export interface TravelInsuranceQuote {
  quoteId: string;
  planId: string;
  planName: string;
  premium: number;
  coverage: {
    medicalExpenses: number;
    tripCancellation: number;
    lostBaggage: number;
    personalAccident: number;
  };
  validUntil: string;
  termsAccepted: boolean;
}

export interface TravelInsurancePolicy {
  policyId: string;
  policyNumber: string;
  customerId: string;
  planId: string;
  status: 'active' | 'expired' | 'cancelled' | 'claimed';
  coverage: {
    medicalExpenses: number;
    tripCancellation: number;
    lostBaggage: number;
    personalAccident: number;
  };
  premium: number;
  startDate: string;
  endDate: string;
  destination: string;
  travellers: {
    name: string;
    dateOfBirth: string;
    passportNumber?: string;
  }[];
  nominee: InsuranceNominee;
  issuedDate: string;
  certificateUrl?: string;
}

class TravelInsuranceApiService {
  private plans: TravelInsurancePlan[] = [];
  private quotes: Map<string, TravelInsuranceQuote> = new Map();
  private policies: Map<string, TravelInsurancePolicy> = new Map();

  constructor() {
    this.initializeMockPlans();
  }

  // Get available insurance plans
  async getInsurancePlans(destination?: string): Promise<TravelInsurancePlan[]> {
    await delay(500);

    if (!destination) {
      return [...this.plans];
    }

    // Filter plans by destination
    return this.plans.filter(plan =>
      plan.destinations.includes(destination) ||
      plan.destinations.includes('Worldwide') ||
      plan.destinations.includes('International')
    );
  }

  // Get insurance quote
  async getInsuranceQuote(request: TravelInsuranceQuoteRequest): Promise<TravelInsuranceQuote> {
    await delay(1200); // Simulate quote calculation

    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find suitable plan based on trip details
    const suitablePlan = this.findSuitablePlan(request.tripDetails);

    if (!suitablePlan) {
      throw new Error('No suitable insurance plan found for the trip details');
    }

    // Calculate premium based on various factors
    const premium = this.calculatePremium(suitablePlan, request);

    const quote: TravelInsuranceQuote = {
      quoteId,
      planId: suitablePlan.id,
      planName: suitablePlan.name,
      premium,
      coverage: suitablePlan.coverage,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
      termsAccepted: false,
    };

    this.quotes.set(quoteId, quote);

    console.log('Travel Insurance API: Quote generated', quote);
    return quote;
  }

  // Purchase insurance policy
  async purchaseInsurancePolicy(quoteId: string, paymentReference: string): Promise<TravelInsurancePolicy> {
    await delay(1500); // Simulate policy issuance

    const quote = this.quotes.get(quoteId);
    if (!quote) {
      throw new Error('Quote not found or expired');
    }

    if (!quote.termsAccepted) {
      throw new Error('Terms and conditions must be accepted');
    }

    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const policyNumber = `TI${Date.now().toString().slice(-8)}`;

    // Mock policy creation (in real implementation, this would come from the quote request)
    const policy: TravelInsurancePolicy = {
      policyId,
      policyNumber,
      customerId: 'mock_customer', // Would come from quote request
      planId: quote.planId,
      status: 'active',
      coverage: quote.coverage,
      premium: quote.premium,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      destination: 'International', // Would come from quote request
      travellers: [{
        name: 'Mock Traveller',
        dateOfBirth: '1990-01-01',
      }],
      nominee: {
        id: 'nominee_001',
        name: 'Mock Nominee',
        relationship: 'Spouse',
        dateOfBirth: '1990-01-01',
        contactNumber: '+919876543210',
      },
      issuedDate: new Date().toISOString(),
      certificateUrl: `https://insurance.example.com/certificates/${policyNumber}.pdf`,
    };

    this.policies.set(policyId, policy);

    console.log('Travel Insurance API: Policy purchased', policy);
    return policy;
  }

  // Get customer policies
  async getCustomerPolicies(customerId: string): Promise<TravelInsurancePolicy[]> {
    await delay(600);

    return Array.from(this.policies.values()).filter(policy =>
      policy.customerId === customerId
    );
  }

  // Get policy details
  async getPolicyDetails(policyId: string): Promise<TravelInsurancePolicy | null> {
    await delay(400);
    return this.policies.get(policyId) || null;
  }

  // Cancel insurance policy
  async cancelPolicy(policyId: string, reason: string): Promise<{ success: boolean; message: string }> {
    await delay(800);

    const policy = this.policies.get(policyId);
    if (!policy) {
      return { success: false, message: 'Policy not found' };
    }

    if (policy.status !== 'active') {
      return { success: false, message: 'Policy is not active' };
    }

    policy.status = 'cancelled';
    this.policies.set(policyId, policy);

    console.log('Travel Insurance API: Policy cancelled', policyId, reason);
    return { success: true, message: 'Policy cancelled successfully' };
  }

  // File insurance claim
  async fileClaim(policyId: string, claimDetails: {
    claimType: 'medical' | 'trip_cancellation' | 'lost_baggage' | 'personal_accident';
    incidentDate: string;
    description: string;
    documents: string[]; // URLs to uploaded documents
    estimatedAmount: number;
  }): Promise<{ claimId: string; status: string; message: string }> {
    await delay(1000);

    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    if (policy.status !== 'active') {
      throw new Error('Policy is not active');
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Travel Insurance API: Claim filed', claimId, claimDetails);
    return {
      claimId,
      status: 'submitted',
      message: 'Claim submitted successfully. You will receive an update within 48 hours.'
    };
  }

  // Accept insurance terms
  async acceptTerms(quoteId: string): Promise<{ success: boolean; message: string }> {
    await delay(300);

    const quote = this.quotes.get(quoteId);
    if (!quote) {
      return { success: false, message: 'Quote not found' };
    }

    quote.termsAccepted = true;
    this.quotes.set(quoteId, quote);

    return { success: true, message: 'Terms accepted successfully' };
  }

  // Validate nominee details
  async validateNominee(nominee: InsuranceNominee): Promise<{ valid: boolean; errors: string[] }> {
    await delay(400);

    const errors: string[] = [];

    if (!nominee.name || nominee.name.trim().length < 2) {
      errors.push('Nominee name must be at least 2 characters long');
    }

    if (!nominee.relationship) {
      errors.push('Relationship with nominee is required');
    }

    if (!nominee.dateOfBirth) {
      errors.push('Nominee date of birth is required');
    } else {
      const age = new Date().getFullYear() - new Date(nominee.dateOfBirth).getFullYear();
      if (age < 18) {
        errors.push('Nominee must be at least 18 years old');
      }
    }

    if (!nominee.contactNumber || !/^\+?[0-9]{10,15}$/.test(nominee.contactNumber)) {
      errors.push('Valid contact number is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private initializeMockPlans() {
    this.plans = [
      {
        id: 'basic_travel',
        name: 'Basic Travel Insurance',
        coverage: {
          medicalExpenses: 500000,
          tripCancellation: 50000,
          lostBaggage: 25000,
          personalAccident: 1000000,
          emergencyAssistance: true,
        },
        duration: {
          minDays: 1,
          maxDays: 90,
        },
        premium: {
          amount: 500,
          currency: 'INR',
          frequency: 'one-time',
        },
        destinations: ['Asia', 'Europe', 'Americas'],
        maxAge: 70,
        termsAndConditions: 'Standard terms apply. Coverage excludes pre-existing conditions.',
      },
      {
        id: 'premium_travel',
        name: 'Premium Travel Insurance',
        coverage: {
          medicalExpenses: 2000000,
          tripCancellation: 200000,
          lostBaggage: 100000,
          personalAccident: 5000000,
          emergencyAssistance: true,
        },
        duration: {
          minDays: 1,
          maxDays: 180,
        },
        premium: {
          amount: 1500,
          currency: 'INR',
          frequency: 'one-time',
        },
        destinations: ['Worldwide'],
        maxAge: 80,
        termsAndConditions: 'Comprehensive coverage including COVID-19 related expenses.',
      },
      {
        id: 'student_travel',
        name: 'Student Travel Insurance',
        coverage: {
          medicalExpenses: 1000000,
          tripCancellation: 100000,
          lostBaggage: 50000,
          personalAccident: 2000000,
          emergencyAssistance: true,
        },
        duration: {
          minDays: 30,
          maxDays: 365,
        },
        premium: {
          amount: 800,
          currency: 'INR',
          frequency: 'annual',
        },
        destinations: ['Worldwide'],
        maxAge: 30,
        termsAndConditions: 'Designed for students. Includes study interruption coverage.',
      },
    ];
  }

  private findSuitablePlan(tripDetails: TravelInsuranceQuoteRequest['tripDetails']): TravelInsurancePlan | null {
    const tripDuration = Math.ceil(
      (new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return this.plans.find(plan =>
      tripDuration >= plan.duration.minDays &&
      tripDuration <= plan.duration.maxDays &&
      plan.destinations.some(dest =>
        tripDetails.destination.toLowerCase().includes(dest.toLowerCase()) ||
        dest === 'Worldwide'
      )
    ) || null;
  }

  private calculatePremium(plan: TravelInsurancePlan, request: TravelInsuranceQuoteRequest): number {
    let premium = plan.premium.amount;

    // Adjust based on number of travellers
    premium *= request.tripDetails.numberOfTravellers;

    // Adjust based on trip duration
    const tripDays = Math.ceil(
      (new Date(request.tripDetails.endDate).getTime() - new Date(request.tripDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    premium *= Math.max(1, tripDays / 30); // Pro-rate for longer trips

    // Adjust based on destination risk
    const highRiskDestinations = ['Afghanistan', 'Iraq', 'Syria', 'Somalia'];
    if (highRiskDestinations.some(dest => request.tripDetails.destination.toLowerCase().includes(dest.toLowerCase()))) {
      premium *= 2;
    }

    return Math.round(premium);
  }
}

export const travelInsuranceApiService = new TravelInsuranceApiService();
