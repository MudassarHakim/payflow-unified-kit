import React, { useState } from 'react';
import { PaymentSDKProvider } from '@/contexts/PaymentSDKContext';
import { PaymentCheckout } from '@/components/payment/PaymentCheckout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Building2, Wallet, Timer, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [showCheckout, setShowCheckout] = useState(false);

  const paymentMethods = [
    { icon: CreditCard, name: 'Cards', description: 'Credit/Debit with 3DS2' },
    { icon: Smartphone, name: 'UPI', description: 'Intent, Collect, QR Code' },
    { icon: Building2, name: 'Net Banking', description: 'All major banks' },
    { icon: Wallet, name: 'Wallets', description: 'Digital wallet partners' },
    { icon: Timer, name: 'BNPL/EMI', description: 'Buy now, pay later' },
  ];

  const features = [
    { icon: Shield, title: 'PCI DSS Compliant', description: 'Bank-grade security' },
    { icon: Zap, title: 'Quick Checkout', description: 'Saved cards & tokens' },
    { icon: CreditCard, title: 'Network Tokenization', description: 'Secure card storage' },
  ];

  if (showCheckout) {
    return (
      <PaymentSDKProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-8 px-4">
          <PaymentCheckout
            order={{
              amount: 49999,
              currency: 'INR',
              description: 'Premium Plan Subscription',
            }}
            onClose={() => setShowCheckout(false)}
          />
        </div>
      </PaymentSDKProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-4" variant="secondary">
            Bank Payment SDK v1.0
          </Badge>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Next-Generation
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Payment SDK
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise-grade payment processing with advanced security, seamless UX, 
            and comprehensive payment method support for modern applications.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 h-auto"
            onClick={() => setShowCheckout(true)}
          >
            Try Demo Checkout
          </Button>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16">
          {paymentMethods.map((method, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardContent className="p-6">
                <method.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-to-br from-card to-accent/5 border-primary/10">
              <CardHeader>
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;