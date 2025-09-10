import React, { useState, useEffect } from 'react';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  CreditCard,
  Globe,
  Shield,
  Zap,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Star,
  Gift,
  Truck,
  Plane,
  Download,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FXDebitCardCheckoutProps {
  onClose?: () => void;
}

type CheckoutStep = 'summary' | 'selection' | 'details' | 'insurance' | 'checkout' | 'mpin' | 'processing' | 'success';

interface CardOption {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  pan: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface TravelInsurance {
  selected: boolean;
  nomineeName: string;
  nomineeRelation: string;
  coverage: number;
}

const FXDebitCardCheckout: React.FC<FXDebitCardCheckoutProps> = ({ onClose }) => {
  const { checkoutState, selectPaymentMethod, paymentMethods, processPayment, initializeSDK, startCheckout, config } = usePaymentSDK();

  // State management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('summary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Form states
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    pan: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [travelInsurance, setTravelInsurance] = useState<TravelInsurance>({
    selected: false,
    nomineeName: '',
    nomineeRelation: '',
    coverage: 5000000
  });
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [mpinAttempts, setMpinAttempts] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [addressFetched, setAddressFetched] = useState(false);
  const [panValidated, setPanValidated] = useState(false);

  // Card options
  const cardOptions: CardOption[] = [
    {
      id: 'fx_standard',
      name: 'FX Debit Card - Standard',
      price: 499,
      features: ['Zero FX markup', 'Free ATM withdrawals', 'Contactless payments', 'Online shopping protection'],
      recommended: true
    },
    {
      id: 'fx_premium',
      name: 'FX Debit Card - Premium',
      price: 799,
      features: ['Zero FX markup', 'Free ATM withdrawals', 'Contactless payments', 'Online shopping protection', 'Travel insurance included', 'Lounge access']
    },
    {
      id: 'fx_family',
      name: 'FX Debit Card - Family Pack',
      price: 1299,
      features: ['3 Cards included', 'Zero FX markup', 'Free ATM withdrawals', 'Contactless payments', 'Online shopping protection', 'Family travel insurance']
    }
  ];

  // Mock data for demonstration
  const offers = [
    {
      id: 'welcome_bonus',
      title: 'Welcome Bonus',
      description: 'Get ₹500 cashback on your first international transaction',
      validUntil: '2024-12-31',
      code: 'WELCOME500'
    },
    {
      id: 'fx_discount',
      title: 'FX Fee Waiver',
      description: 'Zero foreign exchange markup for 6 months',
      validUntil: '2024-12-31',
      code: 'FXZERO'
    }
  ];

  const faqs = [
    {
      question: 'What is the difference between Regular Debit Card and FX Debit Card?',
      answer: 'The Regular Debit Card offers standard banking features for domestic transactions. The FX Debit Card provides zero foreign exchange markup on international transactions, free worldwide ATM withdrawals, and includes travel insurance.'
    },
    {
      question: 'How does zero FX markup work?',
      answer: 'Zero FX markup means you get the actual interbank exchange rate without any additional fees or markups when making international transactions. This can save you up to 5-7% on currency conversions.'
    },
    {
      question: 'Are there any annual fees for the FX Debit Card?',
      answer: 'The FX Debit Card has a one-time issuance fee. There are no annual fees, monthly fees, or foreign transaction fees.'
    }
  ];

  // Auto-initialize SDK when component mounts
  useEffect(() => {
    const initializeSDKForFXCard = async () => {
      try {
        if (!config) {
          await initializeSDK({
            merchantId: 'demo_merchant_123',
            publicKey: 'pk_demo_key',
            environment: 'sandbox',
            theme: {
              primaryColor: '#2563eb',
              borderRadius: 'md',
            }
          });
        }

        // Start a checkout session for FX Debit Card
        console.log('Starting FX Debit Card checkout session...');
        await startCheckout({
          orderId: `fx_card_order_${Date.now()}`,
          amount: 49900, // 499 INR in paise
          currency: 'INR',
          description: 'FX Debit Card Issuance Fee',
          customerId: 'fx_demo_customer',
        });

      } catch (error) {
        console.error('Failed to initialize SDK for FX Debit Card:', error);
        setError('Failed to initialize payment system');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSDKForFXCard();
  }, [config, initializeSDK, startCheckout]);

  // Helper functions
  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const fetchAddressFromCBS = async () => {
    // Mock CBS API call
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock outdated address response
      setCustomerDetails(prev => ({
        ...prev,
        address: {
          line1: 'Old Address - Please Update',
          line2: '',
          city: 'Old City',
          state: 'Old State',
          pincode: '000000'
        }
      }));
      setAddressFetched(true);
      setError('Address fetched from CBS is outdated. Please update your current address.');
    } catch (err) {
      setError('Failed to fetch address from CBS');
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePAN = async () => {
    if (!customerDetails.pan || customerDetails.pan.length !== 10) {
      setError('Please enter a valid 10-digit PAN number');
      return false;
    }

    // Mock PAN validation
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPanValidated(true);
      return true;
    } catch (err) {
      setError('PAN validation failed');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMpinSubmit = async () => {
    if (!mpin || mpin.length !== 4) {
      setError('Please enter a valid 4-digit MPIN');
      return;
    }

    const isValidMpin = mpin === '1234'; // Mock valid MPIN

    if (isValidMpin) {
      setCurrentStep('processing');
      setError('');
      await handlePaymentProcessing();
    } else {
      const newAttempts = mpinAttempts + 1;
      setMpinAttempts(newAttempts);

      if (newAttempts >= 3) {
        setError('Maximum MPIN attempts exceeded. Please try again later.');
      } else {
        setError(`Invalid MPIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handlePaymentProcessing = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setCurrentStep('success');
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    const cardTotal = selectedCards.reduce((total, cardId) => {
      const card = cardOptions.find(c => c.id === cardId);
      return total + (card?.price || 0);
    }, 0);

    const insuranceTotal = travelInsurance.selected ? 299 : 0;
    return cardTotal + insuranceTotal;
  };

  // Step navigation
  const nextStep = () => {
    const steps: CheckoutStep[] = ['summary', 'selection', 'details', 'insurance', 'checkout', 'mpin', 'processing', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: CheckoutStep[] = ['summary', 'selection', 'details', 'insurance', 'checkout', 'mpin', 'processing', 'success'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const fxDebitCardMethod = paymentMethods.find(method => method.type === 'fxdebitcard');

  useEffect(() => {
    if (fxDebitCardMethod && checkoutState.currentStep === 'methods') {
      selectPaymentMethod(fxDebitCardMethod);
    }
  }, [fxDebitCardMethod, checkoutState.currentStep, selectPaymentMethod]);



  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto animate-pulse">
            💎
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Initializing FX Debit Card
          </h3>
          <p className="text-muted-foreground">
            Please wait while we set up your payment options...
          </p>
        </div>
      </div>
    );
  }

  // Main component render with step-based flow
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold">FX Debit Card Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase in a few simple steps</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { step: 'summary', label: 'Summary' },
          { step: 'selection', label: 'Select' },
          { step: 'details', label: 'Details' },
          { step: 'insurance', label: 'Insurance' },
          { step: 'checkout', label: 'Checkout' },
          { step: 'mpin', label: 'MPIN' },
          { step: 'processing', label: 'Processing' },
          { step: 'success', label: 'Success' },
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
              currentStep === item.step
                ? "bg-primary text-primary-foreground"
                : index < ['summary', 'selection', 'details', 'insurance', 'checkout', 'mpin', 'processing', 'success'].indexOf(currentStep)
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-500"
            )}>
              <span>{index + 1}</span>
              <span>{item.label}</span>
            </div>
            {index < 7 && <div className="w-8 h-px bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      {/* Error Display */}
      {error && (
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
      {currentStep === 'summary' && renderSummaryStep()}
      {currentStep === 'selection' && renderSelectionStep()}
      {currentStep === 'details' && renderDetailsStep()}
      {currentStep === 'insurance' && renderInsuranceStep()}
      {currentStep === 'checkout' && renderCheckoutStep()}
      {currentStep === 'mpin' && renderMpinStep()}
      {currentStep === 'processing' && renderProcessingStep()}
      {currentStep === 'success' && renderSuccessStep()}

      {/* Navigation */}
      {currentStep !== 'processing' && currentStep !== 'success' && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 'summary'}
          >
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={getNextButtonDisabled()}
          >
            {currentStep === 'mpin' ? 'Authorize Payment' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );

  // Helper function to determine if next button should be disabled
  function getNextButtonDisabled(): boolean {
    switch (currentStep) {
      case 'summary':
        return !acceptedTerms || !acceptedPrivacy;
      case 'selection':
        return selectedCards.length === 0;
      case 'details':
        return !customerDetails.name || !customerDetails.email || !customerDetails.phone || !panValidated;
      case 'insurance':
        return travelInsurance.selected && (!travelInsurance.nomineeName || !travelInsurance.nomineeRelation);
      case 'checkout':
        return !acceptedTerms || !acceptedPrivacy;
      case 'mpin':
        return !mpin || mpin.length !== 4 || mpinAttempts >= 3;
      default:
        return false;
    }
  }

  // Step render functions
  function renderSummaryStep() {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
                <CardDescription>Why choose the FX Debit Card?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                    <Globe className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Zero FX Markup</h4>
                      <p className="text-sm text-muted-foreground">Get the best exchange rates on international transactions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                    <Shield className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Travel Insurance</h4>
                      <p className="text-sm text-muted-foreground">₹50 lakhs coverage included for international travel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Current Offers</h3>
              {offers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">{offer.title}</h4>
                        <p className="text-muted-foreground mb-3">{offer.description}</p>
                        <Badge variant="outline">{offer.code}</Badge>
                      </div>
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    />
                    <div>
                      <Label htmlFor="terms" className="text-sm font-medium">I accept the Terms and Conditions</Label>
                      <p className="text-xs text-muted-foreground">I have read and agree to the Terms of Service</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                    />
                    <div>
                      <Label htmlFor="privacy" className="text-sm font-medium">I accept the Privacy Policy</Label>
                      <p className="text-xs text-muted-foreground">I consent to the collection of my personal information</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  function renderSelectionStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Choose Your FX Debit Card</h3>
          <p className="text-muted-foreground">Select one or more cards that best fit your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardOptions.map((card) => (
            <Card
              key={card.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedCards.includes(card.id) ? "ring-2 ring-primary" : "hover:shadow-lg"
              )}
              onClick={() => handleCardSelection(card.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  {card.recommended && <Badge>Recommended</Badge>}
                </div>
                <div className="text-2xl font-bold text-primary">₹{card.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {card.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Checkbox
                    checked={selectedCards.includes(card.id)}
                    onChange={() => handleCardSelection(card.id)}
                  />
                  <Label className="ml-2">Select this card</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderDetailsStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Customer Details</h3>
          <p className="text-muted-foreground">Please provide your information for card delivery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="pan">PAN Number</Label>
                <div className="flex space-x-2">
                  <Input
                    id="pan"
                    value={customerDetails.pan}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                  <Button
                    onClick={validatePAN}
                    disabled={panValidated || !customerDetails.pan}
                    variant={panValidated ? "default" : "outline"}
                  >
                    {panValidated ? <CheckCircle className="w-4 h-4" /> : "Validate"}
                  </Button>
                </div>
                {panValidated && <p className="text-sm text-green-600">PAN validated successfully</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Delivery Address
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAddressFromCBS}
                  disabled={addressFetched}
                >
                  {addressFetched ? <CheckCircle className="w-4 h-4" /> : "Fetch from CBS"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  value={customerDetails.address.line1}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value }
                  }))}
                  placeholder="Enter address line 1"
                />
              </div>
              <div>
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input
                  id="address2"
                  value={customerDetails.address.line2}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value }
                  }))}
                  placeholder="Enter address line 2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={customerDetails.address.city}
                    onChange={(e) => setCustomerDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={customerDetails.address.state}
                    onChange={(e) => setCustomerDetails(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pincode">PIN Code</Label>
                <Input
                  id="pincode"
                  value={customerDetails.address.pincode}
                  onChange={(e) => setCustomerDetails(prev => ({
                    ...prev,
                    address: { ...prev.address, pincode: e.target.value }
                  }))}
                  placeholder="Enter PIN code"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function renderInsuranceStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Travel Insurance</h3>
          <p className="text-muted-foreground">Add comprehensive travel insurance for your international trips</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Travel Insurance Coverage</CardTitle>
            <CardDescription>₹{travelInsurance.coverage.toLocaleString()} coverage for medical emergencies and trip interruptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="insurance"
                checked={travelInsurance.selected}
                onCheckedChange={(checked) => setTravelInsurance(prev => ({ ...prev, selected: checked === true }))}
              />
              <div className="flex-1">
                <Label htmlFor="insurance" className="text-lg font-semibold">Add Travel Insurance (₹299)</Label>
                <p className="text-sm text-muted-foreground">Comprehensive coverage for international travel</p>
              </div>
            </div>

            {travelInsurance.selected && (
              <div className="space-y-4 pl-7">
                <div>
                  <Label htmlFor="nomineeName">Nominee Name</Label>
                  <Input
                    id="nomineeName"
                    value={travelInsurance.nomineeName}
                    onChange={(e) => setTravelInsurance(prev => ({ ...prev, nomineeName: e.target.value }))}
                    placeholder="Enter nominee name"
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeRelation">Relationship</Label>
                  <Input
                    id="nomineeRelation"
                    value={travelInsurance.nomineeRelation}
                    onChange={(e) => setTravelInsurance(prev => ({ ...prev, nomineeRelation: e.target.value }))}
                    placeholder="e.g., Spouse, Parent, Child"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Coverage Includes:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Medical emergencies up to ₹{travelInsurance.coverage.toLocaleString()}</li>
                    <li>• Trip cancellation and interruption</li>
                    <li>• Lost baggage compensation</li>
                    <li>• 24/7 emergency assistance</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderCheckoutStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Order Review</h3>
          <p className="text-muted-foreground">Please review your order before proceeding to payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCards.map((cardId) => {
                const card = cardOptions.find(c => c.id === cardId);
                return card ? (
                  <div key={card.id} className="flex justify-between items-center">
                    <span>{card.name}</span>
                    <span className="font-semibold">₹{card.price}</span>
                  </div>
                ) : null;
              })}
              {travelInsurance.selected && (
                <div className="flex justify-between items-center">
                  <span>Travel Insurance</span>
                  <span className="font-semibold">₹299</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{customerDetails.name}</p>
                <p className="text-sm text-muted-foreground">
                  {customerDetails.address.line1}<br />
                  {customerDetails.address.line2 && <>{customerDetails.address.line2}<br /></>}
                  {customerDetails.address.city}, {customerDetails.address.state} {customerDetails.address.pincode}
                </p>
                <p className="text-sm text-muted-foreground">{customerDetails.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="final-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                />
                <div>
                  <Label htmlFor="final-terms" className="text-sm font-medium">I accept the Terms and Conditions</Label>
                  <p className="text-xs text-muted-foreground">Final confirmation of terms and conditions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="final-privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                />
                <div>
                  <Label htmlFor="final-privacy" className="text-sm font-medium">I accept the Privacy Policy</Label>
                  <p className="text-xs text-muted-foreground">Final confirmation of privacy policy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderMpinStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Secure Payment</h3>
          <p className="text-muted-foreground">Enter your MPIN to authorize the payment</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle>MPIN Authentication</CardTitle>
            <CardDescription>Enter your 4-digit MPIN to complete the transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="mpin">MPIN</Label>
              <div className="relative">
                <Input
                  id="mpin"
                  type={showMpin ? "text" : "password"}
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit MPIN"
                  className="text-center text-lg"
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
              <p>Attempts remaining: {3 - mpinAttempts}</p>
            </div>

            <Button
              onClick={handleMpinSubmit}
              disabled={!mpin || mpin.length !== 4 || mpinAttempts >= 3}
              className="w-full"
            >
              Authorize Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderProcessingStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto animate-pulse">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Processing Payment</h3>
          <p className="text-muted-foreground">Please wait while we process your transaction...</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Progress value={75} className="w-full mb-4" />
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Validating payment details</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Processing transaction</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                <span>Confirming with bank</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function renderSuccessStep() {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
          <p className="text-muted-foreground">Your FX Debit Card order has been confirmed</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono font-semibold">FX_{Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-semibold">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cards Ordered</span>
                <span className="font-semibold">{selectedCards.length}</span>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full">
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4">What's Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Mail className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Email Confirmation</p>
                <p className="text-xs text-muted-foreground">Check your email for order details</p>
              </div>
              <div className="space-y-2">
                <Truck className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Card Delivery</p>
                <p className="text-xs text-muted-foreground">Cards will be delivered in 7-10 days</p>
              </div>
              <div className="space-y-2">
                <Phone className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm font-medium">Activation</p>
                <p className="text-xs text-muted-foreground">Follow SMS instructions to activate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default FXDebitCardCheckout;
