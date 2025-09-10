import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart,
  Building,
  Smartphone,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Save,
  RotateCcw,
  Info,
  Shield,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UseCase {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'ECOMMERCE' | 'ATM' | 'POS' | 'CONTACTLESS' | 'INTERNATIONAL';
  enabled: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
  currentDailyUsage: number;
  currentMonthlyUsage: number;
  transactionCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApproval: boolean;
  lastUsed?: string;
}

export interface UseCaseManagementProps {
  useCases: UseCase[];
  onUpdateLimits: (useCaseId: string, limits: Partial<Pick<UseCase, 'dailyLimit' | 'monthlyLimit' | 'perTransactionLimit'>>) => void;
  onToggleUseCase: (useCaseId: string, enabled: boolean) => void;
  onResetToDefaults: () => void;
  onSaveChanges: () => void;
  className?: string;
}

const UseCaseManagement: React.FC<UseCaseManagementProps> = ({
  useCases,
  onUpdateLimits,
  onToggleUseCase,
  onResetToDefaults,
  onSaveChanges,
  className
}) => {
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [tempLimits, setTempLimits] = useState<Record<string, Partial<Pick<UseCase, 'dailyLimit' | 'monthlyLimit' | 'perTransactionLimit'>>>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize temp limits with current values
    const initialTempLimits: Record<string, Partial<Pick<UseCase, 'dailyLimit' | 'monthlyLimit' | 'perTransactionLimit'>>> = {};
    useCases.forEach(useCase => {
      initialTempLimits[useCase.id] = {
        dailyLimit: useCase.dailyLimit,
        monthlyLimit: useCase.monthlyLimit,
        perTransactionLimit: useCase.perTransactionLimit,
      };
    });
    setTempLimits(initialTempLimits);
  }, [useCases]);

  const getCategoryColor = (category: UseCase['category']) => {
    switch (category) {
      case 'ECOMMERCE':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ATM':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'POS':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'CONTACTLESS':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'INTERNATIONAL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: UseCase['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-green-600 bg-green-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleLimitChange = (useCaseId: string, limitType: keyof Pick<UseCase, 'dailyLimit' | 'monthlyLimit' | 'perTransactionLimit'>, value: number) => {
    setTempLimits(prev => ({
      ...prev,
      [useCaseId]: {
        ...prev[useCaseId],
        [limitType]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Apply all temp limit changes
      Object.entries(tempLimits).forEach(([useCaseId, limits]) => {
        onUpdateLimits(useCaseId, limits);
      });
      await onSaveChanges();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    onResetToDefaults();
    setHasUnsavedChanges(false);
  };

  const renderUseCaseCard = (useCase: UseCase) => {
    const dailyUsagePercent = (useCase.currentDailyUsage / useCase.dailyLimit) * 100;
    const monthlyUsagePercent = (useCase.currentMonthlyUsage / useCase.monthlyLimit) * 100;

    return (
      <Card
        key={useCase.id}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          selectedUseCase === useCase.id && "ring-2 ring-primary",
          !useCase.enabled && "opacity-60"
        )}
        onClick={() => setSelectedUseCase(useCase.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                useCase.enabled ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
              )}>
                {useCase.icon}
              </div>
              <div>
                <h4 className="font-semibold">{useCase.name}</h4>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={cn("text-xs", getCategoryColor(useCase.category))}>
                {useCase.category}
              </Badge>
              <Badge className={cn("text-xs", getRiskColor(useCase.riskLevel))}>
                {useCase.riskLevel} Risk
              </Badge>
              <Switch
                checked={useCase.enabled}
                onCheckedChange={(checked) => {
                  onToggleUseCase(useCase.id, checked);
                  setHasUnsavedChanges(true);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Usage Indicators */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Usage</span>
              <span>₹{useCase.currentDailyUsage.toLocaleString()} / ₹{useCase.dailyLimit.toLocaleString()}</span>
            </div>
            <Progress
              value={Math.min(dailyUsagePercent, 100)}
              className={cn(
                "h-2",
                dailyUsagePercent > 80 && "bg-red-100"
              )}
            />

            <div className="flex justify-between text-sm">
              <span>Monthly Usage</span>
              <span>₹{useCase.currentMonthlyUsage.toLocaleString()} / ₹{useCase.monthlyLimit.toLocaleString()}</span>
            </div>
            <Progress
              value={Math.min(monthlyUsagePercent, 100)}
              className={cn(
                "h-2",
                monthlyUsagePercent > 80 && "bg-red-100"
              )}
            />
          </div>

          {/* Transaction Info */}
          <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
            <span>{useCase.transactionCount} transactions</span>
            {useCase.lastUsed && (
              <span>Last used: {new Date(useCase.lastUsed).toLocaleDateString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLimitEditor = () => {
    if (!selectedUseCase) return null;

    const useCase = useCases.find(uc => uc.id === selectedUseCase);
    if (!useCase) return null;

    const currentLimits = tempLimits[selectedUseCase] || {};

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configure {useCase.name} Limits
          </CardTitle>
          <CardDescription>
            Set transaction limits and security preferences for this use case
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-limit">Daily Limit (₹)</Label>
              <Input
                id="daily-limit"
                type="number"
                value={currentLimits.dailyLimit || useCase.dailyLimit}
                onChange={(e) => handleLimitChange(selectedUseCase, 'dailyLimit', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <Slider
              value={[currentLimits.dailyLimit || useCase.dailyLimit]}
              onValueChange={(value) => handleLimitChange(selectedUseCase, 'dailyLimit', value[0])}
              max={50000}
              min={1000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹1,000</span>
              <span>₹50,000</span>
            </div>
          </div>

          {/* Monthly Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly-limit">Monthly Limit (₹)</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={currentLimits.monthlyLimit || useCase.monthlyLimit}
                onChange={(e) => handleLimitChange(selectedUseCase, 'monthlyLimit', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <Slider
              value={[currentLimits.monthlyLimit || useCase.monthlyLimit]}
              onValueChange={(value) => handleLimitChange(selectedUseCase, 'monthlyLimit', value[0])}
              max={200000}
              min={5000}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹5,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          {/* Per Transaction Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="transaction-limit">Per Transaction Limit (₹)</Label>
              <Input
                id="transaction-limit"
                type="number"
                value={currentLimits.perTransactionLimit || useCase.perTransactionLimit}
                onChange={(e) => handleLimitChange(selectedUseCase, 'perTransactionLimit', parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>
            <Slider
              value={[currentLimits.perTransactionLimit || useCase.perTransactionLimit]}
              onValueChange={(value) => handleLimitChange(selectedUseCase, 'perTransactionLimit', value[0])}
              max={10000}
              min={100}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹100</span>
              <span>₹10,000</span>
            </div>
          </div>

          <Separator />

          {/* Security Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Security Settings</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Require Approval for High-Value Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Transactions above ₹5,000 will require additional approval
                </p>
              </div>
              <Switch
                checked={useCase.requiresApproval}
                onCheckedChange={(checked) => {
                  // This would be handled by a separate callback
                  console.log('Approval setting changed:', checked);
                }}
              />
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="space-y-4">
            <h4 className="font-semibold">Usage Analytics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{useCase.transactionCount}</div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{(useCase.currentMonthlyUsage / useCase.transactionCount || 0).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Transaction</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalytics = () => {
    const totalTransactions = useCases.reduce((sum, uc) => sum + uc.transactionCount, 0);
    const totalMonthlyUsage = useCases.reduce((sum, uc) => sum + uc.currentMonthlyUsage, 0);
    const enabledUseCases = useCases.filter(uc => uc.enabled).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{totalTransactions}</div>
            <div className="text-sm text-muted-foreground">Total Transactions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">₹{totalMonthlyUsage.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Usage</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-600">{enabledUseCases}</div>
            <div className="text-sm text-muted-foreground">Active Use Cases</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Use Case Management</h2>
        <p className="text-muted-foreground text-lg">
          Configure transaction limits and manage different payment scenarios
        </p>
      </div>

      {/* Analytics Overview */}
      {renderAnalytics()}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Unsaved Changes</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Use Cases List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">Payment Use Cases</h3>
          {useCases.map(renderUseCaseCard)}
        </div>

        {/* Limit Editor */}
        <div className="space-y-4">
          {selectedUseCase ? (
            renderLimitEditor()
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Select a Use Case</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a payment use case from the list to configure its limits and settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Changes to transaction limits may take up to 24 hours to take effect.
          High-value transactions may require additional verification for your security.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Default use cases data structure
export const createDefaultUseCases = (): UseCase[] => [
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online shopping and digital purchases',
    icon: <ShoppingCart className="w-4 h-4" />,
    category: 'ECOMMERCE',
    enabled: true,
    dailyLimit: 25000,
    monthlyLimit: 100000,
    perTransactionLimit: 5000,
    currentDailyUsage: 5200,
    currentMonthlyUsage: 45200,
    transactionCount: 28,
    riskLevel: 'MEDIUM',
    requiresApproval: false,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'atm',
    name: 'ATM Withdrawals',
    description: 'Cash withdrawals from ATMs',
    icon: <Building className="w-4 h-4" />,
    category: 'ATM',
    enabled: true,
    dailyLimit: 20000,
    monthlyLimit: 40000,
    perTransactionLimit: 5000,
    currentDailyUsage: 2000,
    currentMonthlyUsage: 8500,
    transactionCount: 5,
    riskLevel: 'MEDIUM',
    requiresApproval: false,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'In-store purchases at merchants',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'POS',
    enabled: true,
    dailyLimit: 30000,
    monthlyLimit: 150000,
    perTransactionLimit: 10000,
    currentDailyUsage: 12500,
    currentMonthlyUsage: 67800,
    transactionCount: 45,
    riskLevel: 'LOW',
    requiresApproval: false,
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 'contactless',
    name: 'Contactless Payments',
    description: 'Tap & pay at terminals',
    icon: <Smartphone className="w-4 h-4" />,
    category: 'CONTACTLESS',
    enabled: true,
    dailyLimit: 10000,
    monthlyLimit: 25000,
    perTransactionLimit: 2000,
    currentDailyUsage: 1800,
    currentMonthlyUsage: 5200,
    transactionCount: 15,
    riskLevel: 'LOW',
    requiresApproval: false,
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 'international',
    name: 'International',
    description: 'Foreign transactions and travel',
    icon: <DollarSign className="w-4 h-4" />,
    category: 'INTERNATIONAL',
    enabled: false,
    dailyLimit: 50000,
    monthlyLimit: 200000,
    perTransactionLimit: 15000,
    currentDailyUsage: 0,
    currentMonthlyUsage: 0,
    transactionCount: 0,
    riskLevel: 'HIGH',
    requiresApproval: true,
    lastUsed: undefined,
  },
];

export default UseCaseManagement;
