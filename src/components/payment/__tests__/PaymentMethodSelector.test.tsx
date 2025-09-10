import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { PaymentMethodSelector } from '../PaymentMethodSelector';
import { PaymentSDKContext } from '@/contexts/PaymentSDKContext';

const mockSelectPaymentMethod = jest.fn();

const renderWithContext = (selectedMethodId = null) => {
  const contextValue = {
    config: null,
    session: null,
    paymentMethods: [
      { id: 'card', name: 'Card', description: 'Card payment', enabled: true, icon: 'C', type: 'card' as const },
      { id: 'upi', name: 'UPI', description: 'UPI payment', enabled: true, icon: 'U', type: 'upi' as const },
      { id: 'fxdebitcard', name: 'FX Debit Card', description: 'FX Debit Card payment', enabled: true, icon: 'F', type: 'fxdebitcard' as const },
    ],
    checkoutState: {
      loading: false,
      selectedMethod: selectedMethodId ? { id: selectedMethodId, name: '', icon: '', enabled: true, type: 'card' as const } : null,
      mode: 'full' as const,
      currentStep: 'methods' as const,
      savedCards: [],
    },
    initializeSDK: jest.fn(),
    startCheckout: jest.fn(),
    selectPaymentMethod: mockSelectPaymentMethod,
    processPayment: jest.fn(),
    resetCheckout: jest.fn(),
  };

  return render(
    <PaymentSDKContext.Provider value={contextValue}>
      <PaymentMethodSelector />
    </PaymentSDKContext.Provider>
  );
};

describe('PaymentMethodSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment methods including FX Debit Card', () => {
    renderWithContext();
    expect(screen.getByText('Choose Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('UPI')).toBeInTheDocument();
    expect(screen.getByText('FX Debit Card')).toBeInTheDocument();
  });

  it('calls selectPaymentMethod when a payment method is clicked', () => {
    renderWithContext();
    const fxCard = screen.getByText('FX Debit Card');
    fireEvent.click(fxCard);
    expect(mockSelectPaymentMethod).toHaveBeenCalledWith(expect.objectContaining({ id: 'fxdebitcard' }));
  });

  it('disables selection for disabled payment methods', () => {
    const contextValue = {
      config: null,
      session: null,
      paymentMethods: [
        { id: 'card', name: 'Card', description: 'Card payment', enabled: false, icon: 'C', type: 'card' },
      ],
      checkoutState: {
        loading: false,
        selectedMethod: null,
        mode: 'full' as const,
        currentStep: 'methods' as const,
        savedCards: [],
      },
      initializeSDK: jest.fn(),
      startCheckout: jest.fn(),
      selectPaymentMethod: mockSelectPaymentMethod,
      processPayment: jest.fn(),
      resetCheckout: jest.fn(),
    };

    render(
      <PaymentSDKContext.Provider value={contextValue}>
        <PaymentMethodSelector />
      </PaymentSDKContext.Provider>
    );

    const card = screen.getByText('Card');
    fireEvent.click(card);
    expect(mockSelectPaymentMethod).not.toHaveBeenCalled();
  });

  it('shows loading state when loading', () => {
    const contextValue = {
      config: null,
      session: null,
      paymentMethods: [],
      checkoutState: {
        loading: true,
        selectedMethod: null,
        mode: 'full' as const,
        currentStep: 'methods' as const,
        savedCards: [],
      },
      initializeSDK: jest.fn(),
      startCheckout: jest.fn(),
      selectPaymentMethod: mockSelectPaymentMethod,
      processPayment: jest.fn(),
      resetCheckout: jest.fn(),
    };

    render(
      <PaymentSDKContext.Provider value={contextValue}>
        <PaymentMethodSelector />
      </PaymentSDKContext.Provider>
    );

    expect(screen.getAllByText(/loading/i).length).toBeGreaterThan(0);
  });

  it('shows no payment methods message when none available', () => {
    const contextValue = {
      config: null,
      session: null,
      paymentMethods: [],
      checkoutState: {
        loading: false,
        selectedMethod: null,
        mode: 'full' as const,
        currentStep: 'methods' as const,
        savedCards: [],
      },
      initializeSDK: jest.fn(),
      startCheckout: jest.fn(),
      selectPaymentMethod: mockSelectPaymentMethod,
      processPayment: jest.fn(),
      resetCheckout: jest.fn(),
    };

    render(
      <PaymentSDKContext.Provider value={contextValue}>
        <PaymentMethodSelector />
      </PaymentSDKContext.Provider>
    );

    expect(screen.getByText('No payment methods available')).toBeInTheDocument();
  });
});
