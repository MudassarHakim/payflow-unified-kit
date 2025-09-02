import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { CheckCircle, XCircle, Clock, Download, Share2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentResultProps {
  className?: string;
}

export function PaymentResult({ className }: PaymentResultProps) {
  const { checkoutState, resetCheckout } = usePaymentSDK();
  
  // Mock payment result for demo
  const paymentResult = {
    paymentId: 'pay_123456789',
    status: 'success' as 'success' | 'failed' | 'pending',
    amount: 49999,
    currency: 'INR',
    paymentMethod: checkoutState.selectedMethod?.name || 'Card',
    message: 'Payment completed successfully',
    timestamp: new Date(),
  };

  const getStatusIcon = () => {
    switch (paymentResult.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-success" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-destructive" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-warning" />;
      default:
        return <Clock className="w-16 h-16 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (paymentResult.status) {
      case 'success':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = () => {
    switch (paymentResult.status) {
      case 'success':
        return <Badge className="bg-success text-success-foreground">Successful</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDownloadReceipt = () => {
    // Mock download functionality
    console.log('Downloading receipt...');
  };

  const handleShareReceipt = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Payment Receipt',
        text: `Payment of ${formatAmount(paymentResult.amount, paymentResult.currency)} completed successfully`,
        url: window.location.href,
      });
    } else {
      console.log('Sharing receipt...');
    }
  };

  const handleNewPayment = () => {
    resetCheckout();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Card */}
      <Card className={cn(
        "text-center p-8",
        paymentResult.status === 'success' && "border-success/20 bg-success/5",
        paymentResult.status === 'failed' && "border-destructive/20 bg-destructive/5",
        paymentResult.status === 'pending' && "border-warning/20 bg-warning/5"
      )}>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>
          
          <div>
            <h2 className={cn("text-2xl font-bold mb-2", getStatusColor())}>
              {paymentResult.status === 'success' && 'Payment Successful!'}
              {paymentResult.status === 'failed' && 'Payment Failed'}
              {paymentResult.status === 'pending' && 'Payment Pending'}
            </h2>
            <p className="text-muted-foreground">
              {paymentResult.message}
            </p>
          </div>

          <div className="flex justify-center">
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-lg">
                {formatAmount(paymentResult.amount, paymentResult.currency)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{paymentResult.paymentMethod}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{paymentResult.paymentId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{formatDate(paymentResult.timestamp)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message for Card */}
      {paymentResult.status === 'success' && (
        <Card className="bg-gradient-to-r from-success/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-success mt-0.5" />
              <div>
                <h4 className="font-semibold text-success mb-1">Transaction Complete</h4>
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed successfully. You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleDownloadReceipt}
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={handleShareReceipt}
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
        
        <Button
          className="w-full flex items-center justify-center space-x-2"
          onClick={handleNewPayment}
        >
          <Home className="w-4 h-4" />
          <span>Make Another Payment</span>
        </Button>
      </div>

      {/* Support Information */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@bank.com" className="text-primary hover:underline">
              support@bank.com
            </a>{' '}
            or call{' '}
            <a href="tel:+911800123456" className="text-primary hover:underline">
              1800-123-456
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}