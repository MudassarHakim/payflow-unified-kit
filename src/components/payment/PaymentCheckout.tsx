import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { CardPayment } from './CardPayment';
import { UPIPayment } from './UPIPayment';
import { NetBankingPayment } from './NetBankingPayment';
import { PaymentResult } from './PaymentResult';
import { ArrowLeft, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentCheckoutProps {
  className?: string;
  order: {
    amount: number;
    currency: string;
    description?: string;
  };
  onClose?: () => void;
}

export function PaymentCheckout({ className, order, onClose }: PaymentCheckoutProps) {
  const { checkoutState, resetCheckout, initializeSDK, startCheckout, config } = usePaymentSDK();

  // Auto-initialize SDK and start checkout when component mounts
  useEffect(() => {
    const initializeAndStart = async () => {
      try {
        if (!config) {
          // Initialize SDK with demo config
          await initializeSDK({
            merchantId: 'demo_merchant_123',
            publicKey: 'pk_demo_key',
            environment: 'sandbox',
            theme: {
              primaryColor: '#2563eb',
              borderRadius: 'md',
            }
          });
        }
        
        // Start checkout with the order
        await startCheckout({
          orderId: `order_${Date.now()}`,
          amount: order.amount,
          currency: order.currency,
          description: order.description,
          customerId: 'demo_customer_123', // Demo customer to show saved cards
        });
      } catch (error) {
        console.error('Failed to initialize checkout:', error);
      }
    };

    initializeAndStart();
  }, [config, initializeSDK, startCheckout, order]);

  const handleBack = () => {
    if (checkoutState.currentStep === 'payment') {
      // Go back to method selection
      resetCheckout();
    } else if (onClose) {
      onClose();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const renderPaymentStep = () => {
    switch (checkoutState.currentStep) {
      case 'methods':
        return <PaymentMethodSelector />;
      
      case 'payment':
        if (!checkoutState.selectedMethod) return null;
        
        switch (checkoutState.selectedMethod.type) {
          case 'card':
            return <CardPayment />;
          case 'upi':
            return <UPIPayment />;
          case 'netbanking':
            return <NetBankingPayment />;
          default:
            return (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {checkoutState.selectedMethod.name} integration coming soon
                </p>
              </div>
            );
        }
      
      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Processing Payment
            </h3>
            <p className="text-muted-foreground">
              Please wait while we process your payment...
            </p>
          </div>
        );
      
      case 'result':
        return <PaymentResult />;
      
      default:
        return null;
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Session: 15:00</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Order Summary</h3>
              <p className="text-sm text-muted-foreground">
                {order.description || 'Payment for order'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatAmount(order.amount, order.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {checkoutState.mode === 'quick' ? 'Quick Checkout' : 'Full Checkout'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Indicator */}
      {checkoutState.currentStep !== 'result' && (
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            {['methods', 'payment', 'processing'].map((step, index) => {
              const isActive = checkoutState.currentStep === step;
              const isCompleted = ['methods', 'payment', 'processing'].indexOf(checkoutState.currentStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2 transition-colors",
                        isCompleted ? "bg-success" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Step Content */}
      <div className="min-h-[400px]">
        {renderPaymentStep()}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>PCI DSS Compliant</span>
          </div>
          <div>•</div>
          <div>256-bit SSL Encryption</div>
          <div>•</div>
          <div>RBI Approved</div>
        </div>
      </div>
    </div>
  );
}