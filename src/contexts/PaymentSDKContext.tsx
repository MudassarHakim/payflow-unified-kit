import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { PaymentSDKConfig, PaymentSession, PaymentOrder, CheckoutState, PaymentMethod, SavedCard, PaymentResult, PaymentError } from '@/types/payment';
import { mockApiService } from '@/services/mockApi';

interface PaymentSDKContextType {
  config: PaymentSDKConfig | null;
  session: PaymentSession | null;
  checkoutState: CheckoutState;
  paymentMethods: PaymentMethod[];
  initializeSDK: (config: PaymentSDKConfig) => Promise<void>;
  startCheckout: (order: PaymentOrder) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => void;
  processPayment: (paymentData: any) => Promise<PaymentResult>;
  resetCheckout: () => void;
}

const PaymentSDKContext = createContext<PaymentSDKContextType | null>(null);

interface PaymentSDKState {
  config: PaymentSDKConfig | null;
  session: PaymentSession | null;
  checkoutState: CheckoutState;
  paymentMethods: PaymentMethod[];
  currentOrder: PaymentOrder | null;
}

type PaymentSDKAction =
  | { type: 'INITIALIZE_SDK'; payload: { config: PaymentSDKConfig; session: PaymentSession; methods: PaymentMethod[] } }
  | { type: 'START_CHECKOUT'; payload: { order: PaymentOrder; savedCards: SavedCard[] } }
  | { type: 'SELECT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: PaymentError | null }
  | { type: 'SET_STEP'; payload: CheckoutState['currentStep'] }
  | { type: 'RESET_CHECKOUT' };

const initialState: PaymentSDKState = {
  config: null,
  session: null,
  checkoutState: {
    mode: 'full',
    currentStep: 'methods',
    savedCards: [],
    loading: false,
  },
  paymentMethods: [],
  currentOrder: null,
};

function paymentSDKReducer(state: PaymentSDKState, action: PaymentSDKAction): PaymentSDKState {
  switch (action.type) {
    case 'INITIALIZE_SDK':
      return {
        ...state,
        config: action.payload.config,
        session: action.payload.session,
        paymentMethods: action.payload.methods,
      };
    
    case 'START_CHECKOUT':
      const mode = action.payload.savedCards.length > 0 ? 'quick' : 'full';
      return {
        ...state,
        currentOrder: action.payload.order,
        checkoutState: {
          mode,
          currentStep: 'methods',
          savedCards: action.payload.savedCards,
          loading: false,
        },
      };

    case 'SELECT_METHOD':
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          selectedMethod: action.payload,
          currentStep: 'payment',
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          loading: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          error: action.payload || undefined,
          loading: false,
        },
      };

    case 'SET_STEP':
      return {
        ...state,
        checkoutState: {
          ...state.checkoutState,
          currentStep: action.payload,
        },
      };

    case 'RESET_CHECKOUT':
      return {
        ...state,
        checkoutState: {
          mode: 'full',
          currentStep: 'methods',
          savedCards: [],
          loading: false,
        },
        currentOrder: null,
      };

    default:
      return state;
  }
}

export function PaymentSDKProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(paymentSDKReducer, initialState);

  const initializeSDK = useCallback(async (config: PaymentSDKConfig) => {
    console.log('initializeSDK called with:', config);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Simulate API call to initialize session
      console.log('Calling mockApiService.initializeSession...');
      const sessionData = await mockApiService.initializeSession(config);
      console.log('Session initialized:', sessionData);
      
      console.log('Calling mockApiService.getPaymentMethods...');
      const paymentMethods = await mockApiService.getPaymentMethods();
      console.log('Payment methods loaded:', paymentMethods);
      
      dispatch({
        type: 'INITIALIZE_SDK',
        payload: {
          config,
          session: sessionData,
          methods: paymentMethods,
        },
      });
    } catch (error) {
      console.error('SDK initialization failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'INIT_FAILED',
          message: 'Failed to initialize payment SDK',
          category: 'network',
          retryable: true,
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const startCheckout = useCallback(async (order: PaymentOrder) => {
    console.log('startCheckout called with:', order);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Get saved cards for the customer
      console.log('Getting saved cards for customer:', order.customerId);
      const savedCards = order.customerId 
        ? await mockApiService.getSavedCards(order.customerId)
        : [];
      console.log('Saved cards loaded:', savedCards);
      
      dispatch({
        type: 'START_CHECKOUT',
        payload: { order, savedCards },
      });
    } catch (error) {
      console.error('Checkout start failed:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'CHECKOUT_FAILED',
          message: 'Failed to start checkout',
          category: 'network',
          retryable: true,
        },
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    dispatch({ type: 'SELECT_METHOD', payload: method });
  }, []);

  const processPayment = useCallback(async (paymentData: any): Promise<PaymentResult> => {
    dispatch({ type: 'SET_STEP', payload: 'processing' });
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await mockApiService.processPayment({
        order: state.currentOrder!,
        method: state.checkoutState.selectedMethod!,
        paymentData,
      });
      
      dispatch({ type: 'SET_STEP', payload: 'result' });
      return result;
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'PAYMENT_FAILED',
        message: 'Payment processing failed',
        category: 'network',
        retryable: true,
      };
      dispatch({ type: 'SET_ERROR', payload: paymentError });
      throw paymentError;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentOrder, state.checkoutState.selectedMethod]);

  const resetCheckout = useCallback(() => {
    dispatch({ type: 'RESET_CHECKOUT' });
  }, []);

  const value: PaymentSDKContextType = {
    config: state.config,
    session: state.session,
    checkoutState: state.checkoutState,
    paymentMethods: state.paymentMethods,
    initializeSDK,
    startCheckout,
    selectPaymentMethod,
    processPayment,
    resetCheckout,
  };

  return (
    <PaymentSDKContext.Provider value={value}>
      {children}
    </PaymentSDKContext.Provider>
  );
}

export function usePaymentSDK() {
  const context = useContext(PaymentSDKContext);
  if (!context) {
    throw new Error('usePaymentSDK must be used within a PaymentSDKProvider');
  }
  return context;
}