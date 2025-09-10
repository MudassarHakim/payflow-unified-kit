import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Globe,
  Shield,
  Zap,
  Gift,
  CheckCircle,
  Star,
  Clock,
  CreditCard,
  Plane,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Download,
  ExternalLink,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FXDebitCardSummaryProps {
  onAcceptTerms: () => void;
  onDeclineTerms: () => void;
  className?: string;
}

const FXDebitCardSummary: React.FC<FXDebitCardSummaryProps> = ({
  onAcceptTerms,
  onDeclineTerms,
  className
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  const currentOffers = [
    {
      id: 'welcome_bonus',
      title: 'Welcome Bonus',
      description: 'Get ₹500 cashback on your first international transaction',
      validUntil: '2024-12-31',
      code: 'WELCOME500',
      type: 'cashback' as const,
    },
    {
      id: 'fx_discount',
      title: 'FX Fee Waiver',
      description: 'Zero foreign exchange markup for 6 months',
      validUntil: '2024-12-31',
      code: 'FXZERO',
      type: 'fee_waiver' as const,
    },
    {
      id: 'travel_insurance',
      title: 'Complimentary Travel Insurance',
      description: '₹50 lakhs coverage included for 1 year',
      validUntil: '2024-12-31',
      code: 'TRAVEL50L',
      type: 'insurance' as const,
    },
  ];

  const faqs = [
    {
      question: 'What is the difference between Regular Debit Card and FX Debit Card?',
      answer: 'The Regular Debit Card offers standard banking features for domestic transactions. The FX Debit Card provides zero foreign exchange markup on international transactions, free worldwide ATM withdrawals, and includes travel insurance.',
    },
    {
      question: 'How does zero FX markup work?',
      answer: 'Zero FX markup means you get the actual interbank exchange rate without any additional fees or markups when making international transactions. This can save you up to 5-7% on currency conversions.',
    },
    {
      question: 'Are there any annual fees for the FX Debit Card?',
      answer: 'The FX Debit Card has a one-time issuance fee of ₹499. There are no annual fees, monthly fees, or foreign transaction fees.',
    },
    {
      question: 'What is included in the travel insurance?',
      answer: 'The complimentary travel insurance provides coverage up to ₹50 lakhs for medical emergencies, trip cancellations, lost baggage, and personal accidents during international travel.',
    },
    {
      question: 'How long does card delivery take?',
      answer: 'Cards are typically delivered within 7-10 business days. You will receive tracking information via SMS and email once your order is confirmed.',
    },
    {
      question: 'Can I use the FX Debit Card for online shopping?',
      answer: 'Yes, the FX Debit Card works for both online and offline transactions worldwide. It supports contactless payments and is accepted at millions of merchants globally.',
    },
    {
      question: 'What happens if I lose my card?',
      answer: 'You can immediately block your card through our mobile app, website, or by calling customer care. A replacement card will be issued within 3-5 business days.',
    },
    {
      question: 'Are there any ATM withdrawal limits?',
      answer: 'You can withdraw up to ₹1 lakh per day from ATMs. For international ATMs, the limit is based on your daily transaction limit and available balance.',
    },
  ];

  const keyBenefits = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Zero FX Markup',
      description: 'Get the best possible exchange rates on international transactions',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Free ATM Withdrawals',
      description: 'Withdraw cash for free from any ATM worldwide',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Travel Insurance',
      description: '₹50 lakhs coverage included for international travel',
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Contactless Payments',
      description: 'Fast and secure payments with NFC technology',
    },
  ];

  const canProceed = acceptedTerms && acceptedPrivacy;

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          FX Debit Card Summary
        </h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about your new FX Debit Card
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-primary" />
                Key Benefits
              </CardTitle>
              <CardDescription>
                Why choose the FX Debit Card for your international spending needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card Details */}
          <Card>
            <CardHeader>
              <CardTitle>Card Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Pricing</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Issuance Fee</span>
                      <span className="font-semibold">₹499 (one-time)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Fee</span>
                      <span className="font-semibold text-green-600">₹0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>FX Markup</span>
                      <span className="font-semibold text-green-600">0%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Daily ATM Limit</span>
                      <span>₹1,00,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per Transaction</span>
                      <span>₹1,00,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Limit</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card Features
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Physical and Digital Card
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Contactless Payments
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Online Payment Protection
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Real-time Transaction Alerts
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center">
                    <Plane className="w-4 h-4 mr-2" />
                    Travel Benefits
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      ₹50 Lakhs Travel Insurance
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Free Worldwide ATM Access
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      24/7 Travel Assistance
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Emergency Card Replacement
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Current Offers</h3>
            <p className="text-muted-foreground">
              Take advantage of these exclusive offers available with your FX Debit Card
            </p>

            <div className="grid gap-4">
              {currentOffers.map((offer) => (
                <Card key={offer.id} className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold">
                    Limited Time
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">{offer.title}</h4>
                        <p className="text-muted-foreground mb-3">{offer.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Valid until {new Date(offer.validUntil).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">{offer.code}</Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Gift className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
            <p className="text-muted-foreground">
              Find answers to common questions about the FX Debit Card
            </p>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        <TabsContent value="terms" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Terms & Conditions</h3>
            <p className="text-muted-foreground">
              Please review and accept the terms and conditions to proceed
            </p>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the Terms and Conditions
                      </label>
                      <p className="text-xs text-muted-foreground">
                        I have read and agree to the{' '}
                        <Button variant="link" className="h-auto p-0 text-xs">
                          Terms of Service
                        </Button>{' '}
                        and{' '}
                        <Button variant="link" className="h-auto p-0 text-xs">
                          User Agreement
                        </Button>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={acceptedPrivacy}
                      onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="privacy"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the Privacy Policy
                      </label>
                      <p className="text-xs text-muted-foreground">
                        I consent to the collection and use of my personal information as described in the{' '}
                        <Button variant="link" className="h-auto p-0 text-xs">
                          Privacy Policy
                        </Button>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={acceptedMarketing}
                      onCheckedChange={(checked) => setAcceptedMarketing(checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="marketing"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to receive marketing communications (optional)
                      </label>
                      <p className="text-xs text-muted-foreground">
                        I would like to receive promotional offers and updates via email and SMS
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Information</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Card delivery typically takes 7-10 business days</li>
                      <li>• You will receive activation instructions via SMS and email</li>
                      <li>• Keep your card details secure and do not share them with anyone</li>
                      <li>• Report lost or stolen cards immediately to customer care</li>
                      <li>• Terms and conditions are subject to change with prior notice</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={onDeclineTerms}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={onAcceptTerms}
              disabled={!canProceed}
              className="flex-1 sm:flex-none"
            >
              Accept & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {!canProceed && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Please accept the Terms and Conditions and Privacy Policy to continue
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="text-center">
            <h4 className="font-semibold mb-4">Need Help?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm">1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm">support@mockbank.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Live Chat</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FXDebitCardSummary;
