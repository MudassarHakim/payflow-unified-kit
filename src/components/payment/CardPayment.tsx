import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { cn } from '@/lib/utils';
import { CreditCard, Shield, Lock } from 'lucide-react';

interface CardPaymentProps {
  className?: string;
}

export function CardPayment({ className }: CardPaymentProps) {
  const { processPayment, checkoutState } = usePaymentSDK();
  const [cardData, setCardData] = React.useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    saveCard: false,
  });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showHCC, setShowHCC] = React.useState(false);
  const [expiryError, setExpiryError] = React.useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    value = value.substring(0, 16);
    // Add spaces every 4 digits
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardData(prev => ({ ...prev, cardNumber: value }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    const [month, year] = value.split('/');
    
    // Clear previous error
    setExpiryError('');
    
    setCardData(prev => ({ 
      ...prev, 
      expiryMonth: month || '',
      expiryYear: year || ''
    }));
    
    // Validate expiry date if both month and year are entered
    if (month && year && month.length === 2 && year.length === 2) {
      validateExpiryDate(month, year);
    }
  };
  
  const validateExpiryDate = (month: string, year: string) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits of year
    
    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt(year, 10);
    
    // Check if month is valid (1-12)
    if (expiryMonth < 1 || expiryMonth > 12) {
      setExpiryError('Invalid month');
      return false;
    }
    
    // Check if the expiry date is in the past
    if ((expiryYear < currentYear) || 
        (expiryYear === currentYear && expiryMonth < currentMonth)) {
      setExpiryError('Card has expired');
      return false;
    }
    
    return true;
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    setCardData(prev => ({ ...prev, cvv: value }));
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('6')) return 'rupay';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // In real implementation, this would open HCC
      setShowHCC(true);
      
      // Simulate HCC process
      setTimeout(async () => {
        setShowHCC(false);
        const result = await processPayment({
          type: 'card',
          ...cardData,
        });
        console.log('Payment result:', result);
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = cardData.cardNumber.replace(/\s/g, '').length >= 13 &&
                     cardData.expiryMonth &&
                     cardData.expiryYear &&
                     !expiryError &&
                     cardData.cvv.length >= 3 &&
                     cardData.holderName.trim();

  if (showHCC) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-2 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Secure Payment Processing
            </h3>
            <p className="text-muted-foreground mb-4">
              You will be redirected to our secure payment page
            </p>
            <div className="animate-pulse flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="mt-6 p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-accent">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">256-bit SSL Encrypted</span>
              </div>
            </div>
          </CardContent>
        </Card>
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
          Enter your card details securely
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Card Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                className="pr-16"
              />
              {cardData.cardNumber && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs">
                    {getCardBrand(cardData.cardNumber).toUpperCase()}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardData.expiryMonth + (cardData.expiryYear ? '/' + cardData.expiryYear : '')}
                onChange={handleExpiryChange}
                className={cn(
                  expiryError && "border-destructive"
                )}
              />
              {expiryError && (
                <p className="text-sm text-destructive">
                  {expiryError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cardData.cvv}
                onChange={handleCVVChange}
                type="password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName">Cardholder Name</Label>
            <Input
              id="holderName"
              placeholder="John Doe"
              value={cardData.holderName}
              onChange={(e) => setCardData(prev => ({ ...prev, holderName: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveCard"
              checked={cardData.saveCard}
              onCheckedChange={(checked) => 
                setCardData(prev => ({ ...prev, saveCard: checked as boolean }))
              }
            />
            <Label htmlFor="saveCard" className="text-sm">
              Save this card for future payments
            </Label>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg">
            <div className="flex items-center space-x-2 text-accent mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Your payment is secured</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your card details are encrypted and processed through our PCI DSS compliant secure servers.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full h-12 text-lg font-semibold"
        onClick={handlePayment}
        disabled={!isFormValid || isProcessing || checkoutState.loading}
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