import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, Globe, Star, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';

export interface CardOption {
  id: 'regular' | 'fxdebit';
  name: string;
  tagline: string;
  price: {
    amount: number;
    currency: string;
    period: string;
  };
  features: {
    name: string;
    included: boolean;
    highlight?: boolean;
  }[];
  benefits: string[];
  recommended?: boolean;
  icon: React.ReactNode;
}

interface FXDebitCardSelectorProps {
  className?: string;
}

const FXDebitCardSelector: React.FC<FXDebitCardSelectorProps> = ({ className }) => {
  const { checkoutState, selectPaymentMethod } = usePaymentSDK();
  const [selectedCard, setSelectedCard] = useState<'regular' | 'fxdebit' | undefined>(
    checkoutState.selectedMethod?.id === 'regular' || checkoutState.selectedMethod?.id === 'fxdebit'
      ? checkoutState.selectedMethod.id
      : undefined
  );

  const cardOptions: CardOption[] = [
    {
      id: 'regular',
      name: 'Regular Debit Card',
      tagline: 'Standard banking features',
      price: {
        amount: 0,
        currency: 'INR',
        period: 'Free',
      },
      features: [
        { name: 'Domestic transactions', included: true },
        { name: 'ATM withdrawals', included: true },
        { name: 'Online payments', included: true },
        { name: 'Contactless payments', included: true },
        { name: 'International transactions', included: false },
        { name: 'Zero FX markup', included: false },
        { name: 'Travel benefits', included: false },
        { name: 'Priority support', included: false },
      ],
      benefits: [
        'Free card issuance',
        'Standard transaction fees apply',
        'Basic card controls',
      ],
      icon: <CreditCard className="w-8 h-8" />,
    },
    {
      id: 'fxdebit',
      name: 'FX Debit Card',
      tagline: 'Zero FX markup on international transactions',
      price: {
        amount: 499,
        currency: 'INR',
        period: 'One-time',
      },
      features: [
        { name: 'Domestic transactions', included: true },
        { name: 'ATM withdrawals', included: true },
        { name: 'Online payments', included: true },
        { name: 'Contactless payments', included: true },
        { name: 'International transactions', included: true, highlight: true },
        { name: 'Zero FX markup', included: true, highlight: true },
        { name: 'Travel benefits', included: true, highlight: true },
        { name: 'Priority support', included: true },
      ],
      benefits: [
        'Zero FX markup on international transactions',
        'Free ATM withdrawals worldwide',
        'Travel insurance included',
        'Priority customer support',
        'Enhanced security features',
        'Real-time transaction alerts',
      ],
      recommended: true,
      icon: <Globe className="w-8 h-8" />,
    },
  ];

  useEffect(() => {
    const methodId = checkoutState.selectedMethod?.id;
    if (methodId === 'regular' || methodId === 'fxdebit') {
      setSelectedCard(methodId);
    } else {
      setSelectedCard(undefined);
    }
  }, [checkoutState.selectedMethod]);

  const handleCardSelect = (cardId: 'regular' | 'fxdebit') => {
    setSelectedCard(cardId);
    // Find the corresponding payment method object
    const paymentMethod = cardId === 'fxdebit'
      ? { id: 'fxdebitcard', type: 'fxdebitcard' as const, name: 'FX Debit Card', icon: '💎', enabled: true, description: 'Zero FX markup on international transactions' }
      : { id: 'regular', type: 'card' as const, name: 'Regular Debit Card', icon: '💳', enabled: true, description: 'Standard debit card' };
    selectPaymentMethod(paymentMethod);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Debit Card
        </h2>
        <p className="text-muted-foreground text-lg">
          Select the card that best fits your spending needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {cardOptions.map((card) => (
          <Card
            key={card.id}
            className={cn(
              "relative cursor-pointer transition-all duration-300 border-2",
              selectedCard === card.id
                ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                : "border-border hover:border-primary/50 hover:shadow-md",
              card.recommended && "ring-2 ring-primary/20"
            )}
            onClick={() => handleCardSelect(card.id)}
          >
            {card.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-primary">
                  {card.icon}
                </div>
              </div>
              <CardTitle className="text-xl mb-2">{card.name}</CardTitle>
              <CardDescription className="text-base">{card.tagline}</CardDescription>

              <div className="mt-4">
                <div className="text-3xl font-bold text-primary">
                  {card.price.amount === 0 ? 'Free' : `₹${card.price.amount}`}
                </div>
                <div className="text-sm text-muted-foreground">{card.price.period}</div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Features
                </h4>
                <div className="space-y-2">
                  {card.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm",
                        feature.highlight && "font-semibold text-primary"
                      )}>
                        {feature.name}
                      </span>
                      {feature.included ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Benefits
                </h4>
                <ul className="space-y-1">
                  {card.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  className={cn(
                    "w-full",
                    selectedCard === card.id
                      ? "bg-primary text-primary-foreground"
                      : "variant-outline"
                  )}
                  variant={selectedCard === card.id ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardSelect(card.id);
                  }}
                >
                  {selectedCard === card.id ? (
                    <>
                      Selected
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Select {card.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCard && (
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <Info className="w-5 h-5 text-primary mr-2" />
                <span className="font-semibold text-primary">Next Steps</span>
              </div>
              <p className="text-muted-foreground mb-4">
                You've selected the <strong>{cardOptions.find(c => c.id === selectedCard)?.name}</strong>.
                Continue to complete your application and card setup.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <span>✓ Card Selection</span>
                <ArrowRight className="w-4 h-4" />
                <span>Address Verification</span>
                <ArrowRight className="w-4 h-4" />
                <span>Payment</span>
                <ArrowRight className="w-4 h-4" />
                <span>Card Activation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
        <p>
          * FX Debit Card offers zero foreign exchange markup on international transactions.
          Standard ATM fees may apply for non-partner ATMs. Travel insurance coverage up to ₹50 lakhs.
          Terms and conditions apply.
        </p>
      </div>
    </div>
  );
};

export default FXDebitCardSelector;
