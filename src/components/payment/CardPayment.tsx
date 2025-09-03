import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { cn } from '@/lib/utils';
import { CreditCard, Shield, Lock, Plus, Check } from 'lucide-react';
import { SavedCard } from '@/types/payment';
import { mockApiService } from '@/services/mockApi';

interface CardPaymentProps {
  className?: string;
}

export function CardPayment({ className }: CardPaymentProps) {
  const { processPayment, checkoutState } = usePaymentSDK();
  const [selectedCard, setSelectedCard] = React.useState<SavedCard | null>(null);
  const [cvv, setCvv] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showHCC, setShowHCC] = React.useState(false);
  const [hccUrl, setHccUrl] = React.useState<string | null>(null);
  const [paymentMode, setPaymentMode] = React.useState<'saved' | 'new'>('saved');

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    setCvv(value);
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'rupay': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  const isCardExpired = (expiryMonth: string, expiryYear: string) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100;

    const expMonth = parseInt(expiryMonth, 10);
    const expYear = parseInt(expiryYear, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return true;
    }
    return false;
  };

  const selectSavedCard = (card: SavedCard) => {
    setSelectedCard(card);
    setCvv('');
    setPaymentMode('saved');
  };

  const handleAddNewCard = async () => {
    setIsProcessing(true);
    try {
      const { hccUrl } = await mockApiService.createHostedCardCapture();
      setHccUrl(hccUrl);
      setShowHCC(true);
      setPaymentMode('new');
    } catch (error) {
      console.error('Failed to create HCC session:', error);
      // Handle error - could show a toast or error message
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedCard) return;

    setIsProcessing(true);
    try {
      const result = await processPayment({
        type: 'card',
        tokenId: selectedCard.tokenId,
        cvv: cvv,
      });
      console.log('Payment result:', result);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };



  if (showHCC && hccUrl) {
    return (
      <div className={cn("space-y-6", className)}>
        <iframe
          src={hccUrl}
          title="Hosted Card Capture"
          className="w-full h-[600px] border rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={() => {
            // Add any onLoad logic if needed
          }}
        />
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setShowHCC(false);
            setPaymentMode('saved');
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Card Payment
        </h2>
        <p className="text-muted-foreground">
          Choose a saved card or add a new one
        </p>
      </div>

      {/* Saved Cards Section */}
      {checkoutState.savedCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Saved Cards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checkoutState.savedCards.map((card) => (
              <div
                key={card.tokenId}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  selectedCard?.tokenId === card.tokenId
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => selectSavedCard(card)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCardBrandIcon(card.brand)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          **** **** **** {card.last4}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {card.brand.toUpperCase()}
                        </Badge>
                        {isCardExpired(card.expiryMonth, card.expiryYear) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expires {card.expiryMonth}/{card.expiryYear}
                        {card.holderName && ` • ${card.holderName}`}
                      </div>
                    </div>
                  </div>
                  {selectedCard?.tokenId === card.tokenId && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CVV Input for Selected Card */}
      {selectedCard && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV for **** **** **** {selectedCard.last4}</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={handleCVVChange}
                type="password"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 3-4 digit security code from the back of your card
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Card Section */}
      <Card>
        <CardContent className="pt-6">
          <Button
            className="w-full h-12"
            variant="outline"
            onClick={handleAddNewCard}
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            You'll be redirected to our secure card capture page
          </p>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="p-4 bg-accent/10 rounded-lg">
        <div className="flex items-center space-x-2 text-accent mb-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Your payment is secured</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Card details are captured through our PCI DSS compliant secure servers.
          We never store your full card number or CVV.
        </p>
      </div>

      <Button
        className="w-full h-12 text-lg font-semibold"
        onClick={handlePayment}
        disabled={
          !selectedCard ||
          cvv.length < 3 ||
          isProcessing ||
          checkoutState.loading ||
          (selectedCard && isCardExpired(selectedCard.expiryMonth, selectedCard.expiryYear))
        }
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : (
          'Pay Securely'
        )}
      </Button>
    </div>
  );
}