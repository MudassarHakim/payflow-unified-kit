/**
 * EMI Payment Component
 * Provides EMI plan selection and payment processing
 * Following RBI compliance and industry best practices
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { cn } from '@/lib/utils';
import { CreditCard, Calculator, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { EMIProvider, EMIPlan, EMIData } from '@/types/payment';
import { emiApiService } from '@/services/emiApi';
import { formatEMIAmount, formatInterestRate, calculateEMICostComparison } from '@/utils/emiCalculator';

interface EMIPaymentProps {
  className?: string;
  orderAmount: number;
}

export function EMIPayment({ className, orderAmount }: EMIPaymentProps) {
  const { processPayment, checkoutState } = usePaymentSDK();

  const [providers, setProviders] = React.useState<EMIProvider[]>([]);
  const [selectedPlan, setSelectedPlan] = React.useState<EMIPlan | null>(null);
  const [emiPlans, setEmiPlans] = React.useState<EMIPlan[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showTerms, setShowTerms] = React.useState(false);

  // Load EMI providers on mount
  React.useEffect(() => {
    loadEMIProviders();
  }, []);

  // Load EMI plans when providers are loaded
  React.useEffect(() => {
    if (providers.length > 0) {
      loadEMIPlans();
    }
  }, [providers, orderAmount]);

  const loadEMIProviders = async () => {
    try {
      setIsLoading(true);
      const providerData = await emiApiService.getEMIProviders();
      setProviders(providerData);
    } catch (err) {
      setError('Failed to load EMI providers');
      console.error('EMI providers error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEMIPlans = async () => {
    try {
      setIsLoading(true);
      const plans = await emiApiService.getEMIPlans(orderAmount);
      setEmiPlans(plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load EMI plans');
      console.error('EMI plans error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: EMIPlan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const emiData: EMIData = {
        providerId: selectedPlan.providerId,
        planId: `${selectedPlan.providerId}_${selectedPlan.tenure}`,
        tenure: selectedPlan.tenure,
        emiAmount: selectedPlan.emiAmount,
        totalAmount: selectedPlan.totalAmount,
        interestRate: selectedPlan.interestRate,
        processingFee: selectedPlan.processingFee
      };

      const result = await processPayment({
        type: 'bnpl', // EMI falls under BNPL
        emiData,
        amount: orderAmount
      });

      console.log('EMI payment result:', result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      console.error('EMI payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderLogo = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.logo || '🏦';
  };

  const costComparison = selectedPlan ?
    calculateEMICostComparison(orderAmount, selectedPlan) : null;

  if (isLoading && providers.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading EMI options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          EMI Payment
        </h2>
        <p className="text-muted-foreground">
          Choose from available EMI plans for {formatEMIAmount(orderAmount)}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* EMI Plans Selection */}
      {emiPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>Choose Your EMI Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedPlan?.providerId + '_' + selectedPlan?.tenure || ''}
              onValueChange={(value) => {
                const [providerId, tenureStr] = value.split('_');
                const plan = emiPlans.find(p =>
                  p.providerId === providerId && p.tenure === parseInt(tenureStr)
                );
                if (plan) handlePlanSelect(plan);
              }}
              className="space-y-4"
            >
              {emiPlans.slice(0, 6).map((plan) => (
                <div key={`${plan.providerId}_${plan.tenure}`}>
                  <Label
                    htmlFor={`${plan.providerId}_${plan.tenure}`}
                    className={cn(
                      "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedPlan?.providerId === plan.providerId &&
                      selectedPlan?.tenure === plan.tenure
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem
                      value={`${plan.providerId}_${plan.tenure}`}
                      id={`${plan.providerId}_${plan.tenure}`}
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-2xl">{getProviderLogo(plan.providerId)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{plan.providerName}</span>
                            <Badge variant="secondary" className="ml-2">
                              {plan.tenure} months
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {formatEMIAmount(plan.monthlyAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              /month
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Total: {formatEMIAmount(plan.totalAmount)} •
                          Interest: {formatInterestRate(plan.interestRate)}
                          {plan.processingFee > 0 && ` • Fee: ${formatEMIAmount(plan.processingFee)}`}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Cost Comparison */}
      {selectedPlan && costComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Cost Comparison</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Pay Full Amount</div>
                <div className="font-semibold text-lg">
                  {formatEMIAmount(costComparison.fullPaymentCost)}
                </div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">EMI Total Cost</div>
                <div className="font-semibold text-lg">
                  {formatEMIAmount(costComparison.emiTotalCost)}
                </div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Extra Cost</div>
              <div className="font-semibold text-orange-600">
                +{formatEMIAmount(costComparison.extraCost)}
              </div>
              <div className="text-xs text-muted-foreground">
                ({costComparison.savingsPercentage.toFixed(1)}% of original amount)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      {selectedPlan && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={showTerms}
                  onChange={(e) => setShowTerms(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the EMI terms and conditions
                </Label>
              </div>

              {showTerms && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    By selecting EMI, you agree to pay {formatEMIAmount(selectedPlan.emiAmount)}
                    monthly for {selectedPlan.tenure} months. Total amount payable:
                    {formatEMIAmount(selectedPlan.totalAmount)}. Terms apply as per
                    {selectedPlan.providerName} policies.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Button */}
      <Button
        className="w-full h-12 text-lg font-semibold"
        onClick={handlePayment}
        disabled={
          !selectedPlan ||
          !showTerms ||
          isLoading ||
          checkoutState.loading
        }
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing EMI...</span>
          </div>
        ) : (
          selectedPlan ? (
            `Pay ${formatEMIAmount(selectedPlan.emiAmount)}/month for ${selectedPlan.tenure} months`
          ) : (
            'Select an EMI Plan'
          )
        )}
      </Button>

      {/* EMI Info */}
      <div className="p-4 bg-accent/10 rounded-lg">
        <div className="flex items-center space-x-2 text-accent mb-2">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-medium">EMI Information</span>
        </div>
        <p className="text-xs text-muted-foreground">
          EMI options are provided by RBI-compliant financial institutions.
          Interest rates and processing fees vary by provider and tenure.
          Credit approval subject to provider's terms.
        </p>
      </div>
    </div>
  );
}
