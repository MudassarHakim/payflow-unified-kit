import React, { useState, useEffect } from 'react';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Globe, Shield, Zap, ArrowLeft } from 'lucide-react';

interface FXDebitCardCheckoutProps {
  onClose?: () => void;
}

const FXDebitCardCheckout: React.FC<FXDebitCardCheckoutProps> = ({ onClose }) => {
  const { checkoutState, selectPaymentMethod, paymentMethods, processPayment } = usePaymentSDK();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fxDebitCardMethod = paymentMethods.find(method => method.type === 'fxdebitcard');

  useEffect(() => {
    if (fxDebitCardMethod && checkoutState.currentStep === 'methods') {
      selectPaymentMethod(fxDebitCardMethod);
    }
  }, [fxDebitCardMethod, checkoutState.currentStep, selectPaymentMethod]);

  const handleProceed = async () => {
    if (!fxDebitCardMethod) {
      setError('FX Debit Card method not available');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Ensure the FX Debit Card method is selected before processing
      if (checkoutState.selectedMethod?.id !== fxDebitCardMethod.id) {
        selectPaymentMethod(fxDebitCardMethod);
        // Wait a moment for the state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Prepare FX Debit Card payment data
      const paymentData = {
        cardType: 'fxdebit',
        amount: 499, // FX Debit Card fee
        currency: 'INR',
        description: 'FX Debit Card Issuance',
        features: [
          'zero_fx_markup',
          'international_transactions',
          'free_atm_withdrawals',
          'travel_insurance'
        ]
      };

      console.log('Processing FX Debit Card payment with data:', paymentData);
      const result = await processPayment(paymentData);
      console.log('FX Debit Card payment result:', result);

      if (result.status === 'success') {
        console.log('FX Debit Card payment successful:', result);
        // Payment successful, the context will handle the step transition
      } else if (result.status === 'requires_action') {
        console.log('FX Debit Card payment requires additional action:', result);
        // Handle cases that require additional user action (3DS, etc.)
      } else {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('FX Debit Card payment error:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Payment processing failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Show the FX Debit Card details when in methods step or when this method is selected
  if (checkoutState.currentStep === 'methods' || checkoutState.currentStep === 'payment') {
    return (
      <div className="space-y-6">
        {onClose && (
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
            💎
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            FX Debit Card
          </h3>
          <p className="text-muted-foreground">
            Zero FX markup on international transactions
          </p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm">Zero FX markup on international transactions</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Enhanced security with Mastercard protection</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm">Contactless payments supported</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Accepted worldwide at millions of locations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Card Benefits</CardTitle>
            <CardDescription>
              Why choose the FX Debit Card?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">International transactions</span>
              <Badge variant="secondary">0% FX markup</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">ATM withdrawals</span>
              <Badge variant="secondary">Free worldwide</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Online purchases</span>
              <Badge variant="secondary">Secure & instant</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Contactless payments</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handleProceed}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing...' : 'Get FX Debit Card'}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure payment processing powered by PaymentSDK
          </p>
        </div>
      </div>
    );
  }

  // Show processing or result states
  if (checkoutState.currentStep === 'processing') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto animate-pulse">
          💎
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Processing Payment
        </h3>
        <p className="text-muted-foreground mb-6">
          Please wait while we process your FX Debit Card payment...
        </p>
        <div className="w-full bg-secondary/20 rounded-full h-2 mb-4">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (checkoutState.currentStep === 'result') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto">
          ✅
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Payment Successful!
        </h3>
        <p className="text-muted-foreground mb-6">
          Your FX Debit Card has been successfully ordered.
        </p>
      </div>
    );
  }

  return null;
};

export default FXDebitCardCheckout;
