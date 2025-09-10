import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Shield,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Info,
  Star,
  TrendingUp,
  Lock,
  Smartphone,
  Mail,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  upgradeCost: number;
  monthlyBenefit: number;
  category: string;
  currentValue: string | number;
  upgradedValue: string | number;
}

export interface CurrentCardDetails {
  cardId: string;
  cardNumber: string;
  currentTier: string;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpgradeSummary {
  upgradeOption: UpgradeOption;
  currentCard: CurrentCardDetails;
  upgradeCost: number;
  monthlySavings: number;
  paybackPeriod: number;
  effectiveDate: string;
  newFeatures: string[];
  removedFeatures?: string[];
}

interface UpgradeConfirmationFlowProps {
  upgradeSummary: UpgradeSummary;
  onConfirmUpgrade: () => void;
  onCancelUpgrade: () => void;
  onBackToSelection: () => void;
  className?: string;
}

const UpgradeConfirmationFlow: React.FC<UpgradeConfirmationFlowProps> = ({
  upgradeSummary,
  onConfirmUpgrade,
  onCancelUpgrade,
  onBackToSelection,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'review' | 'confirm' | 'processing' | 'complete'>('review');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acknowledgedChanges, setAcknowledgedChanges] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  useEffect(() => {
    if (currentStep === 'processing') {
      processUpgrade();
    }
  }, [currentStep]);

  const processUpgrade = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate upgrade processing steps
      const steps = [
        { label: 'Validating upgrade eligibility', duration: 1000 },
        { label: 'Processing payment', duration: 1500 },
        { label: 'Updating card features', duration: 1200 },
        { label: 'Activating new benefits', duration: 800 },
        { label: 'Finalizing upgrade', duration: 600 },
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        setProgress(((i + 1) / steps.length) * 100);
      }

      setUpgradeComplete(true);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Upgrade processing failed:', error);
      setCurrentStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpgrade = () => {
    if (!acceptedTerms || !acknowledgedChanges) {
      return;
    }
    setCurrentStep('confirm');
  };

  const handleFinalConfirm = () => {
    setCurrentStep('processing');
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Review Your Upgrade</h3>
        <p className="text-muted-foreground text-lg">
          Please review the upgrade details before proceeding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current vs Upgraded */}
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Summary</CardTitle>
            <CardDescription>
              Compare your current card with the upgraded version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Current Tier</span>
                <Badge variant="secondary">{upgradeSummary.currentCard.currentTier}</Badge>
              </div>

              <ArrowRight className="w-5 h-5 text-primary mx-auto" />

              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Upgraded Tier</span>
                <Badge className="bg-primary text-primary-foreground">
                  {upgradeSummary.upgradeOption.upgradedValue}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold">Key Changes:</h4>
              <div className="space-y-2">
                {upgradeSummary.upgradeOption.currentValue !== upgradeSummary.upgradeOption.upgradedValue && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      {upgradeSummary.upgradeOption.name}: {upgradeSummary.upgradeOption.currentValue} → {upgradeSummary.upgradeOption.upgradedValue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost & Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Cost & Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Upgrade Cost:</span>
                <span className="font-semibold text-lg">₹{upgradeSummary.upgradeCost}</span>
              </div>

              <div className="flex justify-between">
                <span>Monthly Savings:</span>
                <span className="font-semibold text-green-600">₹{upgradeSummary.monthlySavings}</span>
              </div>

              <div className="flex justify-between">
                <span>Payback Period:</span>
                <span className="font-semibold">{upgradeSummary.paybackPeriod.toFixed(1)} months</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span>Effective Date:</span>
                <span className="font-semibold">{new Date(upgradeSummary.effectiveDate).toLocaleDateString()}</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your card will be upgraded immediately after payment confirmation.
                New features will be available within 24 hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* New Features */}
      <Card>
        <CardHeader>
          <CardTitle>New Features & Benefits</CardTitle>
          <CardDescription>
            Enjoy these additional features with your upgrade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upgradeSummary.newFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms & Acknowledgments */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I accept the upgrade terms and conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By proceeding, you agree to the upgrade terms, including the one-time upgrade fee and new service terms.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="changes"
                checked={acknowledgedChanges}
                onCheckedChange={(checked) => setAcknowledgedChanges(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="changes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I acknowledge the changes to my card features
                </label>
                <p className="text-xs text-muted-foreground">
                  I understand that my card will have new features and benefits as described above.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onBackToSelection}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
        <Button
          onClick={handleConfirmUpgrade}
          disabled={!acceptedTerms || !acknowledgedChanges}
        >
          Proceed to Confirmation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Final Confirmation</h3>
        <p className="text-muted-foreground text-lg">
          Please confirm your upgrade details one final time
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Ready to Upgrade</CardTitle>
          <CardDescription>
            You're about to upgrade your card with the following changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Upgrade Type</h4>
                <p className="text-sm text-muted-foreground">{upgradeSummary.upgradeOption.name}</p>
              </div>
              <Badge>{upgradeSummary.upgradeOption.category.replace('_', ' ')}</Badge>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Card Number</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  **** **** **** {upgradeSummary.currentCard.cardNumber.slice(-4)}
                </p>
              </div>
              <Badge variant="secondary">{upgradeSummary.currentCard.status}</Badge>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Upgrade Cost</h4>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>
              <span className="text-2xl font-bold text-primary">₹{upgradeSummary.upgradeCost}</span>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Effective Date</h4>
                <p className="text-sm text-muted-foreground">Upgrade activation</p>
              </div>
              <span className="font-semibold">{new Date(upgradeSummary.effectiveDate).toLocaleDateString()}</span>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This action cannot be undone. Your card will be upgraded immediately
              and the upgrade fee will be charged to your account.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setCurrentStep('review')} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Review Again
            </Button>
            <Button onClick={handleFinalConfirm} className="flex-1">
              Confirm Upgrade
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Processing Upgrade</h3>
        <p className="text-muted-foreground text-lg">
          Please wait while we process your card upgrade
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
              <p>Processing your upgrade...</p>
              <p className="font-medium">{Math.round(progress)}% complete</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Validating upgrade eligibility</span>
            </div>
            {progress >= 25 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Processing payment</span>
              </div>
            )}
            {progress >= 50 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Updating card features</span>
              </div>
            )}
            {progress >= 75 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Activating new benefits</span>
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

        <h3 className="text-3xl font-bold mb-2">Upgrade Successful!</h3>
        <p className="text-muted-foreground text-lg mb-6">
          Your card has been successfully upgraded
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Upgrade Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upgrade Type:</span>
              <span className="font-semibold">{upgradeSummary.upgradeOption.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">New Tier:</span>
              <Badge className="bg-primary text-primary-foreground">
                {upgradeSummary.upgradeOption.upgradedValue}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-semibold">₹{upgradeSummary.upgradeCost}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Effective Date:</span>
              <span className="font-semibold">{new Date(upgradeSummary.effectiveDate).toLocaleDateString()}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A confirmation email has been sent to your registered email address
            </p>

            <div className="space-y-2">
              <Button className="w-full">
                View Updated Card Details
              </Button>
              <Button variant="outline" className="w-full">
                Download Upgrade Receipt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center">What's Next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Features Available</p>
              <p className="text-xs text-muted-foreground">
                New features are now active on your card
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Email Confirmation</p>
              <p className="text-xs text-muted-foreground">
                Check your email for upgrade details
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Start Using</p>
              <p className="text-xs text-muted-foreground">
                Enjoy your upgraded card benefits immediately
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onConfirmUpgrade}>
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {/* Progress Indicator */}
      {currentStep !== 'complete' && (
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { step: 'review', label: 'Review' },
            { step: 'confirm', label: 'Confirm' },
            { step: 'processing', label: 'Processing' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
                currentStep === item.step
                  ? "bg-primary text-primary-foreground"
                  : index < ['review', 'confirm', 'processing'].indexOf(currentStep)
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

      {/* Step Content */}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default UpgradeConfirmationFlow;
