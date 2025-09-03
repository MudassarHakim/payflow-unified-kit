import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { PaymentMethod } from '@/types/payment';
import { cn } from '@/lib/utils';

interface PaymentMethodSelectorProps {
  className?: string;
}

export function PaymentMethodSelector({ className }: PaymentMethodSelectorProps) {
  const { paymentMethods, checkoutState, selectPaymentMethod } = usePaymentSDK();

  console.log('PaymentMethodSelector render:', { 
    paymentMethods, 
    checkoutState,
    paymentMethodsLength: paymentMethods.length 
  });

  const handleMethodSelect = (method: PaymentMethod) => {
    console.log('Method selected:', method);
    if (method.enabled) {
      selectPaymentMethod(method);
    }
  };

  if (checkoutState.loading) {
    console.log('PaymentMethodSelector showing loading state');
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (paymentMethods.length === 0 && !checkoutState.loading) {
    console.log('No payment methods available');
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No payment methods available</p>
          <p className="text-sm text-muted-foreground mt-2">Please try again or contact support</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Choose Payment Method
        </h2>
        <p className="text-muted-foreground">
          {checkoutState.mode === 'quick' ? 'Quick checkout available' : 'Select your preferred payment method'}
        </p>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all duration-200 border-2",
              method.enabled
                ? "hover:shadow-md hover:border-primary/20 hover:scale-[1.02]"
                : "opacity-50 cursor-not-allowed",
              checkoutState.selectedMethod?.id === method.id && "border-primary bg-primary/5"
            )}
            onClick={() => handleMethodSelect(method)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {method.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.enabled && (
                    <Badge variant="destructive">Unavailable</Badge>
                  )}
                  <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                    {checkoutState.selectedMethod?.id === method.id && (
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checkoutState.selectedMethod && (
        <div className="mt-6 animate-fade-in">
          <Button 
            className="w-full h-12 text-lg font-semibold"
            onClick={() => {/* Will be handled by parent component */}}
          >
            Continue with {checkoutState.selectedMethod.name}
          </Button>
        </div>
      )}
    </div>
  );
}