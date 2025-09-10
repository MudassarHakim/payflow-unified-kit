import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UpgradeOption {
  id: string;
  name: string;
  upgradeCost: number;
  monthlyBenefit: number;
  category: string;
}

export interface UsagePattern {
  monthlySpend: number;
  fxTransactionCount: number;
  fxTransactionValue: number;
  atmWithdrawals: number;
  onlineTransactions: number;
  internationalSpend: number;
  rewardPointsEarned: number;
}

export interface CalculationResult {
  netCost: number;
  monthlySavings: number;
  paybackPeriod: number;
  annualROI: number;
  breakEvenMonth: number;
  totalSavings3Years: number;
  totalSavings5Years: number;
  roiPercentage: number;
  cashFlowPositive: boolean;
}

interface PriceAdjustmentCalculatorProps {
  upgradeOption: UpgradeOption;
  currentUsage: UsagePattern;
  onCalculationComplete: (result: CalculationResult) => void;
  onAdjustParameters: (newUsage: UsagePattern) => void;
  className?: string;
}

const PriceAdjustmentCalculator: React.FC<PriceAdjustmentCalculatorProps> = ({
  upgradeOption,
  currentUsage,
  onCalculationComplete,
  onAdjustParameters,
  className
}) => {
  const [usagePattern, setUsagePattern] = useState<UsagePattern>(currentUsage);
  const [timeframe, setTimeframe] = useState<'1year' | '3years' | '5years'>('3years');
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateUpgradeValue();
  }, [upgradeOption, usagePattern, timeframe]);

  const calculateUpgradeValue = async () => {
    setIsCalculating(true);

    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Enhanced calculation logic based on upgrade type and usage patterns
      let monthlyBenefit = upgradeOption.monthlyBenefit;
      let additionalBenefits = 0;

      // Adjust benefits based on usage patterns
      if (upgradeOption.category === 'TIER_UPGRADE') {
        // Higher benefits for high spenders
        if (usagePattern.monthlySpend > 100000) {
          additionalBenefits += usagePattern.monthlySpend * 0.02; // 2% additional benefit
        }

        // FX transaction benefits
        if (usagePattern.fxTransactionCount > 20) {
          additionalBenefits += usagePattern.fxTransactionValue * 0.015; // 1.5% on FX value
        }
      }

      if (upgradeOption.category === 'FEATURE_ADDON' && upgradeOption.name.includes('Travel')) {
        // Travel insurance benefits
        additionalBenefits += usagePattern.internationalSpend * 0.005; // 0.5% coverage benefit
      }

      if (upgradeOption.category === 'REWARDS_BOOST') {
        // Reward multiplier benefits
        additionalBenefits += usagePattern.rewardPointsEarned * 0.5; // 50% more rewards
      }

      const adjustedMonthlyBenefit = monthlyBenefit + additionalBenefits;
      const netCost = upgradeOption.upgradeCost;
      const monthlySavings = adjustedMonthlyBenefit;
      const paybackPeriod = netCost / monthlySavings;
      const annualSavings = monthlySavings * 12;
      const annualROI = (annualSavings / netCost) * 100;
      const breakEvenMonth = Math.ceil(paybackPeriod);

      const totalSavings3Years = (annualSavings * 3) - netCost;
      const totalSavings5Years = (annualSavings * 5) - netCost;
      const roiPercentage = annualROI;
      const cashFlowPositive = paybackPeriod <= 12; // Positive within 1 year

      const result: CalculationResult = {
        netCost,
        monthlySavings,
        paybackPeriod,
        annualROI,
        breakEvenMonth,
        totalSavings3Years,
        totalSavings5Years,
        roiPercentage,
        cashFlowPositive,
      };

      setCalculationResult(result);
      onCalculationComplete(result);
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUsageChange = (field: keyof UsagePattern, value: number) => {
    const newUsage = { ...usagePattern, [field]: value };
    setUsagePattern(newUsage);
    onAdjustParameters(newUsage);
  };

  const renderUsageAdjuster = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Adjust Usage Parameters
        </CardTitle>
        <CardDescription>
          Fine-tune your spending patterns to see how they affect upgrade value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthlySpend">Monthly Spend (₹)</Label>
            <div className="space-y-2">
              <Slider
                value={[usagePattern.monthlySpend]}
                onValueChange={(value) => handleUsageChange('monthlySpend', value[0])}
                max={200000}
                min={5000}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹5,000</span>
                <Input
                  type="number"
                  value={usagePattern.monthlySpend}
                  onChange={(e) => handleUsageChange('monthlySpend', parseInt(e.target.value) || 0)}
                  className="w-24 h-8 text-center"
                />
                <span>₹2,00,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fxTransactions">Monthly FX Transactions</Label>
            <div className="space-y-2">
              <Slider
                value={[usagePattern.fxTransactionCount]}
                onValueChange={(value) => handleUsageChange('fxTransactionCount', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0</span>
                <Input
                  type="number"
                  value={usagePattern.fxTransactionCount}
                  onChange={(e) => handleUsageChange('fxTransactionCount', parseInt(e.target.value) || 0)}
                  className="w-20 h-8 text-center"
                />
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fxValue">Monthly FX Transaction Value (₹)</Label>
            <div className="space-y-2">
              <Slider
                value={[usagePattern.fxTransactionValue]}
                onValueChange={(value) => handleUsageChange('fxTransactionValue', value[0])}
                max={100000}
                min={0}
                step={5000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹0</span>
                <Input
                  type="number"
                  value={usagePattern.fxTransactionValue}
                  onChange={(e) => handleUsageChange('fxTransactionValue', parseInt(e.target.value) || 0)}
                  className="w-24 h-8 text-center"
                />
                <span>₹1,00,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="internationalSpend">Monthly International Spend (₹)</Label>
            <div className="space-y-2">
              <Slider
                value={[usagePattern.internationalSpend]}
                onValueChange={(value) => handleUsageChange('internationalSpend', value[0])}
                max={50000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹0</span>
                <Input
                  type="number"
                  value={usagePattern.internationalSpend}
                  onChange={(e) => handleUsageChange('internationalSpend', parseInt(e.target.value) || 0)}
                  className="w-24 h-8 text-center"
                />
                <span>₹50,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={calculateUpgradeValue} disabled={isCalculating}>
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Recalculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Recalculate
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCalculationResults = () => (
    calculationResult && (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                ₹{calculationResult.monthlySavings}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Savings</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculationResult.paybackPeriod.toFixed(1)} months
              </div>
              <div className="text-sm text-muted-foreground">Payback Period</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {calculationResult.roiPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Annual ROI</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className={cn(
                "text-2xl font-bold",
                calculationResult.cashFlowPositive ? "text-green-600" : "text-red-600"
              )}>
                {calculationResult.cashFlowPositive ? "Positive" : "Negative"}
              </div>
              <div className="text-sm text-muted-foreground">Cash Flow</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1year">1 Year</TabsTrigger>
                <TabsTrigger value="3years">3 Years</TabsTrigger>
                <TabsTrigger value="5years">5 Years</TabsTrigger>
              </TabsList>

              <TabsContent value="1year" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Upgrade Cost:</span>
                      <span className="font-semibold">₹{calculationResult.netCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Savings:</span>
                      <span className="font-semibold text-green-600">
                        ₹{calculationResult.monthlySavings * 12}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net 1-Year Return:</span>
                      <span className={cn(
                        "font-semibold",
                        (calculationResult.monthlySavings * 12) > calculationResult.netCost
                          ? "text-green-600"
                          : "text-red-600"
                      )}>
                        ₹{(calculationResult.monthlySavings * 12) - calculationResult.netCost}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Break-even Point: Month {calculationResult.breakEvenMonth}
                    </div>
                    <Progress
                      value={Math.min((12 / calculationResult.paybackPeriod) * 100, 100)}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((12 / calculationResult.paybackPeriod) * 100).toFixed(1)}% of payback period covered in 1 year
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="3years" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Savings:</span>
                      <span className="font-semibold text-green-600">
                        ₹{calculationResult.totalSavings3Years.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual ROI:</span>
                      <span className="font-semibold text-blue-600">
                        {calculationResult.roiPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      3-Year Net Position
                    </div>
                    <div className={cn(
                      "text-2xl font-bold",
                      calculationResult.totalSavings3Years > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {calculationResult.totalSavings3Years > 0 ? "+" : ""}
                      ₹{Math.abs(calculationResult.totalSavings3Years).toLocaleString()}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="5years" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Savings:</span>
                      <span className="font-semibold text-green-600">
                        ₹{calculationResult.totalSavings5Years.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual ROI:</span>
                      <span className="font-semibold text-blue-600">
                        {calculationResult.roiPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      5-Year Net Position
                    </div>
                    <div className={cn(
                      "text-2xl font-bold",
                      calculationResult.totalSavings5Years > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {calculationResult.totalSavings5Years > 0 ? "+" : ""}
                      ₹{Math.abs(calculationResult.totalSavings5Years).toLocaleString()}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className={cn(
          "border-2",
          calculationResult.cashFlowPositive
            ? "border-green-200 bg-green-50"
            : "border-yellow-200 bg-yellow-50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              {calculationResult.cashFlowPositive ? (
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5" />
              )}
              <div>
                <h4 className={cn(
                  "font-semibold mb-2",
                  calculationResult.cashFlowPositive ? "text-green-800" : "text-yellow-800"
                )}>
                  {calculationResult.cashFlowPositive ? "Excellent Investment" : "Consider Carefully"}
                </h4>
                <p className={cn(
                  "text-sm",
                  calculationResult.cashFlowPositive ? "text-green-700" : "text-yellow-700"
                )}>
                  {calculationResult.cashFlowPositive
                    ? `This upgrade will pay for itself in ${calculationResult.paybackPeriod.toFixed(1)} months and generate ₹${calculationResult.totalSavings3Years.toLocaleString()} in savings over 3 years.`
                    : `This upgrade will take ${calculationResult.paybackPeriod.toFixed(1)} months to break even. Consider your usage patterns and whether the benefits align with your needs.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share Calculation
          </Button>
          <Button>
            Proceed with Upgrade
          </Button>
        </div>
      </div>
    )
  );

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Upgrade Value Calculator</h2>
        <p className="text-muted-foreground">
          Calculate the financial impact of upgrading to {upgradeOption.name}
        </p>
        <Badge variant="secondary" className="text-sm">
          {upgradeOption.category.replace('_', ' ')}
        </Badge>
      </div>

      {renderUsageAdjuster()}
      {renderCalculationResults()}

      {!calculationResult && !isCalculating && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
            <p className="text-muted-foreground">
              Adjust your usage parameters above and click "Recalculate" to see the upgrade value analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PriceAdjustmentCalculator;
