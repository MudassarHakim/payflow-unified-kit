import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Smartphone,
  Globe,
  CreditCard,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Activity,
  MapPin,
  Lock,
  Unlock,
  Settings,
  RefreshCw,
  Info,
  Zap,
  ShoppingCart,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardControl {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  category: 'PAYMENT_TYPE' | 'LOCATION' | 'SECURITY' | 'FEATURE';
  requiresConfirmation: boolean;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  lastModified?: string;
  usage?: {
    today: number;
    thisMonth: number;
    limit?: number;
  };
}

export interface CardControlTogglesProps {
  controls: CardControl[];
  onToggleControl: (controlId: string, enabled: boolean) => void;
  onBulkToggle: (controlIds: string[], enabled: boolean) => void;
  onResetToDefaults: () => void;
  className?: string;
}

const CardControlToggles: React.FC<CardControlTogglesProps> = ({
  controls,
  onToggleControl,
  onBulkToggle,
  onResetToDefaults,
  className
}) => {
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  const getCategoryIcon = (category: CardControl['category']) => {
    switch (category) {
      case 'PAYMENT_TYPE':
        return <CreditCard className="w-5 h-5" />;
      case 'LOCATION':
        return <MapPin className="w-5 h-5" />;
      case 'SECURITY':
        return <Shield className="w-5 h-5" />;
      case 'FEATURE':
        return <Settings className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: CardControl['impact']) => {
    switch (impact) {
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

  const handleToggle = (control: CardControl) => {
    if (control.requiresConfirmation) {
      setShowConfirmation(control.id);
    } else {
      setPendingChanges(prev => new Set([...prev, control.id]));
      onToggleControl(control.id, !control.enabled);
    }
  };

  const confirmToggle = (controlId: string, enabled: boolean) => {
    setPendingChanges(prev => new Set([...prev, controlId]));
    onToggleControl(controlId, enabled);
    setShowConfirmation(null);
  };

  const applyBulkAction = (enabled: boolean, category?: CardControl['category']) => {
    const targetControls = category
      ? controls.filter(c => c.category === category)
      : controls;

    const controlIds = targetControls.map(c => c.id);
    setPendingChanges(prev => new Set([...prev, ...controlIds]));
    onBulkToggle(controlIds, enabled);
  };

  const resetAll = () => {
    setPendingChanges(new Set());
    onResetToDefaults();
  };

  const groupedControls = controls.reduce((acc, control) => {
    if (!acc[control.category]) {
      acc[control.category] = [];
    }
    acc[control.category].push(control);
    return acc;
  }, {} as Record<string, CardControl[]>);

  const renderControlCard = (control: CardControl) => (
    <Card key={control.id} className={cn(
      "transition-all duration-200",
      pendingChanges.has(control.id) && "ring-2 ring-blue-200 bg-blue-50/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              control.enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            )}>
              {control.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{control.name}</h4>
                <Badge className={cn("text-xs", getImpactColor(control.impact))}>
                  {control.impact} Impact
                </Badge>
                {pendingChanges.has(control.id) && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Updating
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{control.description}</p>

              {control.usage && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Today's Usage</span>
                    <span>{control.usage.today} transactions</span>
                  </div>
                  {control.usage.limit && (
                    <Progress
                      value={(control.usage.today / control.usage.limit) * 100}
                      className="h-1"
                    />
                  )}
                </div>
              )}

              {control.lastModified && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last modified: {new Date(control.lastModified).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <Switch
            checked={control.enabled}
            onCheckedChange={() => handleToggle(control)}
            disabled={pendingChanges.has(control.id)}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderCategorySection = (category: string, categoryControls: CardControl[]) => {
    const categoryName = category.replace('_', ' ');
    const enabledCount = categoryControls.filter(c => c.enabled).length;
    const totalCount = categoryControls.length;

    return (
      <div key={category} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(category as CardControl['category'])}
            <h3 className="text-lg font-semibold capitalize">{categoryName}</h3>
            <Badge variant="secondary">
              {enabledCount}/{totalCount} Enabled
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyBulkAction(true, category as CardControl['category'])}
            >
              Enable All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyBulkAction(false, category as CardControl['category'])}
            >
              Disable All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryControls.map(renderControlCard)}
        </div>
      </div>
    );
  };

  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;

    const control = controls.find(c => c.id === showConfirmation);
    if (!control) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              Confirm Change
            </CardTitle>
            <CardDescription>
              Are you sure you want to {control.enabled ? 'disable' : 'enable'} {control.name}?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{control.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getImpactColor(control.impact)}>
                  {control.impact} Impact
                </Badge>
                <Badge variant="outline">
                  {control.category.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This change may take a few minutes to take effect across all systems.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => confirmToggle(control.id, !control.enabled)}
              >
                Confirm {control.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Card Control Toggles</h2>
        <p className="text-muted-foreground text-lg">
          Manage your card features and security settings
        </p>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {controls.filter(c => c.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Enabled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {controls.filter(c => !c.enabled).length}
                </div>
                <div className="text-sm text-muted-foreground">Disabled</div>
              </div>
              {pendingChanges.size > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pendingChanges.size}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => applyBulkAction(true)}>
                Enable All
              </Button>
              <Button variant="outline" onClick={() => applyBulkAction(false)}>
                Disable All
              </Button>
              <Button variant="outline" onClick={resetAll}>
                Reset to Defaults
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Categories */}
      <div className="space-y-8">
        {Object.entries(groupedControls).map(([category, categoryControls]) =>
          renderCategorySection(category, categoryControls)
        )}
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> Disabling certain features may limit your card's functionality.
          High-impact changes require confirmation and may take time to propagate across all systems.
        </AlertDescription>
      </Alert>

      {/* Pending Changes Indicator */}
      {pendingChanges.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-800">
                  {pendingChanges.size} change{pendingChanges.size > 1 ? 's' : ''} pending
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setPendingChanges(new Set())}
                variant="outline"
              >
                Clear Pending
              </Button>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Changes are being applied to your card. This may take a few minutes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      {renderConfirmationDialog()}
    </div>
  );
};

// Default controls data structure
export const createDefaultControls = (): CardControl[] => [
  {
    id: 'contactless',
    name: 'Contactless Payments',
    description: 'Enable tap & pay functionality at terminals',
    icon: <Wifi className="w-4 h-4" />,
    enabled: true,
    category: 'PAYMENT_TYPE',
    requiresConfirmation: false,
    impact: 'LOW',
    usage: { today: 3, thisMonth: 45, limit: 50 }
  },
  {
    id: 'online_payments',
    name: 'Online Payments',
    description: 'Allow transactions on e-commerce websites',
    icon: <ShoppingCart className="w-4 h-4" />,
    enabled: true,
    category: 'PAYMENT_TYPE',
    requiresConfirmation: false,
    impact: 'LOW',
    usage: { today: 2, thisMonth: 28 }
  },
  {
    id: 'atm_withdrawals',
    name: 'ATM Withdrawals',
    description: 'Enable cash withdrawals from ATMs',
    icon: <DollarSign className="w-4 h-4" />,
    enabled: true,
    category: 'PAYMENT_TYPE',
    requiresConfirmation: false,
    impact: 'MEDIUM',
    usage: { today: 1, thisMonth: 12, limit: 20 }
  },
  {
    id: 'international',
    name: 'International Transactions',
    description: 'Allow transactions outside your home country',
    icon: <Globe className="w-4 h-4" />,
    enabled: false,
    category: 'LOCATION',
    requiresConfirmation: true,
    impact: 'HIGH',
    usage: { today: 0, thisMonth: 0 }
  },
  {
    id: 'domestic_only',
    name: 'Domestic Only',
    description: 'Restrict to transactions within home country',
    icon: <MapPin className="w-4 h-4" />,
    enabled: true,
    category: 'LOCATION',
    requiresConfirmation: false,
    impact: 'MEDIUM'
  },
  {
    id: 'pos_payments',
    name: 'POS Payments',
    description: 'Enable point-of-sale terminal payments',
    icon: <Building className="w-4 h-4" />,
    enabled: true,
    category: 'PAYMENT_TYPE',
    requiresConfirmation: false,
    impact: 'LOW',
    usage: { today: 5, thisMonth: 67 }
  },
  {
    id: 'mobile_payments',
    name: 'Mobile Payments',
    description: 'Enable payments through mobile apps and wallets',
    icon: <Smartphone className="w-4 h-4" />,
    enabled: true,
    category: 'PAYMENT_TYPE',
    requiresConfirmation: false,
    impact: 'LOW',
    usage: { today: 1, thisMonth: 15 }
  },
  {
    id: 'transaction_alerts',
    name: 'Transaction Alerts',
    description: 'Receive notifications for all transactions',
    icon: <Activity className="w-4 h-4" />,
    enabled: true,
    category: 'FEATURE',
    requiresConfirmation: false,
    impact: 'LOW'
  },
  {
    id: 'security_lock',
    name: 'Security Lock',
    description: 'Additional security measures for high-value transactions',
    icon: <Shield className="w-4 h-4" />,
    enabled: true,
    category: 'SECURITY',
    requiresConfirmation: false,
    impact: 'MEDIUM'
  }
];

export default CardControlToggles;
