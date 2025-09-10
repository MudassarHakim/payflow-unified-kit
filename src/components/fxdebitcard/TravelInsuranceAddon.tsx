import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  User,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Plane,
  Heart,
  Briefcase,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { travelInsuranceApiService } from '@/services/travelInsuranceApi';
import { cbsApiService } from '@/services/cbsApi';

export interface NomineeDetails {
  name: string;
  relationship: string;
  dateOfBirth: string;
  contactNumber: string;
  email?: string;
  address: string;
  percentage: number;
}

export interface TravelInsurancePlan {
  planId: string;
  name: string;
  coverage: number; // in rupees
  premium: number; // annual premium
  features: string[];
  recommended?: boolean;
  maxTripDuration: number; // in days
  medicalCoverage: number;
  tripCancellationCoverage: number;
  baggageCoverage: number;
}

export interface TravelInsuranceAddonData {
  selectedPlan?: TravelInsurancePlan;
  nominees: NomineeDetails[];
  panNumber: string;
  panVerified: boolean;
  termsAccepted: boolean;
  totalPremium: number;
}

interface TravelInsuranceAddonProps {
  customerId: string;
  onInsuranceSelected: (data: TravelInsuranceAddonData) => void;
  onSkip: () => void;
  className?: string;
}

const TravelInsuranceAddon: React.FC<TravelInsuranceAddonProps> = ({
  customerId,
  onInsuranceSelected,
  onSkip,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'plans' | 'nominees' | 'verification' | 'summary'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<TravelInsurancePlan | null>(null);
  const [nominees, setNominees] = useState<NomineeDetails[]>([]);
  const [panNumber, setPanNumber] = useState('');
  const [panVerified, setPanVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [availablePlans, setAvailablePlans] = useState<TravelInsurancePlan[]>([]);

  // New nominee form state
  const [showNomineeForm, setShowNomineeForm] = useState(false);
  const [newNominee, setNewNominee] = useState<Partial<NomineeDetails>>({
    percentage: 100,
  });

  useEffect(() => {
    fetchInsurancePlans();
  }, []);

  const fetchInsurancePlans = async () => {
    try {
      setIsLoading(true);
      // Mock data for insurance plans
      const mockPlans: TravelInsurancePlan[] = [
        {
          planId: 'basic_travel',
          name: 'Basic Travel Protection',
          coverage: 2500000, // ₹25 lakhs
          premium: 1499,
          maxTripDuration: 30,
          medicalCoverage: 2000000,
          tripCancellationCoverage: 250000,
          baggageCoverage: 25000,
          features: [
            'Medical expenses up to ₹20 lakhs',
            'Trip cancellation/interruption up to ₹2.5 lakhs',
            'Lost baggage up to ₹25,000',
            'Emergency medical evacuation',
            '24/7 assistance hotline',
          ],
        },
        {
          planId: 'premium_travel',
          name: 'Premium Travel Protection',
          coverage: 5000000, // ₹50 lakhs
          premium: 2499,
          maxTripDuration: 90,
          medicalCoverage: 4000000,
          tripCancellationCoverage: 500000,
          baggageCoverage: 50000,
          recommended: true,
          features: [
            'Medical expenses up to ₹40 lakhs',
            'Trip cancellation/interruption up to ₹5 lakhs',
            'Lost baggage up to ₹50,000',
            'Emergency medical evacuation',
            'Personal accident coverage',
            'Adventure sports coverage',
            '24/7 assistance hotline',
            'Legal assistance abroad',
          ],
        },
        {
          planId: 'elite_travel',
          name: 'Elite Travel Protection',
          coverage: 10000000, // ₹1 crore
          premium: 4999,
          maxTripDuration: 180,
          medicalCoverage: 7500000,
          tripCancellationCoverage: 1000000,
          baggageCoverage: 100000,
          features: [
            'Medical expenses up to ₹75 lakhs',
            'Trip cancellation/interruption up to ₹10 lakhs',
            'Lost baggage up to ₹1 lakh',
            'Emergency medical evacuation',
            'Personal accident coverage',
            'Adventure sports coverage',
            'Hijack coverage',
            '24/7 assistance hotline',
            'Legal assistance abroad',
            'Translation services',
            'Concierge services',
          ],
        },
      ];

      setAvailablePlans(mockPlans);
    } catch (err) {
      console.error('Failed to fetch insurance plans:', err);
      setError('Failed to load insurance plans');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePAN = async (pan: string): Promise<boolean> => {
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return false;
    }

    try {
      // Mock PAN validation - in real implementation, this would call an external service
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (err) {
      return false;
    }
  };

  const handlePANVerification = async () => {
    if (!panNumber) {
      setError('Please enter PAN number');
      return;
    }

    try {
      setIsLoading(true);
      const isValid = await validatePAN(panNumber);
      if (isValid) {
        setPanVerified(true);
        setError('');
      } else {
        setError('Invalid PAN number format');
      }
    } catch (err) {
      setError('Failed to verify PAN number');
    } finally {
      setIsLoading(false);
    }
  };

  const addNominee = () => {
    if (!newNominee.name || !newNominee.relationship || !newNominee.dateOfBirth || !newNominee.contactNumber || !newNominee.address) {
      setError('Please fill all required nominee details');
      return;
    }

    if (nominees.length >= 2) {
      setError('Maximum 2 nominees allowed');
      return;
    }

    const totalPercentage = nominees.reduce((sum, n) => sum + n.percentage, 0) + (newNominee.percentage || 0);
    if (totalPercentage > 100) {
      setError('Total nominee percentage cannot exceed 100%');
      return;
    }

    setNominees(prev => [...prev, newNominee as NomineeDetails]);
    setNewNominee({ percentage: 100 - totalPercentage });
    setShowNomineeForm(false);
    setError('');
  };

  const removeNominee = (index: number) => {
    setNominees(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalPremium = () => {
    return selectedPlan?.premium || 0;
  };

  const handleComplete = () => {
    if (!selectedPlan) {
      setError('Please select an insurance plan');
      return;
    }

    if (nominees.length === 0) {
      setError('Please add at least one nominee');
      return;
    }

    if (!panVerified) {
      setError('Please verify your PAN number');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the insurance terms');
      return;
    }

    const addonData: TravelInsuranceAddonData = {
      selectedPlan,
      nominees,
      panNumber,
      panVerified,
      termsAccepted,
      totalPremium: calculateTotalPremium(),
    };

    onInsuranceSelected(addonData);
  };

  const renderPlansStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Travel Insurance Plans</h3>
        <p className="text-muted-foreground">
          Choose a comprehensive travel insurance plan for your FX Debit Card
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card
              key={plan.planId}
              className={cn(
                "relative cursor-pointer transition-all duration-300",
                selectedPlan?.planId === plan.planId
                  ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                  : "hover:border-primary/50 hover:shadow-md",
                plan.recommended && "ring-2 ring-primary/20"
              )}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-primary mx-auto mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold text-primary mt-2">
                  ₹{plan.premium}
                  <span className="text-sm font-normal text-muted-foreground">/year</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Coverage up to ₹{plan.coverage.toLocaleString('en-IN')}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Medical Coverage:</span>
                    <span className="font-semibold">₹{plan.medicalCoverage.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Trip Cancellation:</span>
                    <span className="font-semibold">₹{plan.tripCancellationCoverage.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Baggage Coverage:</span>
                    <span className="font-semibold">₹{plan.baggageCoverage.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Trip Duration:</span>
                    <span className="font-semibold">{plan.maxTripDuration} days</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  className={cn(
                    "w-full",
                    selectedPlan?.planId === plan.planId
                      ? "bg-primary text-primary-foreground"
                      : "variant-outline"
                  )}
                  variant={selectedPlan?.planId === plan.planId ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan);
                  }}
                >
                  {selectedPlan?.planId === plan.planId ? 'Selected' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onSkip}>
          Skip Insurance
        </Button>
        <Button
          onClick={() => setCurrentStep('nominees')}
          disabled={!selectedPlan}
        >
          Continue with Nominees
        </Button>
      </div>
    </div>
  );

  const renderNomineesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Nominee Details</h3>
        <p className="text-muted-foreground">
          Add nominee(s) for your travel insurance coverage
        </p>
      </div>

      {/* Existing Nominees */}
      {nominees.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold">Added Nominees</h4>
          {nominees.map((nominee, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-semibold">{nominee.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        {nominee.relationship} • {nominee.percentage}% share
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeNominee(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Nominee */}
      {!showNomineeForm ? (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowNomineeForm(true)}
            disabled={nominees.length >= 2}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Nominee
          </Button>
          {nominees.length >= 2 && (
            <p className="text-sm text-muted-foreground mt-2">
              Maximum 2 nominees allowed
            </p>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Nominee</CardTitle>
            <CardDescription>
              Enter nominee details for insurance claim processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomineeName">Full Name *</Label>
                <Input
                  id="nomineeName"
                  placeholder="Enter full name"
                  value={newNominee.name || ''}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select
                  value={newNominee.relationship || ''}
                  onValueChange={(value) => setNewNominee(prev => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newNominee.dateOfBirth || ''}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number *</Label>
                <Input
                  id="contact"
                  placeholder="10-digit mobile number"
                  value={newNominee.contactNumber || ''}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, contactNumber: e.target.value }))}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={newNominee.email || ''}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Percentage Share *</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="100"
                  value={newNominee.percentage || ''}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, percentage: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Complete address"
                value={newNominee.address || ''}
                onChange={(e) => setNewNominee(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowNomineeForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addNominee} className="flex-1">
                Add Nominee
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('plans')}>
          Back to Plans
        </Button>
        <Button
          onClick={() => setCurrentStep('verification')}
          disabled={nominees.length === 0}
        >
          Continue to Verification
        </Button>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">PAN Verification</h3>
        <p className="text-muted-foreground">
          Verify your PAN details for insurance processing
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pan">PAN Number *</Label>
            <div className="flex space-x-2">
              <Input
                id="pan"
                placeholder="ABCDE1234F"
                value={panNumber}
                onChange={(e) => {
                  setPanNumber(e.target.value.toUpperCase());
                  setPanVerified(false);
                }}
                maxLength={10}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handlePANVerification}
                disabled={!panNumber || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            {panVerified && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                PAN verified successfully
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Insurance Terms & Conditions</h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms1"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                />
                <Label htmlFor="terms1" className="text-sm leading-relaxed cursor-pointer">
                  I have read and understood the insurance policy terms and conditions, including coverage details, exclusions, and claim procedures.
                </Label>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Important Notes:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Coverage is valid for international travel only</li>
                <li>• Pre-existing medical conditions are not covered</li>
                <li>• Claims must be reported within 24 hours of incident</li>
                <li>• Maximum trip duration: {selectedPlan?.maxTripDuration} days</li>
                <li>• Emergency assistance available 24/7</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('nominees')}>
          Back to Nominees
        </Button>
        <Button
          onClick={() => setCurrentStep('summary')}
          disabled={!panVerified || !termsAccepted}
        >
          Continue to Summary
        </Button>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Insurance Summary</h3>
        <p className="text-muted-foreground">
          Review your travel insurance selection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Selected Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{selectedPlan?.name}</h4>
              <p className="text-2xl font-bold text-primary">₹{selectedPlan?.premium}/year</p>
              <p className="text-sm text-muted-foreground">
                Coverage up to ₹{selectedPlan?.coverage.toLocaleString('en-IN')}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h5 className="font-semibold">Coverage Details:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Medical: ₹{selectedPlan?.medicalCoverage.toLocaleString('en-IN')}</div>
                <div>Cancellation: ₹{selectedPlan?.tripCancellationCoverage.toLocaleString('en-IN')}</div>
                <div>Baggage: ₹{selectedPlan?.baggageCoverage.toLocaleString('en-IN')}</div>
                <div>Max Duration: {selectedPlan?.maxTripDuration} days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nominees Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Nominees ({nominees.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nominees.map((nominee, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">{nominee.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {nominee.relationship} • {nominee.percentage}%
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Verification Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">PAN Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Terms Accepted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Nominees Added</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Total Insurance Premium</h4>
              <p className="text-sm text-muted-foreground">
                Annual premium for comprehensive travel coverage
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">₹{calculateTotalPremium()}</p>
              <p className="text-sm text-muted-foreground">per year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => setCurrentStep('verification')}>
          Back to Verification
        </Button>
        <Button onClick={handleComplete}>
          Add Insurance to Order
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[
          { step: 'plans', label: 'Plans' },
          { step: 'nominees', label: 'Nominees' },
          { step: 'verification', label: 'Verification' },
          { step: 'summary', label: 'Summary' },
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <div className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium",
              currentStep === item.step
                ? "bg-primary text-primary-foreground"
                : index < ['plans', 'nominees', 'verification', 'summary'].indexOf(currentStep)
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
      {currentStep === 'plans' && renderPlansStep()}
      {currentStep === 'nominees' && renderNomineesStep()}
      {currentStep === 'verification' && renderVerificationStep()}
      {currentStep === 'summary' && renderSummaryStep()}
    </div>
  );
};

export default TravelInsuranceAddon;
