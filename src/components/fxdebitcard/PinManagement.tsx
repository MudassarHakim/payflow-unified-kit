import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Key,
  Smartphone,
  Mail,
  Clock,
  Info,
  ArrowRight,
  ArrowLeft,
  Settings,
  Fingerprint,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PinChangeRequest {
  currentPin?: string;
  newPin: string;
  confirmPin: string;
  verificationMethod: 'SMS' | 'EMAIL' | 'APP';
  verificationCode?: string;
}

export interface PinManagementProps {
  hasExistingPin: boolean;
  lastPinChange?: string;
  pinStrength?: 'WEAK' | 'MEDIUM' | 'STRONG';
  onSetPin: (request: PinChangeRequest) => Promise<void>;
  onChangePin: (request: PinChangeRequest) => Promise<void>;
  onResetPin: () => Promise<void>;
  onVerifyIdentity: (method: 'SMS' | 'EMAIL' | 'APP') => Promise<string>;
  className?: string;
}

type Step = 'select-action' | 'verify-identity' | 'enter-current-pin' | 'set-new-pin' | 'confirm-pin' | 'processing' | 'success';

const PinManagement: React.FC<PinManagementProps> = ({
  hasExistingPin,
  lastPinChange,
  pinStrength,
  onSetPin,
  onChangePin,
  onResetPin,
  onVerifyIdentity,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('select-action');
  const [selectedAction, setSelectedAction] = useState<'set' | 'change' | 'reset' | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'SMS' | 'EMAIL' | 'APP' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const resetForm = () => {
    setCurrentStep('select-action');
    setSelectedAction(null);
    setVerificationMethod(null);
    setVerificationCode('');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setShowCurrentPin(false);
    setShowNewPin(false);
    setShowConfirmPin(false);
    setError(null);
    setVerificationSent(false);
  };

  const validatePin = (pin: string): { isValid: boolean; strength: 'WEAK' | 'MEDIUM' | 'STRONG'; message: string } => {
    if (pin.length < 4) {
      return { isValid: false, strength: 'WEAK', message: 'PIN must be at least 4 digits' };
    }
    if (pin.length > 6) {
      return { isValid: false, strength: 'WEAK', message: 'PIN cannot be more than 6 digits' };
    }
    if (!/^\d+$/.test(pin)) {
      return { isValid: false, strength: 'WEAK', message: 'PIN must contain only numbers' };
    }

    // Check for repeated digits
    if (/^(\d)\1+$/.test(pin)) {
      return { isValid: true, strength: 'WEAK', message: 'Avoid repeated digits for better security' };
    }

    // Check for sequential digits
    if (/^(012|123|234|345|456|567|678|789|890|901)$/.test(pin)) {
      return { isValid: true, strength: 'WEAK', message: 'Avoid sequential digits for better security' };
    }

    if (pin.length >= 6) {
      return { isValid: true, strength: 'STRONG', message: 'Strong PIN' };
    }

    return { isValid: true, strength: 'MEDIUM', message: 'Medium strength PIN' };
  };

  const getPinStrengthColor = (strength: 'WEAK' | 'MEDIUM' | 'STRONG') => {
    switch (strength) {
      case 'WEAK':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'STRONG':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSendVerification = async (method: 'SMS' | 'EMAIL' | 'APP') => {
    try {
      setIsProcessing(true);
      setError(null);
      await onVerifyIdentity(method);
      setVerificationSent(true);
      setVerificationMethod(method);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyAndProceed = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Please enter a valid verification code');
      return;
    }

    if (selectedAction === 'set') {
      setCurrentStep('set-new-pin');
    } else if (selectedAction === 'change') {
      setCurrentStep('enter-current-pin');
    } else if (selectedAction === 'reset') {
      setCurrentStep('set-new-pin');
    }
  };

  const handleSetPin = async () => {
    const validation = validatePin(newPin);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const request: PinChangeRequest = {
        newPin,
        confirmPin,
        verificationMethod: verificationMethod!,
        verificationCode: selectedAction === 'set' ? undefined : verificationCode,
        currentPin: selectedAction === 'change' ? currentPin : undefined,
      };

      if (selectedAction === 'set' || selectedAction === 'reset') {
        await onSetPin(request);
      } else {
        await onChangePin(request);
      }

      setCurrentStep('success');
    } catch (err) {
      setError('Failed to set PIN. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectAction = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">PIN Management</h3>
        <p className="text-muted-foreground text-lg">
          Secure your card with a personal identification number
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!hasExistingPin ? (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            setSelectedAction('set');
            setCurrentStep('verify-identity');
          }}>
            <CardContent className="p-6 text-center">
              <Key className="w-12 h-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Set New PIN</h4>
              <p className="text-sm text-muted-foreground">
                Create your first PIN for ATM and POS transactions
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setSelectedAction('change');
              setCurrentStep('verify-identity');
            }}>
              <CardContent className="p-6 text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Change PIN</h4>
                <p className="text-sm text-muted-foreground">
                  Update your existing PIN for better security
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setSelectedAction('reset');
              setCurrentStep('verify-identity');
            }}>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Reset PIN</h4>
                <p className="text-sm text-muted-foreground">
                  Forgot your PIN? Reset it securely
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center">
                <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">PIN Status</h4>
                <div className="space-y-2">
                  <Badge className={cn("text-xs", getPinStrengthColor(pinStrength || 'MEDIUM'))}>
                    {pinStrength || 'MEDIUM'} Strength
                  </Badge>
                  {lastPinChange && (
                    <p className="text-xs text-muted-foreground">
                      Last changed: {new Date(lastPinChange).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );

  const renderVerifyIdentity = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Verify Your Identity</h3>
        <p className="text-muted-foreground">
          Choose how you'd like to receive your verification code
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all",
            verificationMethod === 'SMS' && "ring-2 ring-primary"
          )}
          onClick={() => setVerificationMethod('SMS')}
        >
          <CardContent className="p-6 text-center">
            <Smartphone className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">SMS</h4>
            <p className="text-sm text-muted-foreground">
              Receive code via text message
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            verificationMethod === 'EMAIL' && "ring-2 ring-primary"
          )}
          onClick={() => setVerificationMethod('EMAIL')}
        >
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Email</h4>
            <p className="text-sm text-muted-foreground">
              Receive code via email
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all",
            verificationMethod === 'APP' && "ring-2 ring-primary"
          )}
          onClick={() => setVerificationMethod('APP')}
        >
          <CardContent className="p-6 text-center">
            <Fingerprint className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">App</h4>
            <p className="text-sm text-muted-foreground">
              Use biometric verification
            </p>
          </CardContent>
        </Card>
      </div>

      {verificationMethod && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Button
                  onClick={() => handleSendVerification(verificationMethod)}
                  disabled={isProcessing || verificationSent}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : verificationSent ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Code Sent
                    </>
                  ) : (
                    <>
                      Send Verification Code
                    </>
                  )}
                </Button>
              </div>

              {verificationSent && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verification-code">Enter Verification Code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyAndProceed}
                    disabled={!verificationCode || verificationCode.length < 4}
                    className="w-full"
                  >
                    Verify & Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button variant="outline" onClick={resetForm}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );

  const renderEnterCurrentPin = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Enter Current PIN</CardTitle>
        <CardDescription>
          Please enter your current PIN to proceed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current-pin">Current PIN</Label>
          <div className="relative">
            <Input
              id="current-pin"
              type={showCurrentPin ? "text" : "password"}
              placeholder="Enter your current PIN"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowCurrentPin(!showCurrentPin)}
            >
              {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCurrentStep('verify-identity')} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep('set-new-pin')}
            disabled={!currentPin || currentPin.length < 4}
            className="flex-1"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSetNewPin = () => {
    const validation = validatePin(newPin);

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Set New PIN</CardTitle>
          <CardDescription>
            Create a secure 4-6 digit PIN for your card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <div className="relative">
              <Input
                id="new-pin"
                type={showNewPin ? "text" : "password"}
                placeholder="Enter new PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowNewPin(!showNewPin)}
              >
                {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {newPin && (
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", getPinStrengthColor(validation.strength))}>
                  {validation.strength}
                </Badge>
                <span className="text-xs text-muted-foreground">{validation.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <div className="relative">
              <Input
                id="confirm-pin"
                type={showConfirmPin ? "text" : "password"}
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {confirmPin && newPin !== confirmPin && (
              <p className="text-xs text-red-600">PINs do not match</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedAction === 'change') {
                  setCurrentStep('enter-current-pin');
                } else {
                  setCurrentStep('verify-identity');
                }
              }}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep('confirm-pin')}
              disabled={!validation.isValid || newPin !== confirmPin}
              className="flex-1"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConfirmPin = () => (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Confirm PIN Change</CardTitle>
        <CardDescription>
          Please review your PIN change request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Action</span>
            <span className="text-sm capitalize">{selectedAction} PIN</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Verification</span>
            <span className="text-sm">{verificationMethod}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">New PIN</span>
            <span className="text-sm font-mono">{'•'.repeat(newPin.length)}</span>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Make sure to remember your new PIN.
            You will need it for ATM withdrawals and some POS transactions.
          </AlertDescription>
        </Alert>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCurrentStep('set-new-pin')} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSetPin} disabled={isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm PIN
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessing = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <RefreshCw className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2">Processing PIN Change</h3>
        <p className="text-muted-foreground mb-4">
          Please wait while we securely update your PIN...
        </p>
        <Progress value={75} className="w-full" />
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h3 className="text-xl font-semibold mb-2">PIN Updated Successfully</h3>
        <p className="text-muted-foreground mb-6">
          Your PIN has been securely updated and is ready to use.
        </p>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Remember:</strong> Keep your PIN secure and don't share it with anyone.
              Use it only when necessary for transactions.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Done
            </Button>
            <Button onClick={() => setCurrentStep('select-action')} className="flex-1">
              Manage Another PIN
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
      {currentStep === 'verify-identity' && renderVerifyIdentity()}
      {currentStep === 'enter-current-pin' && renderEnterCurrentPin()}
      {currentStep === 'set-new-pin' && renderSetNewPin()}
      {currentStep === 'confirm-pin' && renderConfirmPin()}
      {currentStep === 'processing' && renderProcessing()}
      {currentStep === 'success' && renderSuccess()}
    </div>
  );
};

export default PinManagement;
