/**
 * EMI Payment Component Tests
 * Comprehensive test coverage for EMI payment UI component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EMIPayment } from '../EMIPayment';
import { PaymentSDKProvider } from '@/contexts/PaymentSDKContext';
import { emiApiService } from '@/services/emiApi';

// Mock the EMI API service
jest.mock('@/services/emiApi', () => ({
  emiApiService: {
    getEMIProviders: jest.fn(),
    getEMIPlans: jest.fn(),
    validateEMIPayment: jest.fn(),
  }
}));

// Mock the payment SDK context
const mockProcessPayment = jest.fn();
const mockCheckoutState = {
  loading: false,
  selectedMethod: { type: 'bnpl', name: 'EMI' },
  currentStep: 'payment'
};

jest.mock('@/contexts/PaymentSDKContext', () => ({
  usePaymentSDK: () => ({
    processPayment: mockProcessPayment,
    checkoutState: mockCheckoutState
  }),
  PaymentSDKProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockProviders = [
  {
    id: 'hdfc-emi',
    name: 'HDFC Bank',
    logo: '🏦',
    minAmount: 1000,
    maxAmount: 500000,
    supportedTenures: [3, 6, 12],
    interestRates: { 3: 12, 6: 13, 12: 14 },
    processingFee: 99,
    enabled: true
  }
];

const mockPlans = [
  {
    providerId: 'hdfc-emi',
    providerName: 'HDFC Bank',
    tenure: 3,
    interestRate: 12,
    monthlyAmount: 3450,
    totalAmount: 10350,
    processingFee: 99,
    totalInterest: 351,
    emiAmount: 3450
  },
  {
    providerId: 'hdfc-emi',
    providerName: 'HDFC Bank',
    tenure: 6,
    interestRate: 13,
    monthlyAmount: 1783,
    totalAmount: 10698,
    processingFee: 99,
    totalInterest: 699,
    emiAmount: 1783
  }
];

describe('EMIPayment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emiApiService.getEMIProviders as jest.Mock).mockResolvedValue(mockProviders);
    (emiApiService.getEMIPlans as jest.Mock).mockResolvedValue(mockPlans);
    (emiApiService.validateEMIPayment as jest.Mock).mockResolvedValue({ valid: true });
  });

  const renderComponent = (props = {}) => {
    return render(
      <PaymentSDKProvider>
        <EMIPayment orderAmount={10000} {...props} />
      </PaymentSDKProvider>
    );
  };

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Loading EMI options...')).toBeInTheDocument();
  });

  it('should load and display EMI providers and plans', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Choose Your EMI Plan')).toBeInTheDocument();
    });

    expect(emiApiService.getEMIProviders).toHaveBeenCalled();
    expect(emiApiService.getEMIPlans).toHaveBeenCalledWith(10000);
  });

  it('should display EMI plans with correct information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    expect(screen.getByText('3 months')).toBeInTheDocument();
    expect(screen.getByText('6 months')).toBeInTheDocument();
    expect(screen.getAllByText('₹3,450')).toHaveLength(2); // Monthly amount and in plan
  });

  it('should allow plan selection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);

    expect(planRadio).toBeChecked();
  });

  it('should show cost comparison when plan is selected', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);

    await waitFor(() => {
      expect(screen.getByText('Cost Comparison')).toBeInTheDocument();
    });

    expect(screen.getByText('Pay Full Amount')).toBeInTheDocument();
    expect(screen.getByText('EMI Total Cost')).toBeInTheDocument();
  });

  it('should require terms acceptance before payment', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);

    const payButton = screen.getByText(/Pay ₹3,450\/month/);
    expect(payButton).toBeDisabled();

    // Accept terms
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    expect(payButton).not.toBeDisabled();
  });

  it('should show terms and conditions when checkbox is checked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    expect(screen.getByText(/By selecting EMI, you agree to pay/)).toBeInTheDocument();
  });

  it('should process payment when form is valid', async () => {
    mockProcessPayment.mockResolvedValue({ status: 'success' });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    // Select plan
    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);

    // Accept terms
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // Click pay button
    const payButton = screen.getByText(/Pay ₹3,450\/month/);
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledWith({
        type: 'bnpl',
        emiData: expect.objectContaining({
          providerId: 'hdfc-emi',
          tenure: 3,
          emiAmount: 3450,
          totalAmount: 10350
        }),
        amount: 10000
      });
    });
  });

  it('should show processing state during payment', async () => {
    mockProcessPayment.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    // Select plan and accept terms
    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);

    // Click pay button
    const payButton = screen.getByText(/Pay ₹3,450\/month/);
    fireEvent.click(payButton);

    expect(screen.getByText('Processing EMI...')).toBeInTheDocument();
  });

  it('should handle payment errors', async () => {
    mockProcessPayment.mockRejectedValue(new Error('Payment failed'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    // Complete payment flow
    const planRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(planRadio);
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    const payButton = screen.getByText(/Pay ₹3,450\/month/);
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText('Payment failed')).toBeInTheDocument();
    });
  });

  it('should display error when EMI plans fail to load', async () => {
    (emiApiService.getEMIPlans as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load EMI plans')).toBeInTheDocument();
    });
  });

  it('should format amounts correctly in Indian Rupees', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
    });

    expect(screen.getByText('₹3,450')).toBeInTheDocument();
    expect(screen.getByText('₹10,350')).toBeInTheDocument();
  });

  it('should show EMI information footer', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('EMI Information')).toBeInTheDocument();
    });

    expect(screen.getByText(/RBI-compliant financial institutions/)).toBeInTheDocument();
  });
});
