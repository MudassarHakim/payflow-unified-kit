import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  TrendingUp,
  Shield,
  Zap,
  Star,
  CheckCircle,
  ArrowUp,
  Calculator,
  Gift,
  Clock,
  Users,
  Globe,
  Smartphone,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CurrentCardDetails {
  cardId: string;
  cardNumber: string; // Masked
  cardType: 'STANDARD' | 'PREMIUM' | 'ELITE';
  currentTier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
  monthlySpend: number;
  fxTransactions: number;
  rewardsEarned: number;
  expiryDate: string;
  issuedDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

export interface UpgradeOption {
  id: string;
  name: string;
  description: string;
  currentValue: string | number;
  upgradedValue: string | number;
  upgradeCost: number;
  monthlyBenefit: number;
  category: 'TIER_UPGRADE' | 'LIMIT_INCREASE' | 'FEATURE_ADDON' | 'REWARDS_BOOST';
  prerequisites?: string[];
  estimatedPaybackMonths: number;
  popularity: number; // 1-5 stars
  recommended?: boolean;
}

export interface UpgradeRecommendation {
  optionId: string;
  reasoning: string;
  potentialSavings: number;
  confidence: number; // 0-100
  timeframe: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
}

interface UpgradeOptionsDisplayProps {
  customerId: string;
  currentCard: CurrentCardDetails;
  onUpgradeSelect: (option: UpgradeOption) => void;
  onCalculateSavings: (option: UpgradeOption) => void;
  className?: string;
}

const UpgradeOptionsDisplay: React.FC<UpgradeOptionsDisplayProps> = ({
  customerId,
  currentCard,
  onUpgradeSelect,
  onCalculateSavings,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeOption[]>([]);
  const [recommendations, setRecommendations] = useState<UpgradeRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpgradeOptions();
  }, [currentCard]);

  const fetchUpgradeOptions = async () => {
    try {
      setIsLoading(true);

      // Mock upgrade options based on current card tier
      const mockOptions: UpgradeOption[] = [];

      if (currentCard.currentTier === 'BASIC') {
        mockOptions.push(
          {
            id: 'tier_silver',
            name: 'Upgrade to Silver Tier',
            description: 'Unlock premium features with higher limits and better rewards',
            currentValue: 'Basic',
            upgradedValue: 'Silver',
            upgradeCost: 499,
            monthlyBenefit: 250,
            category: 'TIER_UPGRADE',
            estimatedPaybackMonths: 2,
            popularity: 5,
            recommended: true,
          },
          {
            id: 'atm_limit_increase',
            name: 'Increase ATM Withdrawal Limit',
            description: 'Double your daily ATM withdrawal limit',
            currentValue: '₹1,00,000',
            upgradedValue: '₹2,00,000',
            upgradeCost: 199,
            monthlyBenefit: 50,
            category: 'LIMIT_INCREASE',
            estimatedPaybackMonths: 4,
            popularity: 4,
          },
          {
            id: 'international_pack',
            name: 'International Travel Pack',
            description: 'Enhanced international transaction features',
            currentValue: 'Standard',
            upgradedValue: 'Premium',
            upgradeCost: 299,
            monthlyBenefit: 150,
            category: 'FEATURE_ADDON',
            estimatedPaybackMonths: 2,
            popularity: 4,
          }
        );
      } else if (currentCard.currentTier === 'SILVER') {
        mockOptions.push(
          {
            id: 'tier_gold',
            name: 'Upgrade to Gold Tier',
            description: 'Elite benefits with concierge services and premium rewards',
            currentValue: 'Silver',
            upgradedValue: 'Gold',
            upgradeCost: 999,
            monthlyBenefit: 400,
            category: 'TIER_UPGRADE',
            estimatedPaybackMonths: 3,
            popularity: 5,
            recommended: currentCard.monthlySpend > 50000,
          },
          {
            id: 'reward_multiplier',
            name: 'Reward Multiplier Boost',
            description: '2x reward points on all transactions',
            currentValue: '1x',
            upgradedValue: '2x',
            upgradeCost: 399,
            monthlyBenefit: 300,
            category: 'REWARDS_BOOST',
            estimatedPaybackMonths: 2,
            popularity: 5,
          }
        );
      }

      // Add universal options
      mockOptions.push(
        {
          id: 'travel_insurance',
          name: 'Add Travel Insurance',
          description: 'Comprehensive travel insurance coverage',
          currentValue: 'None',
          upgradedValue: '₹50L Coverage',
          upgradeCost: 1499,
          monthlyBenefit: 125,
          category: 'FEATURE_ADDON',
          estimatedPaybackMonths: 12,
          popularity: 3,
        },
        {
          id: 'contactless_upgrade',
          name: 'Enhanced Contactless Features',
          description: 'Advanced NFC and digital wallet integrations',
          currentValue: 'Basic',
          upgradedValue: 'Advanced',
          upgradeCost: 99,
          monthlyBenefit: 25,
          category: 'FEATURE_ADDON',
          estimatedPaybackMonths: 4,
          popularity: 4,
        }
      );

      setUpgradeOptions(mockOptions);

      // Generate recommendations based on usage patterns
      const mockRecommendations: UpgradeRecommendation[] = [];

      if (currentCard.fxTransactions > 10) {
        mockRecommendations.push({
          optionId: 'international_pack',
          reasoning: 'High international transaction volume detected',
          potentialSavings: 500,
          confidence: 85,
          timeframe: 'IMMEDIATE',
        });
      }

      if (currentCard.monthlySpend > 75000) {
        mockRecommendations.push({
          optionId: 'tier_gold',
          reasoning: 'High spending pattern qualifies for premium tier',
          potentialSavings: 1000,
          confidence: 90,
          timeframe: 'SHORT_TERM',
        });
      }

      setRecommendations(mockRecommendations);

    } catch (error) {
      console.error('Failed to fetch upgrade options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: UpgradeOption['category']) => {
    switch (category) {
      case 'TIER_UPGRADE':
        return <TrendingUp className="w-5 h-5" />;
      case 'LIMIT_INCREASE':
        return <ArrowUp className="w-5 h-5" />;
      case 'FEATURE_ADDON':
        return <Zap className="w-5 h-5" />;
      case 'REWARDS_BOOST':
        return <Star className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: UpgradeOption['category']) => {
    switch (category) {
      case 'TIER_UPGRADE':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LIMIT_INCREASE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FEATURE_ADDON':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'REWARDS_BOOST':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredOptions = selectedCategory === 'all'
    ? upgradeOptions
    : upgradeOptions.filter(option => option.category === selectedCategory);

  const renderCurrentCardStatus = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Current Card Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{currentCard.currentTier}</div>
            <div className="text-sm text-muted-foreground">Current Tier</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">₹{currentCard.monthlySpend.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Spend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentCard.fxTransactions}</div>
            <div className="text-sm text-muted-foreground">FX Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{currentCard.rewardsEarned}</div>
            <div className="text-sm text-muted-foreground">Rewards Earned</div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between text-sm">
          <span>Tier Progress</span>
          <span>{currentCard.currentTier} → Next Tier</span>
        </div>
        <Progress value={65} className="mt-2" />
        <div className="text-xs text-muted-foreground mt-1">
          ₹35,000 more spend to reach Gold tier
        </div>
      </CardContent>
    </Card>
  );

  const renderRecommendations = () => (
    recommendations.length > 0 && (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Info className="w-5 h-5 mr-2" />
            AI Recommendations
          </CardTitle>
          <CardDescription className="text-blue-700">
            Personalized upgrade suggestions based on your usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const option = upgradeOptions.find(opt => opt.id === rec.optionId);
              if (!option) return null;

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getCategoryIcon(option.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">{option.name}</h4>
                      <p className="text-sm text-blue-600">{rec.reasoning}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {rec.timeframe.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {rec.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      Save ₹{rec.potentialSavings}/month
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onUpgradeSelect(option)}
                      className="mt-2"
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    )
  );

  const renderUpgradeOptions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Available Upgrades</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="TIER_UPGRADE">Tier</TabsTrigger>
              <TabsTrigger value="FEATURE_ADDON">Features</TabsTrigger>
              <TabsTrigger value="LIMIT_INCREASE">Limits</TabsTrigger>
              <TabsTrigger value="REWARDS_BOOST">Rewards</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading upgrade options...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOptions.map((option) => (
            <Card
              key={option.id}
              className={cn(
                "relative transition-all duration-300 hover:shadow-lg",
                option.recommended && "ring-2 ring-primary/20"
              )}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      getCategoryColor(option.category)
                    )}>
                      {getCategoryIcon(option.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {[...Array(option.popularity)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">₹{option.upgradeCost}</div>
                    <div className="text-sm text-muted-foreground">one-time</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{option.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <div className="font-semibold">{option.currentValue}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Upgraded:</span>
                    <div className="font-semibold text-primary">{option.upgradedValue}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Benefit:</span>
                    <span className="font-semibold text-green-600">₹{option.monthlyBenefit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Payback Period:</span>
                    <span className="font-semibold">{option.estimatedPaybackMonths} months</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onCalculateSavings(option)}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Savings
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => onUpgradeSelect(option)}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {renderCurrentCardStatus()}
      {renderRecommendations()}
      {renderUpgradeOptions()}
    </div>
  );
};

export default UpgradeOptionsDisplay;
