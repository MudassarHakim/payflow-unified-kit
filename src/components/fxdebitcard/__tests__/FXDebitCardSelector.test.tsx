import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FXDebitCardSelector from '../FXDebitCardSelector';

// Mock the context
const mockContext = {
  config: {},
  session: {},
  paymentMethods: [
    {
      id: 'fxdebitcard',
      type: 'fxdebitcard' as const,
      name: 'FX Debit Card',
      icon: '💎',
      enabled: true,
      description: 'Zero FX markup on international transactions'
    }
  ],
  checkoutState: {
    loading: false,
    selectedMethod: null,
    mode: 'full' as const,
    currentStep: 'methods' as const,
    savedCards: []
  },
  selectPaymentMethod: jest.fn(),
  resetCheckout: jest.fn()
};

jest.mock('@/contexts/PaymentSDKContext', () => ({
  usePaymentSDK: () => mockContext
}));

describe('FXDebitCardSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders FX Debit Card option', () => {
    render(<FXDebitCardSelector />);

    expect(screen.getByText('FX Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Zero FX markup on international transactions')).toBeInTheDocument();
  });

  it('calls selectPaymentMethod when FX Debit Card is clicked', () => {
    render(<FXDebitCardSelector />);

    const fxCardButton = screen.getByRole('button', { name: /Select FX Debit Card/i });
    fireEvent.click(fxCardButton);

    expect(mockContext.selectPaymentMethod).toHaveBeenCalledWith('fxdebit');
  });

  it('shows loading state when checkout is loading', () => {
    const loadingContext = {
      ...mockContext,
      checkoutState: {
        ...mockContext.checkoutState,
        loading: true
      }
    };

    jest.mocked(jest.requireMock('@/contexts/PaymentSDKContext')).usePaymentSDK.mockReturnValue(loadingContext);

    render(<FXDebitCardSelector />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
