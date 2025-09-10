import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  MessageSquare,
  Star,
  TrendingDown,
  Lock,
  Smartphone,
  Mail,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardDetails {
  cardId: string;
  cardNumber: string;
  cardType: string;
  currentTier: string;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  issuedDate: string;
  lastUsed: string;
  outstandingBalance: number;
}

export interface CancellationReason {
  id: string;
  label: string;
  description: string;
  requiresFeedback: boolean;
  category: 'SERVICE' | 'COST' | 'USAGE' | 'TECHNICAL' | 'OTHER';
}

export interface CancellationSummary {
  card: CardDetails;
  reason: CancellationReason;
  feedback?: string;
  effectiveDate: string;
  refundAmount?: number;
  finalSettlementDate?: string;
  replacementCardOffered?: boolean;
}

interface CardCancellationWorkflowProps {
  card: CardDetails;
  onCancellationComplete: (summary: CancellationSummary) => void;
  onCancelProcess: () => void;
  className?: string;
}

const CardCancellationWorkflow: React.FC<CardCancellationWorkflowProps> = ({
  card,
  onCancellationComplete,
  onCancelProcess,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'reason' | 'confirm' | 'processing' | 'complete'>('reason');
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [feedback, setFeedback] = useState('');
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cancellationComplete, setCancellationComplete] = useState(false);

  const cancellationReasons: CancellationReason[] = [
    {
      id: 'cost_high',
      label: 'High annual fees',
      description: 'The annual maintenance charges are too high for my usage',
      requiresFeedback: true,
      category: 'COST'
    },
    {
      id: 'service_dissatisfied',
      label: 'Dissatisfied with service',
      description: 'Not satisfied with the overall service quality',
      requiresFeedback: true,
      category: 'SERVICE'
    },
    {
      id: 'rarely_used',
      label: 'Rarely used',
      description: 'I don\'t use this card frequently enough',
      requiresFeedback: false,
      category: 'USAGE'
    },
    {
      id: 'technical_issues',
      label: 'Technical issues',
      description: 'Experiencing technical problems with the card',
      requiresFeedback: true,
      category: 'TECHNICAL'
    },
    {
      id: 'found_better',
      label: 'Found better alternative',
      description: 'Found a better card/service elsewhere',
      requiresFeedback: true,
      category: 'SERVICE'
    },
    {
      id: 'temporary',
      label: 'Temporary cancellation',
      description: 'Need to cancel temporarily',
      requiresFeedback: false,
      category: 'USAGE'
    },
    {
      id: 'other',
      label: 'Other reason',
      description: 'Other reason not listed above',
      requiresFeedback: true,
      category: 'OTHER'
    }
  ];

  useEffect(() => {
    if (currentStep === 'processing') {
      processCancellation();
    }
  }, [currentStep]);

  const processCancellation = async () => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate cancellation processing steps
      const steps = [
        { label: 'Validating cancellation request', duration: 1000 },
        { label: 'Processing outstanding transactions', duration: 1500 },
        { label: 'Deactivating card services', duration: 1200 },
        { label: 'Processing refunds if applicable', duration: 1000 },
        { label: 'Finalizing cancellation', duration: 800 },
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        setProgress(((i + 1) / steps.length) * 100);
      }

      setCancellationComplete(true);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Cancellation processing failed:', error);
      setCurrentStep('reason');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReasonSelect = (reason: CancellationReason) => {
    setSelectedReason(reason);
    setCurrentStep('confirm');
  };

  const handleConfirmCancellation = () => {
    if (!selectedReason || !acknowledgedTerms) {
      return;
    }

    const summary: CancellationSummary = {
      card,
      reason: selectedReason,
      feedback: selectedReason.requiresFeedback ? feedback : undefined,
      effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      refundAmount: card.outstandingBalance > 0 ? card.outstandingBalance : undefined,
      finalSettlementDate: card.outstandingBalance > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      replacementCardOffered: selectedReason.category === 'TECHNICAL',
    };

    setCurrentStep('processing');
  };

  const renderReasonStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Cancel Your Card</h3>
        <p className="text-muted-foreground text-lg">
          We're sorry to see you go. Please let us know why you're cancelling
        </p>
      </div>

      {/* Card Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Card to be Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Card Number</p>
              <p className="font-mono">**** **** **** {card.cardNumber.slice(-4)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Card Type</p>
              <p className="font-semibold">{card.cardType} - {card.currentTier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expiry Date</p>
              <p>{card.expiryDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={card.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {card.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Reasons */}
      <Card>
        <CardHeader>
          <CardTitle>Reason for Cancellation</CardTitle>
          <CardDescription>
            Please select the primary reason for cancelling your card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup className="space-y-4">
            {cancellationReasons.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem
                  value={reason.id}
                  id={reason.id}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={reason.id} className="font-semibold cursor-pointer">
                    {reason.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reason.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {reason.category}
                    </Badge>
                    {reason.requiresFeedback && (
                      <Badge variant="secondary" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Feedback Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancelProcess}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel Process
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Confirm Cancellation</h3>
        <p className="text-muted-foreground text-lg">
          Please review the cancellation details before proceeding
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancellation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Reason for Cancellation</p>
                <p className="font-semibold">{selectedReason?.label}</p>
                <p className="text-sm text-muted-foreground">{selectedReason?.description}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Effective Date</p>
                <p className="font-semibold">
                  {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Your card will be deactivated 24 hours after confirmation
                </p>
              </div>

              {card.outstandingBalance > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                    <p className="font-semibold text-green-600">₹{card.outstandingBalance}</p>
                    <p className="text-xs text-muted-foreground">
                      Will be refunded to your account within 7 business days
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {selectedReason?.requiresFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback</CardTitle>
              <CardDescription>
                Help us improve by sharing your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Additional Comments (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Please share any additional feedback or suggestions..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">What happens next?</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Card will be deactivated within 24 hours</li>
                  <li>• All recurring payments will be stopped</li>
                  <li>• Physical card should be cut and discarded</li>
                  <li>• Digital card will be removed from wallets</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Before you cancel:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Ensure no pending transactions</li>
                  <li>• Update any auto-payment mandates</li>
                  <li>• Download transaction history if needed</li>
                  <li>• Consider temporary block instead</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms Acknowledgment */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="cancellation-terms"
              checked={acknowledgedTerms}
              onCheckedChange={(checked) => setAcknowledgedTerms(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="cancellation-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I understand and accept the cancellation terms
              </Label>
              <p className="text-xs text-muted-foreground">
                By proceeding, I confirm that I want to cancel this card and understand all the consequences mentioned above.
                This action cannot be undone.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('reason')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reasons
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirmCancellation}
          disabled={!acknowledgedTerms}
        >
          Confirm Cancellation
          <Trash2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Processing Cancellation</h3>
        <p className="text-muted-foreground text-lg">
          Please wait while we process your card cancellation
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          </div>

          <div className="space-y-4">
            <Progress value={progress} className="w-full" />

            <div className="text-sm text-muted-foreground">
              <p>Processing your cancellation...</p>
              <p className="font-medium">{Math.round(progress)}% complete</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Validating cancellation request</span>
            </div>
            {progress >= 25 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Processing outstanding transactions</span>
              </div>
            )}
            {progress >= 50 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Deactivating card services</span>
              </div>
            )}
            {progress >= 75 && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                <span>Processing refunds if applicable</span>
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
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h3 className="text-3xl font-bold mb-2">Cancellation Complete</h3>
        <p className="text-muted-foreground text-lg mb-6">
          Your card has been successfully cancelled
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Cancellation Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Card Cancelled:</span>
              <span className="font-mono">**** **** **** {card.cardNumber.slice(-4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Effective Date:</span>
              <span className="font-semibold">
                {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            {card.outstandingBalance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refund Amount:</span>
                <span className="font-semibold text-green-600">₹{card.outstandingBalance}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              A confirmation email has been sent to your registered email address
            </p>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Download Cancellation Receipt
              </Button>
              <Button variant="outline" className="w-full">
                View Transaction History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What to do next */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4 text-center text-red-800">What to do next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">Destroy Physical Card</p>
              <p className="text-xs text-red-700">
                Cut your physical card into pieces and discard safely
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">Remove from Wallets</p>
              <p className="text-xs text-red-700">
                Remove card from all digital wallets and payment apps
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-800">Update Auto-payments</p>
              <p className="text-xs text-red-700">
                Update any automatic payment mandates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Options */}
      <Card>
        <CardContent className="p-6 text-center">
          <h4 className="font-semibold mb-2">Changed your mind?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            If you reconsider, you can apply for a new card or consider our other products
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline">
              Apply for New Card
            </Button>
            <Button variant="outline">
              Explore Other Products
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={() => onCancellationComplete({
          card,
          reason: selectedReason!,
          feedback: selectedReason!.requiresFeedback ? feedback : undefined,
          effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          refundAmount: card.outstandingBalance > 0 ? card.outstandingBalance : undefined,
          finalSettlementDate: card.outstandingBalance > 0 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          replacementCardOffered: selectedReason!.category === 'TECHNICAL',
        })}>
          Return to Dashboard
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
            { step: 'reason', label: 'Reason' },
            { step: 'confirm', label: 'Confirm' },
            { step: 'processing', label: 'Processing' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
                currentStep === item.step
                  ? "bg-red-100 text-red-800"
                  : index < ['reason', 'confirm', 'processing'].indexOf(currentStep)
                  ? "bg-red-100 text-red-800"
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
      {currentStep === 'reason' && renderReasonStep()}
      {currentStep === 'confirm' && renderConfirmStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default CardCancellationWorkflow;
