import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Globe,
  Plus,
  Minus,
  ShoppingCart,
  Gift,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Calculator,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardPurchaseItem {
  id: 'regular' | 'fxdebit';
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  benefits: string[];
  icon: React.ReactNode;
}

interface MultiCardPurchaseFlowProps {
  onPurchaseComplete: (items: CardPurchaseItem[], totalAmount: number) => void;
  className?: string;
}

const MultiCardPurchaseFlow: React.FC<MultiCardPurchaseFlowProps> = ({
  onPurchaseComplete,
  className
}) => {
  const [selectedCards, setSelectedCards] = useState<CardPurchaseItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const availableCards: Omit<CardPurchaseItem, 'quantity'>[] = [
    {
      id: 'regular',
      name: 'Regular Debit Card',
      price: 0,
      maxQuantity: 3,
      benefits: [
        'Free card issuance',
        'Standard banking features',
        'Domestic transactions',
        'ATM withdrawals',
      ],
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      id: 'fxdebit',
      name: 'FX Debit Card',
      price: 499,
      maxQuantity: 2,
      benefits: [
        'Zero FX markup internationally',
        'Free worldwide ATM withdrawals',
        'Travel insurance included',
        'Priority customer support',
      ],
      icon: <Globe className="w-6 h-6" />,
    },
  ];

  const addCard = (cardId: 'regular' | 'fxdebit') => {
    const card = availableCards.find(c => c.id === cardId);
    if (!card) return;

    setSelectedCards(prev => {
      const existing = prev.find(c => c.id === cardId);
      if (existing) {
        if (existing.quantity >= card.maxQuantity) return prev;
        return prev.map(c =>
          c.id === cardId
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      } else {
        return [...prev, { ...card, quantity: 1 }];
      }
    });
  };

  const removeCard = (cardId: 'regular' | 'fxdebit') => {
    setSelectedCards(prev =>
      prev.map(c =>
        c.id === cardId && c.quantity > 0
          ? { ...c, quantity: c.quantity - 1 }
          : c
      ).filter(c => c.quantity > 0)
    );
  };

  const updateQuantity = (cardId: 'regular' | 'fxdebit', quantity: number) => {
    const card = availableCards.find(c => c.id === cardId);
    if (!card || quantity < 0 || quantity > card.maxQuantity) return;

    setSelectedCards(prev => {
      if (quantity === 0) {
        return prev.filter(c => c.id !== cardId);
      }

      const existing = prev.find(c => c.id === cardId);
      if (existing) {
        return prev.map(c =>
          c.id === cardId
            ? { ...c, quantity }
            : c
        );
      } else {
        return [...prev, { ...card, quantity }];
      }
    });
  };

  const calculateSubtotal = () => {
    return selectedCards.reduce((total, card) => total + (card.price * card.quantity), 0);
  };

  const calculateDiscount = () => {
    if (promoCode.toLowerCase() === 'WELCOME50' && calculateSubtotal() >= 499) {
      return Math.min(50, calculateSubtotal() * 0.1); // 10% or ₹50, whichever is less
    }
    return 0;
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  const getTotalCards = () => {
    return selectedCards.reduce((total, card) => total + card.quantity, 0);
  };

  const applyPromoCode = () => {
    const discountAmount = calculateDiscount();
    setDiscount(discountAmount);
  };

  const handlePurchase = () => {
    if (selectedCards.length === 0) return;
    onPurchaseComplete(selectedCards, calculateTotal());
  };

  useEffect(() => {
    setDiscount(calculateDiscount());
  }, [promoCode, selectedCards]);

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const totalCards = getTotalCards();

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Build Your Card Package
        </h2>
        <p className="text-muted-foreground text-lg">
          Mix and match cards to create the perfect banking solution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Available Cards</h3>

          {availableCards.map((card) => {
            const selectedCard = selectedCards.find(c => c.id === card.id);
            const quantity = selectedCard?.quantity || 0;

            return (
              <Card key={card.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-primary">
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{card.name}</h4>
                        <p className="text-2xl font-bold text-primary">
                          {card.price === 0 ? 'Free' : `₹${card.price}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCard(card.id)}
                        disabled={quantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>

                      <Input
                        type="number"
                        min="0"
                        max={card.maxQuantity}
                        value={quantity}
                        onChange={(e) => updateQuantity(card.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCard(card.id)}
                        disabled={quantity >= card.maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <ul className="space-y-1 mb-4">
                    {card.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {quantity > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {quantity} selected
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
              <CardDescription>
                {totalCards} card{totalCards !== 1 ? 's' : ''} selected
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {selectedCards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No cards selected</p>
                  <p className="text-sm">Choose cards from the left to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {selectedCards.map((card) => (
                      <div key={card.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded flex items-center justify-center text-primary">
                            {card.icon}
                          </div>
                          <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {card.quantity} × ₹{card.price}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          ₹{card.price * card.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <Label htmlFor="promo">Promo Code</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="promo"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={applyPromoCode}
                        disabled={!promoCode}
                      >
                        Apply
                      </Button>
                    </div>
                    {promoCode && discount === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Invalid or ineligible promo code
                      </p>
                    )}
                  </div>

                  {/* Special Offers */}
                  {selectedCards.some(c => c.id === 'fxdebit') && (
                    <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Gift className="w-4 h-4 text-primary mr-2" />
                        <span className="font-semibold text-primary">Special Offer</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get complimentary travel insurance worth ₹2,499 with your FX Debit Card purchase!
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={selectedCards.length === 0}
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Package Benefits */}
          {selectedCards.length > 1 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Multi-Card Benefits</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Combined delivery for faster processing</li>
                  <li>• Unified account management</li>
                  <li>• Priority customer support</li>
                  <li>• Enhanced security features</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>Secure Processing</span>
          </div>
          <div className="flex items-center justify-center">
            <Calculator className="w-4 h-4 mr-2" />
            <span>No Hidden Fees</span>
          </div>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>Instant Activation</span>
          </div>
        </div>
        <p>
          * Prices are inclusive of all taxes. Cards will be delivered within 7-10 business days.
          Terms and conditions apply. Use promo code WELCOME50 for ₹50 off on orders above ₹499.
        </p>
      </div>
    </div>
  );
};

export default MultiCardPurchaseFlow;
