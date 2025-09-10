import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  PenTool,
  Eye,
  EyeOff,
  Lock,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TermsDocument {
  id: string;
  title: string;
  version: string;
  type: 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'CARD_AGREEMENT' | 'TRAVEL_INSURANCE' | 'FX_DISCLOSURE';
  content: string;
  lastUpdated: string;
  isRequired: boolean;
}

export interface DigitalSignature {
  signature: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface TermsAcceptanceRecord {
  customerId: string;
  documents: {
    documentId: string;
    accepted: boolean;
    acceptedAt?: string;
    ipAddress: string;
    userAgent: string;
  }[];
  digitalSignature?: DigitalSignature;
  verificationMethod: 'DIGITAL_SIGNATURE' | 'OTP_VERIFICATION' | 'DOCUMENT_UPLOAD';
  verificationData?: {
    otp?: string;
    documentUrl?: string;
    biometricData?: string;
  };
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

interface TermsAcceptanceWorkflowProps {
  customerId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  onTermsAccepted: (record: TermsAcceptanceRecord) => void;
  onCancel: () => void;
  className?: string;
}

const TermsAcceptanceWorkflow: React.FC<TermsAcceptanceWorkflowProps> = ({
  customerId,
  customerDetails,
  onTermsAccepted,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'review' | 'accept' | 'verify' | 'complete'>('review');
  const [acceptedDocuments, setAcceptedDocuments] = useState<Set<string>>(new Set());
  const [verificationMethod, setVerificationMethod] = useState<'DIGITAL_SIGNATURE' | 'OTP_VERIFICATION' | 'DOCUMENT_UPLOAD'>('DIGITAL_SIGNATURE');
  const [otpCode, setOtpCode] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const termsDocuments: TermsDocument[] = [
    {
      id: 'terms_of_service',
      title: 'Terms of Service',
      version: 'v2.1',
      type: 'TERMS_OF_SERVICE',
      isRequired: true,
      lastUpdated: '2024-01-15',
      content: `
# Terms of Service

## 1. Introduction
Welcome to MockBank FX Debit Card services. These terms and conditions govern your use of our FX Debit Card and related services.

## 2. Card Usage
- The FX Debit Card can be used for domestic and international transactions
- Zero FX markup applies to international transactions
- Standard ATM fees may apply for non-partner ATMs

## 3. Fees and Charges
- Issuance fee: ₹499 (one-time)
- No annual fees
- No foreign transaction fees
- ATM withdrawal fees as per network charges

## 4. Liability
- You are responsible for all transactions made with your card
- Report lost/stolen cards immediately
- Unauthorized transactions must be reported within 60 days

## 5. Termination
- Either party may terminate this agreement with 30 days notice
- Cards will be blocked upon termination
- Outstanding amounts must be settled before termination
      `,
    },
    {
      id: 'privacy_policy',
      title: 'Privacy Policy',
      version: 'v1.8',
      type: 'PRIVACY_POLICY',
      isRequired: true,
      lastUpdated: '2024-01-10',
      content: `
# Privacy Policy

## 1. Information We Collect
- Personal information provided during registration
- Transaction history and usage patterns
- Device information and location data
- Communication preferences

## 2. How We Use Your Information
- Process transactions and provide services
- Send important notifications and updates
- Improve our products and services
- Comply with legal requirements

## 3. Information Sharing
- We do not sell your personal information
- Information may be shared with service providers
- Required disclosures to regulatory authorities
- Aggregated data for analytical purposes

## 4. Data Security
- Industry-standard encryption methods
- Secure data storage and transmission
- Regular security audits and updates
- Employee access controls

## 5. Your Rights
- Access your personal information
- Correct inaccurate information
- Request deletion of your data
- Opt-out of marketing communications
      `,
    },
    {
      id: 'card_agreement',
      title: 'FX Debit Card Agreement',
      version: 'v3.2',
      type: 'CARD_AGREEMENT',
      isRequired: true,
      lastUpdated: '2024-01-20',
      content: `
# FX Debit Card Agreement

## 1. Card Issuance
- Cards are issued subject to approval
- Physical and digital cards available
- Activation required before first use

## 2. Usage Terms
- Valid for 5 years from issuance
- Can be used worldwide
- Contactless payments up to ₹5,000
- PIN required for ATM withdrawals

## 3. International Usage
- Zero FX markup on all international transactions
- Dynamic currency conversion
- Real-time exchange rates

## 4. Limits and Restrictions
- Daily transaction limit: ₹1,00,000
- Monthly transaction limit: ₹5,00,000
- ATM withdrawal limit: ₹1,00,000 per day

## 5. Replacement and Renewal
- Lost/stolen cards replaced within 3-5 days
- Renewal notifications sent 60 days in advance
- Upgrade options available
      `,
    },
    {
      id: 'travel_insurance',
      title: 'Travel Insurance Terms',
      version: 'v1.5',
      type: 'TRAVEL_INSURANCE',
      isRequired: false,
      lastUpdated: '2024-01-12',
      content: `
# Travel Insurance Coverage

## 1. Coverage Details
- Medical expenses up to ₹50 lakhs
- Trip cancellation and interruption
- Lost baggage and personal belongings
- Emergency medical evacuation

## 2. Coverage Period
- Valid for international travel
- Maximum trip duration: 90 days
- Coverage starts from departure date

## 3. Exclusions
- Pre-existing medical conditions
- Adventure sports and activities
- War and terrorism related incidents
- Alcohol and drug related incidents

## 4. Claims Process
- Report incidents within 24 hours
- Submit required documentation
- Claims processed within 7-10 days
- Direct settlement with hospitals

## 5. Emergency Assistance
- 24/7 emergency hotline
- Medical advice and guidance
- Legal assistance abroad
- Translation services
      `,
    },
  ];

  const requiredDocuments = termsDocuments.filter(doc => doc.isRequired);
  const allRequiredAccepted = requiredDocuments.every(doc => acceptedDocuments.has(doc.id));

  const handleDocumentAcceptance = (documentId: string, accepted: boolean) => {
    setAcceptedDocuments(prev => {
      const newSet = new Set(prev);
      if (accepted) {
        newSet.add(documentId);
      } else {
        newSet.delete(documentId);
      }
      return newSet;
    });
  };

  const handleSignatureCapture = () => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const signature = canvas.toDataURL('image/png');
      setSignatureData(signature);
      setShowSignaturePad(false);
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
    }
  };

  const sendOTP = async () => {
    // Mock OTP sending
    console.log('Sending OTP to', customerDetails.phone);
    return new Promise(resolve => setTimeout(resolve, 2000));
  };

  const verifyOTP = async (otp: string) => {
    // Mock OTP verification
    return otp === '123456';
  };

  const handleVerification = async () => {
    setIsSubmitting(true);

    try {
      let verificationSuccess = false;
      let verificationData: any = {};

      switch (verificationMethod) {
        case 'DIGITAL_SIGNATURE':
          if (!signatureData) {
            throw new Error('Please provide digital signature');
          }
          verificationSuccess = true;
          verificationData = {
            signature: signatureData,
            timestamp: new Date().toISOString(),
          };
          break;

        case 'OTP_VERIFICATION':
          if (!otpCode) {
            throw new Error('Please enter OTP');
          }
          verificationSuccess = await verifyOTP(otpCode);
          if (!verificationSuccess) {
            throw new Error('Invalid OTP');
          }
          verificationData = { otp: otpCode };
          break;

        case 'DOCUMENT_UPLOAD':
          if (!uploadedDocument) {
            throw new Error('Please upload signed document');
          }
          verificationSuccess = true;
          verificationData = { documentUrl: 'uploaded_document.pdf' };
          break;
      }

      if (verificationSuccess) {
        const acceptanceRecord: TermsAcceptanceRecord = {
          customerId,
          documents: termsDocuments.map(doc => ({
            documentId: doc.id,
            accepted: acceptedDocuments.has(doc.id),
            acceptedAt: acceptedDocuments.has(doc.id) ? new Date().toISOString() : undefined,
            ipAddress: '192.168.1.1', // Mock IP
            userAgent: navigator.userAgent,
          })),
          digitalSignature: verificationMethod === 'DIGITAL_SIGNATURE' ? {
            signature: signatureData,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.1',
            userAgent: navigator.userAgent,
          } : undefined,
          verificationMethod,
          verificationData,
          completedAt: new Date().toISOString(),
          status: 'COMPLETED',
        };

        onTermsAccepted(acceptanceRecord);
      }
    } catch (error) {
      console.error('Verification failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentContent = (document: TermsDocument) => (
    <ScrollArea className="h-96 w-full">
      <div className="prose prose-sm max-w-none p-4">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {document.content}
        </pre>
      </div>
    </ScrollArea>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Review Terms & Conditions</h3>
        <p className="text-muted-foreground">
          Please review all documents carefully before proceeding
        </p>
      </div>

      <Tabs defaultValue={termsDocuments[0].id} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          {termsDocuments.map((doc) => (
            <TabsTrigger key={doc.id} value={doc.id} className="text-xs">
              {doc.title}
              {doc.isRequired && <span className="text-red-500 ml-1">*</span>}
            </TabsTrigger>
          ))}
        </TabsList>

        {termsDocuments.map((document) => (
          <TabsContent key={document.id} value={document.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {document.title}
                    </CardTitle>
                    <CardDescription>
                      Version {document.version} • Last updated {document.lastUpdated}
                      {document.isRequired && (
                        <Badge variant="destructive" className="ml-2">Required</Badge>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {renderDocumentContent(document)}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-center">
        <Button
          onClick={() => setCurrentStep('accept')}
          disabled={!allRequiredAccepted}
        >
          Continue to Acceptance
        </Button>
      </div>
    </div>
  );

  const renderAcceptanceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Accept Terms & Conditions</h3>
        <p className="text-muted-foreground">
          Please accept all required documents to proceed
        </p>
      </div>

      <div className="space-y-4">
        {termsDocuments.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id={document.id}
                  checked={acceptedDocuments.has(document.id)}
                  onCheckedChange={(checked) => handleDocumentAcceptance(document.id, checked === true)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor={document.id} className="text-base font-semibold cursor-pointer">
                    {document.title}
                    {document.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Version {document.version} • Last updated {document.lastUpdated}
                  </p>
                  <p className="text-sm mt-2">
                    I have read and understood the {document.title.toLowerCase()} and agree to be bound by its terms.
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('review')}>
          Back to Review
        </Button>
        <Button
          onClick={() => setCurrentStep('verify')}
          disabled={!allRequiredAccepted}
        >
          Proceed to Verification
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Verify Your Identity</h3>
        <p className="text-muted-foreground">
          Choose your preferred verification method
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{customerDetails.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{customerDetails.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{customerDetails.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{customerDetails.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Method</CardTitle>
          <CardDescription>
            Choose how you'd like to verify your acceptance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={cn(
                "cursor-pointer transition-all",
                verificationMethod === 'DIGITAL_SIGNATURE' ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => setVerificationMethod('DIGITAL_SIGNATURE')}
            >
              <CardContent className="p-4 text-center">
                <PenTool className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold">Digital Signature</h4>
                <p className="text-sm text-muted-foreground">Sign electronically</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-all",
                verificationMethod === 'OTP_VERIFICATION' ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => setVerificationMethod('OTP_VERIFICATION')}
            >
              <CardContent className="p-4 text-center">
                <Phone className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold">OTP Verification</h4>
                <p className="text-sm text-muted-foreground">Verify via SMS</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "cursor-pointer transition-all",
                verificationMethod === 'DOCUMENT_UPLOAD' ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => setVerificationMethod('DOCUMENT_UPLOAD')}
            >
              <CardContent className="p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-semibold">Document Upload</h4>
                <p className="text-sm text-muted-foreground">Upload signed document</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Verification Method Content */}
          {verificationMethod === 'DIGITAL_SIGNATURE' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Digital Signature</h4>
                <p className="text-sm text-muted-foreground">
                  Draw your signature below to accept the terms
                </p>
              </div>

              {!showSignaturePad ? (
                <div className="text-center">
                  <Button onClick={() => setShowSignaturePad(true)}>
                    <PenTool className="w-4 h-4 mr-2" />
                    Open Signature Pad
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-4">
                    <canvas
                      ref={signatureCanvasRef}
                      width={400}
                      height={200}
                      className="border border-gray-300 rounded w-full cursor-crosshair"
                      style={{ touchAction: 'none' }}
                    />
                  </div>

                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" onClick={clearSignature}>
                      Clear
                    </Button>
                    <Button onClick={handleSignatureCapture}>
                      Capture Signature
                    </Button>
                  </div>
                </div>
              )}

              {signatureData && (
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600">Signature captured successfully</p>
                </div>
              )}
            </div>
          )}

          {verificationMethod === 'OTP_VERIFICATION' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">OTP Verification</h4>
                <p className="text-sm text-muted-foreground">
                  We'll send a verification code to {customerDetails.phone}
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="w-32 text-center"
                />
                <Button variant="outline" onClick={sendOTP}>
                  Send OTP
                </Button>
              </div>
            </div>
          )}

          {verificationMethod === 'DOCUMENT_UPLOAD' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Document Upload</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a scanned copy of your signed terms document
                </p>
              </div>

              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>

              {uploadedDocument && (
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-600">
                    {uploadedDocument.name} uploaded successfully
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('accept')}>
          Back
        </Button>
        <Button
          onClick={handleVerification}
          disabled={isSubmitting || (
            (verificationMethod === 'DIGITAL_SIGNATURE' && !signatureData) ||
            (verificationMethod === 'OTP_VERIFICATION' && !otpCode) ||
            (verificationMethod === 'DOCUMENT_UPLOAD' && !uploadedDocument)
          )}
        >
          {isSubmitting ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Complete Verification
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-2">Terms Accepted Successfully</h3>
        <p className="text-muted-foreground">
          Your acceptance has been recorded and verified
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Customer ID:</span>
              <span className="font-mono">{customerId}</span>
            </div>
            <div className="flex justify-between">
              <span>Verification Method:</span>
              <span>{verificationMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed At:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to {customerDetails.email}
        </p>

        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
          <Button>
            Continue to Next Step
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { step: 'review', label: 'Review' },
          { step: 'accept', label: 'Accept' },
          { step: 'verify', label: 'Verify' },
          { step: 'complete', label: 'Complete' },
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
              currentStep === item.step
                ? "bg-primary text-primary-foreground"
                : index < ['review', 'accept', 'verify', 'complete'].indexOf(currentStep)
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-500"
            )}>
              <span>{index + 1}</span>
              <span>{item.label}</span>
            </div>
            {index < 3 && <div className="w-8 h-px bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 'review' && renderReviewStep()}
      {currentStep === 'accept' && renderAcceptanceStep()}
      {currentStep === 'verify' && renderVerificationStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default TermsAcceptanceWorkflow;
