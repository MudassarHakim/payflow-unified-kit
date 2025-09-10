import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Lock,
  Unlock,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Wifi,
  WifiOff,
  Bell,
  BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CardStatus {
  cardId: string;
  cardNumber: string;
  cardType: string;
  currentTier: string;
  expiryDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED' | 'SUSPENDED';
  issuedDate: string;
  lastUsed: string;
  dailyLimit: number;
  monthlyLimit: number;
  availableBalance: number;
  outstandingBalance: number;
  contactlessEnabled: boolean;
  onlineEnabled: boolean;
  atmEnabled: boolean;
  internationalEnabled: boolean;
  notificationsEnabled: boolean;
  location: {
    lastTransaction: string;
    currentLocation?: string;
  };
}

export interface DigitalCardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  network: string;
  issuer: string;
}

interface CardStatusDisplayProps {
  cardStatus: CardStatus;
  digitalCardDetails: DigitalCardDetails;
  onToggleContactless: () => void;
  onToggleOnline: () => void;
  onToggleATM: () => void;
  onToggleInternational: () => void;
  onToggleNotifications: () => void;
  onBlockCard: () => void;
  onUnblockCard: () => void;
  onReportLost: () => void;
  onAddToWallet: () => void;
  onDownloadCard: () => void;
  className?: string;
}

const CardStatusDisplay: React.FC<CardStatusDisplayProps> = ({
  cardStatus,
  digitalCardDetails,
  onToggleContactless,
  onToggleOnline,
  onToggleATM,
  onToggleInternational,
  onToggleNotifications,
  onBlockCard,
  onUnblockCard,
  onReportLost,
  onAddToWallet,
  onDownloadCard,
  className
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusColor = (status: CardStatus['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'INACTIVE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'BLOCKED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'EXPIRED':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'SUSPENDED':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: CardStatus['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'INACTIVE':
        return <Clock className="w-4 h-4" />;
      case 'BLOCKED':
        return <Lock className="w-4 h-4" />;
      case 'EXPIRED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'SUSPENDED':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const renderCardOverview = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{cardStatus.cardType}</CardTitle>
              <CardDescription>{cardStatus.currentTier} Tier</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={cn("flex items-center space-x-1", getStatusColor(cardStatus.status))}>
              {getStatusIcon(cardStatus.status)}
              <span>{cardStatus.status}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Number Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Card Number</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCardNumber(!showCardNumber)}
              >
                {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(
                  showCardNumber ? digitalCardDetails.cardNumber : cardStatus.cardNumber,
                  'Card Number'
                )}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="font-mono text-lg bg-muted p-3 rounded-lg">
            {showCardNumber
              ? digitalCardDetails.cardNumber.match(/.{1,4}/g)?.join(' ') || digitalCardDetails.cardNumber
              : cardStatus.cardNumber
            }
          </div>
        </div>

        {/* Card Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Expires</p>
            <p className="font-semibold">{cardStatus.expiryDate}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="font-semibold text-green-600">₹{cardStatus.availableBalance.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Daily Limit</p>
            <p className="font-semibold">₹{cardStatus.dailyLimit.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Last Used</p>
            <p className="font-semibold text-sm">{new Date(cardStatus.lastUsed).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="space-y-3">
          <h4 className="font-semibold">Usage Limits</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Limit Usage</span>
              <span>₹{(cardStatus.dailyLimit * 0.3).toLocaleString()} / ₹{cardStatus.dailyLimit.toLocaleString()}</span>
            </div>
            <Progress value={30} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Limit Usage</span>
              <span>₹{(cardStatus.monthlyLimit * 0.6).toLocaleString()} / ₹{cardStatus.monthlyLimit.toLocaleString()}</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDigitalCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="w-5 h-5 mr-2" />
          Digital Card Details
        </CardTitle>
        <CardDescription>
          Secure digital representation of your physical card
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Digital Card Visual */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm opacity-90">{digitalCardDetails.network}</p>
                <p className="text-lg font-semibold">{digitalCardDetails.cardholderName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">{digitalCardDetails.issuer}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-mono text-xl tracking-wider">
                {showCardNumber
                  ? digitalCardDetails.cardNumber.match(/.{1,4}/g)?.join(' ') || digitalCardDetails.cardNumber
                  : '•••• •••• •••• ' + digitalCardDetails.cardNumber.slice(-4)
                }
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs opacity-75">VALID THRU</p>
                <p className="font-semibold">{digitalCardDetails.expiryMonth}/{digitalCardDetails.expiryYear}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">CVV</p>
                <p className="font-semibold">
                  {showCVV ? digitalCardDetails.cvv : '•••'}
                </p>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCVV(!showCVV)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Digital Card Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={onAddToWallet} className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Add to Wallet
          </Button>
          <Button variant="outline" onClick={onDownloadCard} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Digital card details are encrypted and stored securely. Never share these details with anyone.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderCardControls = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Card Controls & Security
        </CardTitle>
        <CardDescription>
          Manage your card settings and security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction Types */}
        <div className="space-y-4">
          <h4 className="font-semibold">Transaction Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Wifi className={cn(
                  "w-5 h-5",
                  cardStatus.contactlessEnabled ? "text-green-600" : "text-gray-400"
                )} />
                <div>
                  <p className="font-medium">Contactless Payments</p>
                  <p className="text-sm text-muted-foreground">Tap & Pay</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleContactless}
                disabled={cardStatus.status !== 'ACTIVE'}
              >
                {cardStatus.contactlessEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className={cn(
                  "w-5 h-5",
                  cardStatus.onlineEnabled ? "text-green-600" : "text-gray-400"
                )} />
                <div>
                  <p className="font-medium">Online Transactions</p>
                  <p className="text-sm text-muted-foreground">E-commerce</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleOnline}
                disabled={cardStatus.status !== 'ACTIVE'}
              >
                {cardStatus.onlineEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className={cn(
                  "w-5 h-5",
                  cardStatus.atmEnabled ? "text-green-600" : "text-gray-400"
                )} />
                <div>
                  <p className="font-medium">ATM Withdrawals</p>
                  <p className="text-sm text-muted-foreground">Cash withdrawals</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleATM}
                disabled={cardStatus.status !== 'ACTIVE'}
              >
                {cardStatus.atmEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className={cn(
                  "w-5 h-5",
                  cardStatus.internationalEnabled ? "text-green-600" : "text-gray-400"
                )} />
                <div>
                  <p className="font-medium">International</p>
                  <p className="text-sm text-muted-foreground">Foreign transactions</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleInternational}
                disabled={cardStatus.status !== 'ACTIVE'}
              >
                {cardStatus.internationalEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {cardStatus.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">Transaction Notifications</p>
              <p className="text-sm text-muted-foreground">Get alerts for card activity</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleNotifications}
          >
            {cardStatus.notificationsEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        <Separator />

        {/* Emergency Actions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-red-600">Emergency Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={cardStatus.status === 'BLOCKED' ? onUnblockCard : onBlockCard}
            >
              {cardStatus.status === 'BLOCKED' ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unblock Card
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Block Card
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={onReportLost}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Lost
            </Button>

            <Button
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Change PIN
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLocationStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Location & Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Last Transaction</span>
            </div>
            <span className="text-sm font-medium">{cardStatus.location.lastTransaction}</span>
          </div>

          {cardStatus.location.currentLocation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm">Current Location</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {cardStatus.location.currentLocation}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Card Status</span>
            </div>
            <Badge className={getStatusColor(cardStatus.status)}>
              {cardStatus.status}
            </Badge>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="font-semibold">Recent Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Online Purchase</span>
              </div>
              <span className="text-sm text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">ATM Withdrawal</span>
              </div>
              <span className="text-sm text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Card Status & Digital Card</h2>
        <p className="text-muted-foreground text-lg">
          Manage your card settings and view digital card details
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="digital">Digital Card</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderCardOverview()}
          {renderLocationStatus()}
        </TabsContent>

        <TabsContent value="digital" className="space-y-6">
          {renderDigitalCard()}
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          {renderCardControls()}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {renderLocationStatus()}
        </TabsContent>
      </Tabs>

      {/* Copy Success Message */}
      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
          {copiedText} copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default CardStatusDisplay;
