import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { cn } from '@/lib/utils';
import { Smartphone, QrCode, Timer, CheckCircle } from 'lucide-react';

interface UPIPaymentProps {
  className?: string;
}

export function UPIPayment({ className }: UPIPaymentProps) {
  const { processPayment, checkoutState } = usePaymentSDK();
  const [upiData, setUpiData] = useState({
    vpa: '',
    selectedApp: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'vpa' | 'intent' | 'qr'>('intent');

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: 'bg-purple-500' },
    { id: 'googlepay', name: 'Google Pay', icon: '💰', color: 'bg-blue-500' },
    { id: 'paytm', name: 'Paytm', icon: '💳', color: 'bg-blue-600' },
    { id: 'bhim', name: 'BHIM', icon: '🏛️', color: 'bg-orange-500' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '🛒', color: 'bg-orange-600' },
  ];

  const handleVPAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiData(prev => ({ ...prev, vpa: e.target.value }));
  };

  const handleAppSelection = (appId: string) => {
    setUpiData(prev => ({ ...prev, selectedApp: appId }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await processPayment({
        type: 'upi',
        mode: paymentMode,
        ...upiData,
      });
      console.log('UPI Payment result:', result);
    } catch (error) {
      console.error('UPI Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isVPAValid = upiData.vpa.includes('@') && upiData.vpa.length > 5;
  const canProceed = paymentMode === 'vpa' ? isVPAValid : upiData.selectedApp;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          UPI Payment
        </h2>
        <p className="text-muted-foreground">
          Pay instantly using UPI
        </p>
      </div>

      <Tabs value={paymentMode} onValueChange={(value) => setPaymentMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intent" className="flex items-center space-x-1">
            <Smartphone className="w-4 h-4" />
            <span>UPI Apps</span>
          </TabsTrigger>
          <TabsTrigger value="vpa" className="flex items-center space-x-1">
            <QrCode className="w-4 h-4" />
            <span>UPI ID</span>
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center space-x-1">
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>Select UPI App</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {upiApps.map((app) => (
                  <Card
                    key={app.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2",
                      upiData.selectedApp === app.id
                        ? "border-primary bg-primary/5 scale-105"
                        : "hover:border-primary/20 hover:scale-102"
                    )}
                    onClick={() => handleAppSelection(app.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2", app.color)}>
                        <span className="text-2xl">{app.icon}</span>
                      </div>
                      <p className="font-medium text-sm">{app.name}</p>
                      {upiData.selectedApp === app.id && (
                        <CheckCircle className="w-4 h-4 text-primary mx-auto mt-1" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vpa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Enter UPI ID</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vpa">UPI ID / Virtual Payment Address</Label>
                <Input
                  id="vpa"
                  placeholder="yourname@paytm"
                  value={upiData.vpa}
                  onChange={handleVPAChange}
                  className={cn(
                    "transition-colors",
                    upiData.vpa && !isVPAValid && "border-destructive"
                  )}
                />
                {upiData.vpa && !isVPAValid && (
                  <p className="text-sm text-destructive">
                    Please enter a valid UPI ID (e.g., yourname@paytm)
                  </p>
                )}
              </div>
              
              <div className="p-4 bg-accent/10 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Timer className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Collect Request</p>
                    <p className="text-xs text-muted-foreground">
                      A payment request will be sent to your UPI app. You have 5 minutes to approve it.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Scan QR Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-medium mb-1">Scan with any UPI app</p>
                <p className="text-sm text-muted-foreground">
                  Open your UPI app and scan this QR code to pay
                </p>
              </div>
              <Badge variant="secondary" className="mx-auto">
                Auto-refresh in 2:45
              </Badge>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full h-12 text-lg font-semibold"
        onClick={handlePayment}
        disabled={!canProceed || isProcessing || checkoutState.loading}
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        ) : paymentMode === 'intent' ? (
          `Pay with ${upiApps.find(app => app.id === upiData.selectedApp)?.name || 'UPI App'}`
        ) : paymentMode === 'vpa' ? (
          'Send Collect Request'
        ) : (
          'Generate QR Code'
        )}
      </Button>
    </div>
  );
}