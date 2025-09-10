import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Smartphone,
  Mail,
  MapPin,
  User,
  Star,
  Gift,
  Truck,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckoutItem {
  id: string;
  name: string;
  type: 'card' | 'insurance' | 'addon';
  price: number;
  quantity: number;
  description?: string;
}

export interface CheckoutData {
  customerId: string;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  deliveryAddress: {
    name: string;
    address: string;
    phone: string;
  };
  paymentMethod: 'wallet' | 'card' | 'netbanking' | 'upi';
}

interface FXDebitCardCheckoutProps {
  checkoutData?: CheckoutData;
  onPaymentSuccess?: (transactionId: string) => void;
  onPaymentFailure?: (error: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  className?: string;
}

const FXDebitCardCheckout: React.FC<FXDebitCardCheckoutProps> = ({
  checkoutData,
  onPaymentSuccess,
  onPaymentFailure,
  onCancel,
  onClose,
  className
}) => {
  // Default checkout data for demo purposes
  const defaultCheckoutData: CheckoutData = {
    customerId: 'CUST_123456',
    items: [
      {
        id: 'fx_debit_card',
        name: '0 FX Debit Card',
        type: 'card',
        price: 499,
        quantity: 1,
        description: 'Zero markup on international transactions'
      },
      {
        id: 'travel_insurance',
        name: 'Travel Insurance Add-on',
        type: 'insurance',
        price: 299,
        quantity: 1,
        description: 'Comprehensive travel coverage'
      }
    ],
    subtotal: 798,
    discount: 50,
    tax: 80,
    total: 828,
    deliveryAddress: {
      name: 'John Doe',
      address: '123 Main Street, Mumbai, Maharashtra 400001',
      phone: '+91 9876543210'
    },
    paymentMethod: 'wallet'
  };

  const finalCheckoutData = checkoutData || defaultCheckoutData;
  const finalOnCancel = onCancel || onClose || (() => {});
  const finalOnPaymentSuccess = onPaymentSuccess || ((transactionId: string) => {
    console.log('Payment successful:', transactionId);
  });
  const finalOnPaymentFailure = onPaymentFailure || ((error: string) => {
    console.error('Payment failed:', error);
  });
  const [currentStep, setCurrentStep] = useState<'review' | 'mpin' | 'processing' | 'complete'>('review');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [mpinAttempts, setMpinAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const maxMpinAttempts = 3;

  useEffect(() => {
    if (currentStep === 'processing') {
      processPayment();
    }
  }, [currentStep]);

  const processPayment = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // TODO: Replace with actual EN stack API call for payment processing
      // Example:
      // const response = await enApi.processPayment(finalCheckoutData);
      // if (response.success) {
      //   setTransactionId(response.transactionId);
      //   setCurrentStep('complete');
      //   finalOnPaymentSuccess(response.transactionId);
      // } else {
      //   throw new Error(response.errorMessage);
      // }

      // For now, simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTransactionId(mockTransactionId);
      setCurrentStep('complete');
      finalOnPaymentSuccess(mockTransactionId);
    } catch (err) {
      console.error('Payment processing failed:', err);
      setError('Payment processing failed. Please try again.');
      finalOnPaymentFailure(err.message || 'Payment processing failed');
      setCurrentStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMpinSubmit = async () => {
    if (!mpin || mpin.length !== 4) {
      setError('Please enter a valid 4-digit MPIN');
      return;
    }

    // Mock MPIN validation
    const isValidMpin = mpin === '1234'; // Mock valid MPIN

    if (isValidMpin) {
      setCurrentStep('processing');
      setError('');
    } else {
      const newAttempts = mpinAttempts + 1;
      setMpinAttempts(newAttempts);

      if (newAttempts >= maxMpinAttempts) {
        setError('Maximum MPIN attempts exceeded. Please try again later.');
        finalOnPaymentFailure('MPIN authentication failed');
      } else {
        setError(`Invalid MPIN. ${maxMpinAttempts - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleRetry = () => {
    setMpin('');
    setMpinAttempts(0);
    setError('');
    setCurrentStep('mpin');
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Order Review</h3>
        <p className="text-muted-foreground text-lg">
          Please review your order details before proceeding to payment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              {finalCheckoutData.items.length} item{finalCheckoutData.items.length !== 1 ? 's' : ''} in your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {finalCheckoutData.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {item.type === 'card' && <CreditCard className="w-5 h-5 text-primary" />}
                    {item.type === 'insurance' && <Shield className="w-5 h-5 text-primary" />}
                    {item.type === 'addon' && <Star className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                  {item.price > 0 && (
                    <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                  )}
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{finalCheckoutData.subtotal}</span>
              </div>
              {finalCheckoutData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{finalCheckoutData.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{finalCheckoutData.tax}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{finalCheckoutData.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Payment Info */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{finalCheckoutData.deliveryAddress.name}</p>
                <p className="text-sm text-muted-foreground">
                  {finalCheckoutData.deliveryAddress.address}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {finalCheckoutData.deliveryAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <span className="capitalize">{finalCheckoutData.paymentMethod}</span>
                </div>
                <Badge variant="secondary">Selected</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          {finalCheckoutData.discount > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Discount Applied</p>
                    <p className="text-sm text-green-700">
                      You saved ₹{finalCheckoutData.discount} on this order
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Terms Acceptance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="checkout-terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="checkout-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
              <p className="text-xs text-muted-foreground">
                By proceeding, you agree to our terms and conditions for this purchase.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel Order
        </Button>
        <Button
          onClick={() => setCurrentStep('mpin')}
          disabled={!acceptedTerms}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );

  const renderMpinStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Secure Payment</h3>
        <p className="text-muted-foreground text-lg">
          Enter your MPIN to authorize the payment
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>MPIN Authentication</CardTitle>
          <CardDescription>
            Enter your 4-digit MPIN to complete the transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mpin">MPIN</Label>
            <div className="relative">
              <Input
                id="mpin"
                type={showMpin ? "text" : "password"}
                placeholder="Enter 4-digit MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-lg tracking-widest"
                maxLength={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowMpin(!showMpin)}
              >
                {showMpin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>Attempts remaining: {maxMpinAttempts - mpinAttempts}</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleMpinSubmit}
              disabled={!mpin || mpin.length !== 4 || mpinAttempts >= maxMpinAttempts}
              className="w-full"
            >
              Authorize Payment
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentStep('review')}
              className="w-full"
            >
              Back to Review
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Secure Transaction</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your MPIN is encrypted and secure</li>
                <li>• Transaction is processed through secure channels</li>
                <li>• No payment information is stored</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Processing Payment</h3>
        <p className="text-muted-foreground text-lg">
          Please wait while we process your transaction
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="w-full" />

            <div className="text-sm text-muted-foreground">
              <p>Processing your payment...</p>
              <p className="font-medium">{Math.round(progress)}% complete</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Validating payment details</span>
            </div>
            {progress >= 25 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Processing transaction</span>
              </div>
            )}
            {progress >= 50 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Confirming with bank</span>
              </div>
            )}
            {progress >= 75 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Finalizing order</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h3 className="text-3xl font-bold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground text-lg mb-6">
          Your order has been processed successfully
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-semibold">{transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold">₹{checkoutData.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{checkoutData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A confirmation email has been sent to your registered email address
            </p>

            <div className="space-y-2">
              <Button className="w-full">
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full">
                Track Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">What's Next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Email Confirmation</p>
              <p className="text-xs text-muted-foreground">
                Check your email for order details
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Card Delivery</p>
              <p className="text-xs text-muted-foreground">
                Cards will be delivered in 7-10 days
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Activation</p>
              <p className="text-xs text-muted-foreground">
                Follow SMS instructions to activate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {/* Progress Indicator */}
      {currentStep !== 'complete' && (
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { step: 'review', label: 'Review' },
            { step: 'mpin', label: 'MPIN' },
            { step: 'processing', label: 'Processing' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
                currentStep === item.step
                  ? "bg-primary text-primary-foreground"
                  : index < ['review', 'mpin', 'processing'].indexOf(currentStep)
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-500"
              )}>
                <span>{index + 1}</span>
                <span>{item.label}</span>
              </div>
              {index < 2 && <div className="w-8 h-px bg-gray-300" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && currentStep !== 'mpin' && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'mpin' && renderMpinStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'complete' && renderCompleteStep()}

      {/* Retry Option for Failed MPIN */}
      {mpinAttempts >= maxMpinAttempts && currentStep === 'mpin' && (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Too Many Failed Attempts</h4>
            <p className="text-sm text-muted-foreground mb-4">
              You have exceeded the maximum number of MPIN attempts.
              Please try again after some time or contact customer support.
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Try Again
              </Button>
              <Button onClick={onCancel} className="w-full">
                Cancel Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FXDebitCardCheckout;
