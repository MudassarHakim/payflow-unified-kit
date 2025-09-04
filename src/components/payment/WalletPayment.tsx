import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { WalletData } from '@/types/payment';
import { cn } from '@/lib/utils';
import { Wallet, Smartphone, Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  kycTier: 'basic' | 'intermediate' | 'full';
  balanceCheckRequired: boolean;
  supportedCurrencies: string[];
  maxTransactionLimit: number;
  fees: {
    percentage?: number;
    fixed?: number;
  };
  features: string[];
}

interface WalletPaymentProps {
  orderAmount: number;
  currency: string;
  onPaymentInitiate: (data: WalletData) => void;
  onCancel: () => void;
}

export function WalletPayment({ orderAmount, currency, onPaymentInitiate, onCancel }: WalletPaymentProps) {
  const { checkoutState } = usePaymentSDK();
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock wallet providers based on PRD requirements
  const walletProviders: WalletProvider[] = [
    {
      id: 'paytm',
      name: 'Paytm',
      icon: '💳',
      description: 'India\'s largest digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 100000,
      fees: { percentage: 0 },
      features: ['Instant transfer', 'Cashback rewards', 'Bill payments']
    },
    {
      id: 'phonepe',
      name: 'PhonePe',
      icon: '📱',
      description: 'UPI-powered digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 100000,
      fees: { percentage: 0 },
      features: ['UPI integration', 'Merchant offers', 'Split payments']
    },
    {
      id: 'amazonpay',
      name: 'Amazon Pay',
      icon: '📦',
      description: 'Amazon\'s digital payment service',
      kycTier: 'intermediate',
      balanceCheckRequired: false,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 50000,
      fees: { percentage: 0 },
      features: ['One-click checkout', 'Amazon balance', 'Rewards points']
    },
    {
      id: 'mobikwik',
      name: 'MobiKwik',
      icon: '⚡',
      description: 'Fast and secure digital wallet',
      kycTier: 'full',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 50000,
      fees: { percentage: 0 },
      features: ['Instant cashback', 'Movie tickets', 'Recharge']
    },
    {
      id: 'freecharge',
      name: 'FreeCharge',
      icon: '🔋',
      description: 'Digital wallet with rewards',
      kycTier: 'intermediate',
      balanceCheckRequired: true,
      supportedCurrencies: ['INR'],
      maxTransactionLimit: 25000,
      fees: { percentage: 0 },
      features: ['Cashback offers', 'Utility bills', 'Gift cards']
    }
  ];

  const getKYCTierColor = (tier: string) => {
    switch (tier) {
      case 'full': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKYCTierLabel = (tier: string) => {
    switch (tier) {
      case 'full': return 'Full KYC';
      case 'intermediate': return 'Intermediate KYC';
      case 'basic': return 'Basic KYC';
      default: return 'Unknown';
    }
  };

  const checkWalletBalance = async (walletId: string) => {
    setCheckingBalance(true);
    setBalanceError(null);

    try {
      // Simulate API call to check wallet balance
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock balance check - in real implementation, this would call the backend
      const mockBalance = Math.floor(Math.random() * 50000) + 1000;
      setWalletBalance(mockBalance);
    } catch (error) {
      setBalanceError('Unable to check wallet balance. Please try again.');
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleWalletSelect = (wallet: WalletProvider) => {
    setSelectedWallet(wallet);
    setWalletBalance(null);
    setBalanceError(null);

    if (wallet.balanceCheckRequired) {
      checkWalletBalance(wallet.id);
    }
  };

  const handlePaymentInitiate = async () => {
    if (!selectedWallet) return;

    setLoading(true);

    try {
      // Check if balance is sufficient (if balance check was performed)
      if (selectedWallet.balanceCheckRequired && walletBalance !== null && walletBalance < orderAmount) {
        setBalanceError('Insufficient wallet balance');
        setLoading(false);
        return;
      }

      // Check transaction limit
      if (orderAmount > selectedWallet.maxTransactionLimit) {
        setBalanceError(`Transaction amount exceeds wallet limit of ₹${selectedWallet.maxTransactionLimit.toLocaleString()}`);
        setLoading(false);
        return;
      }

      const walletData: WalletData = {
        walletProvider: selectedWallet.id,
        walletId: `wallet_${Date.now()}`
      };

      onPaymentInitiate(walletData);
    } catch (error) {
      setBalanceError('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFees = (wallet: WalletProvider) => {
    if (wallet.fees.percentage) {
      return (orderAmount * wallet.fees.percentage) / 100;
    }
    return wallet.fees.fixed || 0;
  };

  if (checkoutState.loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading wallet options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Pay with Digital Wallet
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred digital wallet for instant payment
        </p>
      </div>

      {/* Order Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Order Amount</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{orderAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="text-lg font-semibold">{currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Select Wallet</h3>
        {walletProviders.map((wallet) => (
          <Card
            key={wallet.id}
            className={cn(
              "cursor-pointer transition-all duration-200 border-2",
              selectedWallet?.id === wallet.id
                ? "border-primary bg-primary/5 shadow-md"
                : "hover:border-primary/20 hover:shadow-sm"
            )}
            onClick={() => handleWalletSelect(wallet)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-2xl">
                    {wallet.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getKYCTierColor(wallet.kycTier))}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getKYCTierLabel(wallet.kycTier)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{wallet.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {wallet.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mb-2">
                    {selectedWallet?.id === wallet.id && (
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max: ₹{wallet.maxTransactionLimit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Balance Check Section */}
              {selectedWallet?.id === wallet.id && wallet.balanceCheckRequired && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wallet Balance</span>
                    {checkingBalance ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Checking...</span>
                      </div>
                    ) : walletBalance !== null ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">₹{walletBalance.toLocaleString()}</span>
                      </div>
                    ) : balanceError ? (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Check failed</span>
                      </div>
                    ) : null}
                  </div>

                  {walletBalance !== null && walletBalance < orderAmount && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Insufficient balance. You need ₹{(orderAmount - walletBalance).toLocaleString()} more.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Fee Information */}
              {selectedWallet?.id === wallet.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span>Transaction Fee</span>
                    <span className={calculateFees(wallet) > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {calculateFees(wallet) > 0 ? `₹${calculateFees(wallet)}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>Total Amount</span>
                    <span>₹{(orderAmount + calculateFees(wallet)).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Display */}
      {balanceError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{balanceError}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handlePaymentInitiate}
          disabled={!selectedWallet || loading || (selectedWallet.balanceCheckRequired && walletBalance !== null && walletBalance < orderAmount)}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with {selectedWallet?.name || 'Wallet'}
            </>
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your wallet transaction is secured with bank-grade encryption and PCI DSS compliance.
          We never store your wallet credentials.
        </AlertDescription>
      </Alert>
    </div>
  );
}
