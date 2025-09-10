import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Lock,
  Unlock,
  AlertTriangle,
  Shield,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BlockingReason {
  id: string;
  label: string;
  description: string;
  category: 'SECURITY' | 'LOST' | 'STOLEN' | 'SUSPICIOUS' | 'OTHER';
  requiresDetails: boolean;
  emergency: boolean;
}

export interface CardBlockRequest {
  blockType: 'TEMPORARY' | 'PERMANENT';
  reason: BlockingReason;
  additionalDetails?: string;
  contactNumber?: string;
  acknowledgeConsequences: boolean;
  reportToPolice?: boolean;
  policeReportNumber?: string;
}

export interface CardBlockingProps {
  cardNumber: string;
  cardStatus: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  onBlockCard: (request: CardBlockRequest) => Promise<void>;
  onUnblockCard: () => Promise<void>;
  onEmergencyBlock: () => Promise<void>;
  className?: string;
}

const CardBlocking: React.FC<CardBlockingProps> = ({
  cardNumber,
  cardStatus,
  onBlockCard,
  onUnblockCard,
  onEmergencyBlock,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'select-action' | 'choose-reason' | 'provide-details' | 'confirm' | 'processing' | 'success'>('select-action');
  const [selectedAction, setSelectedAction] = useState<'temporary' | 'permanent' | 'emergency' | null>(null);
  const [selectedReason, setSelectedReason] = useState<BlockingReason | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [acknowledgeConsequences, setAcknowledgeConsequences] = useState(false);
  const [reportToPolice, setReportToPolice] = useState(false);
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blockingReasons: BlockingReason[] = [
    {
      id: 'lost',
      label: 'Card Lost',
      description: 'I have lost my card and cannot find it',
      category: 'LOST',
      requiresDetails: true,
      emergency: true
    },
    {
      id: 'stolen',
      label: 'Card Stolen',
      description: 'My card has been stolen or taken without permission',
      category: 'STOLEN',
      requiresDetails: true,
      emergency: true
    },
    {
      id: 'suspicious_activity',
      label: 'Suspicious Activity',
      description: 'I noticed unauthorized transactions or suspicious activity',
      category: 'SUSPICIOUS',
      requiresDetails: true,
      emergency: true
    },
    {
      id: 'damaged',
      label: 'Card Damaged',
      description: 'My card is physically damaged and cannot be used',
      category: 'OTHER',
      requiresDetails: false,
      emergency: false
    },
    {
      id: 'not_received',
      label: 'Card Not Received',
      description: 'I have not received my card after the expected delivery date',
      category: 'OTHER',
      requiresDetails: true,
      emergency: false
    },
    {
      id: 'temporary_hold',
      label: 'Temporary Hold',
      description: 'I want to temporarily disable the card for security reasons',
      category: 'SECURITY',
      requiresDetails: false,
      emergency: false
    },
    {
      id: 'other',
      label: 'Other Reason',
      description: 'Other reason not listed above',
      category: 'OTHER',
      requiresDetails: true,
      emergency: false
    }
  ];

  const resetForm = () => {
    setCurrentStep('select-action');
    setSelectedAction(null);
    setSelectedReason(null);
    setAdditionalDetails('');
    setContactNumber('');
    setAcknowledgeConsequences(false);
    setReportToPolice(false);
    setPoliceReportNumber('');
    setError(null);
  };

  const handleEmergencyBlock = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onEmergencyBlock();
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to block card. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockCard = async () => {
    if (!selectedReason || !acknowledgeConsequences) {
      setError('Please select a reason and acknowledge the consequences');
      return;
    }

    if (selectedReason.category === 'STOLEN' && !reportToPolice) {
      setError('For stolen cards, you must report to police or select a different reason');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const request: CardBlockRequest = {
        blockType: selectedAction === 'permanent' ? 'PERMANENT' : 'TEMPORARY',
        reason: selectedReason,
        additionalDetails: selectedReason.requiresDetails ? additionalDetails : undefined,
        contactNumber: contactNumber || undefined,
        acknowledgeConsequences,
        reportToPolice,
        policeReportNumber: reportToPolice ? policeReportNumber : undefined,
      };

      await onBlockCard(request);
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to block card. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblockCard = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      await onUnblockCard();
      setCurrentStep('success');
    } catch (err) {
      setError('Failed to unblock card. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectAction = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Card Blocking</h3>
        <p className="text-muted-foreground text-lg">
          Secure your card by blocking it temporarily or permanently
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Card Status</p>
                <p className="text-sm text-muted-foreground">
                  **** **** **** {cardNumber.slice(-4)}
                </p>
              </div>
            </div>
            <Badge className={cn(
              cardStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              cardStatus === 'BLOCKED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            )}>
              {cardStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cardStatus === 'ACTIVE' ? (
          <>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setSelectedAction('temporary');
              setCurrentStep('choose-reason');
            }}>
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Temporary Block</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Temporarily disable your card. Can be unblocked anytime.
                </p>
                <Badge variant="secondary">Recommended for security</Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setSelectedAction('permanent');
              setCurrentStep('choose-reason');
            }}>
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Permanent Block</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently disable your card. Cannot be reversed.
                </p>
                <Badge variant="destructive">Irreversible action</Badge>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="cursor-pointer hover:shadow-md transition-shadow md:col-span-2" onClick={handleUnblockCard}>
            <CardContent className="p-6 text-center">
              <Unlock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Unblock Card</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Restore your card to active status
              </p>
              <Button disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Unblock Card'
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Block */}
      {cardStatus === 'ACTIVE' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2 text-red-800">Emergency Block</h4>
            <p className="text-sm text-red-700 mb-4">
              If your card is lost or stolen, block it immediately for your security.
            </p>
            <Button
              variant="destructive"
              onClick={handleEmergencyBlock}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Emergency Block
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderChooseReason = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          {selectedAction === 'temporary' ? 'Temporary' : 'Permanent'} Block
        </h3>
        <p className="text-muted-foreground">
          Please select the reason for blocking your card
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <RadioGroup className="space-y-4">
            {blockingReasons.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem
                  value={reason.id}
                  id={reason.id}
                  className="mt-1"
                  onClick={() => setSelectedReason(reason)}
                />
                <div className="flex-1">
                  <Label htmlFor={reason.id} className="font-semibold cursor-pointer flex items-center">
                    {reason.label}
                    {reason.emergency && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Emergency
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reason.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {reason.category}
                    </Badge>
                    {reason.requiresDetails && (
                      <Badge variant="secondary" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Details Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('select-action')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('provide-details')}
          disabled={!selectedReason}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderProvideDetails = () => {
    if (!selectedReason) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Additional Information</h3>
          <p className="text-muted-foreground">
            Please provide additional details about your situation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
              <CardDescription>
                Help us understand what happened
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedReason.requiresDetails && (
                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Please describe what happened in detail..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number (Optional)</Label>
                <input
                  id="contact"
                  type="tel"
                  placeholder="Your contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                />
              </div>

              {(selectedReason.category === 'STOLEN' || selectedReason.category === 'LOST') && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="report-police"
                      checked={reportToPolice}
                      onCheckedChange={(checked) => setReportToPolice(checked === true)}
                    />
                    <Label htmlFor="report-police" className="text-sm">
                      I have reported this to the police
                    </Label>
                  </div>

                  {reportToPolice && (
                    <div className="space-y-2">
                      <Label htmlFor="police-report">Police Report Number</Label>
                      <input
                        id="police-report"
                        type="text"
                        placeholder="Enter police report number"
                        value={policeReportNumber}
                        onChange={(e) => setPoliceReportNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Block Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Block Type</span>
                  <Badge className={selectedAction === 'permanent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedAction?.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reason</span>
                  <span className="text-sm font-medium">{selectedReason.label}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline">{selectedReason.category}</Badge>
                </div>

                {selectedReason.emergency && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This is marked as an emergency situation. Your card will be blocked immediately.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => setCurrentStep('choose-reason')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => setCurrentStep('confirm')}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirm = () => {
    if (!selectedReason) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Confirm Card Block</h3>
          <p className="text-muted-foreground">
            Please review and confirm your card blocking request
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-6">
            {/* Block Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">Card Number</span>
                <span className="font-mono">**** **** **** {cardNumber.slice(-4)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">Block Type</span>
                <Badge className={selectedAction === 'permanent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {selectedAction?.toUpperCase()} BLOCK
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="font-medium">Reason</span>
                <span>{selectedReason.label}</span>
              </div>

              {additionalDetails && (
                <div className="p-3 bg-muted/50 rounded">
                  <span className="font-medium">Additional Details</span>
                  <p className="text-sm text-muted-foreground mt-1">{additionalDetails}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Consequences */}
            <div className="space-y-4">
              <h4 className="font-semibold text-red-800">Important Consequences</h4>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>All transactions will be immediately stopped</span>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Online payments will be declined</span>
                </div>
                <div className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>ATM withdrawals will not be possible</span>
                </div>
                {selectedAction === 'permanent' && (
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>This action cannot be reversed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acknowledgment */}
            <div className="flex items-start space-x-3 p-4 border border-red-200 rounded-lg bg-red-50">
              <Checkbox
                id="acknowledge"
                checked={acknowledgeConsequences}
                onCheckedChange={(checked) => setAcknowledgeConsequences(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="acknowledge" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  I understand and accept the consequences of blocking this card
                </Label>
                <p className="text-xs text-muted-foreground">
                  By proceeding, I confirm that I want to block this card and understand all the consequences mentioned above.
                  {selectedAction === 'permanent' && ' This action cannot be undone.'}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep('provide-details')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleBlockCard}
                disabled={!acknowledgeConsequences || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Block
                    <Lock className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProcessing = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <RefreshCw className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2">Processing Card Block</h3>
        <p className="text-muted-foreground mb-4">
          Please wait while we securely block your card...
        </p>
        <Progress value={75} className="w-full" />
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2">Card Blocked Successfully</h3>
        <p className="text-muted-foreground mb-6">
          Your card has been {cardStatus === 'BLOCKED' ? 'unblocked' : 'blocked'} successfully.
        </p>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {cardStatus === 'BLOCKED'
                ? 'Your card is now active and ready to use.'
                : 'For your security, all card transactions have been stopped.'
              }
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Done
            </Button>
            <Button onClick={() => setCurrentStep('select-action')} className="flex-1">
              Manage Another Card
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 'select-action' && renderSelectAction()}
      {currentStep === 'choose-reason' && renderChooseReason()}
      {currentStep === 'provide-details' && renderProvideDetails()}
      {currentStep === 'confirm' && renderConfirm()}
      {currentStep === 'processing' && renderProcessing()}
      {currentStep === 'success' && renderSuccess()}
    </div>
  );
};

export default CardBlocking;
