import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  CreditCard,
  TrendingUp,
  DollarSign,
  MapPin,
  Activity,
  ShoppingCart,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channels: ('PUSH' | 'EMAIL' | 'SMS')[];
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';
  category: 'SECURITY' | 'USAGE' | 'UPDATES' | 'PROMOTIONS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}

export interface UseCaseNotificationsProps {
  preferences: NotificationPreference[];
  notifications: NotificationItem[];
  onUpdatePreference: (preferenceId: string, updates: Partial<NotificationPreference>) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClearAllNotifications: () => void;
  className?: string;
}

const UseCaseNotifications: React.FC<UseCaseNotificationsProps> = ({
  preferences,
  notifications,
  onUpdatePreference,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  className
}) => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showRead, setShowRead] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'ERROR':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: NotificationPreference['category']) => {
    switch (category) {
      case 'SECURITY':
        return <Shield className="w-4 h-4" />;
      case 'USAGE':
        return <Activity className="w-4 h-4" />;
      case 'UPDATES':
        return <RefreshCw className="w-4 h-4" />;
      case 'PROMOTIONS':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: NotificationPreference['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterCategory !== 'all' && notification.category !== filterCategory) return false;
    if (!showRead && notification.read) return false;
    return true;
  });

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  const renderNotificationItem = (notification: NotificationItem) => (
    <Card key={notification.id} className={cn(
      "transition-all duration-200 hover:shadow-md",
      !notification.read && "border-l-4 border-l-primary bg-primary/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={cn(
                  "font-semibold",
                  !notification.read && "text-primary"
                )}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {notification.message}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {notification.category}
                </Badge>
                {notification.expiresAt && (
                  <span className="flex items-center text-orange-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notification.actionUrl && notification.actionLabel && (
              <Button size="sm" variant="outline">
                {notification.actionLabel}
              </Button>
            )}
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteNotification(notification.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Choose how and when you want to be notified about your card activity
          </p>
        </div>
        <Badge variant="secondary">
          {preferences.filter(p => p.enabled).length} of {preferences.length} enabled
        </Badge>
      </div>

      {Object.entries(groupedPreferences).map(([category, categoryPrefs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              {getCategoryIcon(category as NotificationPreference['category'])}
              <span className="ml-2 capitalize">{category.toLowerCase()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryPrefs.map((preference) => (
              <div key={preference.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{preference.name}</h4>
                    <Badge className={cn("text-xs", getPriorityColor(preference.priority))}>
                      {preference.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{preference.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex space-x-1">
                      {preference.channels.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {preference.frequency}
                    </Badge>
                  </div>
                </div>

                <Switch
                  checked={preference.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdatePreference(preference.id, { enabled })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Stay updated with your card activity and important alerts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClearAllNotifications}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Category:</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="Security">Security</option>
                  <option value="Usage">Usage</option>
                  <option value="Updates">Updates</option>
                  <option value="Promotions">Promotions</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-read"
                  checked={showRead}
                  onCheckedChange={setShowRead}
                />
                <label htmlFor="show-read" className="text-sm">
                  Show read notifications
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{unreadCount} unread</span>
              <span>{notifications.length} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold mb-2">No notifications</h4>
              <p className="text-sm text-muted-foreground">
                {filterCategory === 'all'
                  ? "You're all caught up! No new notifications."
                  : `No notifications in the ${filterCategory.toLowerCase()} category.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(renderNotificationItem)
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Notifications & Alerts</h2>
        <p className="text-muted-foreground text-lg">
          Manage your notification preferences and stay informed about your card activity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {renderNotifications()}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {renderPreferences()}
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Quick Actions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <BellOff className="w-4 h-4 mr-2" />
                Pause All (1 hour)
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default notification preferences
export const createDefaultNotificationPreferences = (): NotificationPreference[] => [
  {
    id: 'security_alerts',
    name: 'Security Alerts',
    description: 'Get notified about suspicious activity and security events',
    enabled: true,
    channels: ['PUSH', 'EMAIL', 'SMS'],
    frequency: 'IMMEDIATE',
    category: 'SECURITY',
    priority: 'CRITICAL'
  },
  {
    id: 'transaction_alerts',
    name: 'Transaction Alerts',
    description: 'Receive notifications for all card transactions',
    enabled: true,
    channels: ['PUSH', 'EMAIL'],
    frequency: 'IMMEDIATE',
    category: 'USAGE',
    priority: 'HIGH'
  },
  {
    id: 'large_transaction',
    name: 'Large Transaction Alerts',
    description: 'Get notified for transactions above ₹5,000',
    enabled: true,
    channels: ['PUSH', 'SMS'],
    frequency: 'IMMEDIATE',
    category: 'USAGE',
    priority: 'HIGH'
  },
  {
    id: 'international_usage',
    name: 'International Usage',
    description: 'Alerts for international transactions and foreign currency usage',
    enabled: true,
    channels: ['PUSH', 'EMAIL'],
    frequency: 'IMMEDIATE',
    category: 'USAGE',
    priority: 'MEDIUM'
  },
  {
    id: 'limit_approaching',
    name: 'Limit Approaching',
    description: 'Get notified when you\'re approaching your transaction limits',
    enabled: true,
    channels: ['PUSH'],
    frequency: 'IMMEDIATE',
    category: 'USAGE',
    priority: 'MEDIUM'
  },
  {
    id: 'card_status_changes',
    name: 'Card Status Changes',
    description: 'Notifications when your card status changes (blocked, unblocked, etc.)',
    enabled: true,
    channels: ['PUSH', 'EMAIL'],
    frequency: 'IMMEDIATE',
    category: 'UPDATES',
    priority: 'HIGH'
  },
  {
    id: 'weekly_summary',
    name: 'Weekly Summary',
    description: 'Weekly summary of your card usage and activity',
    enabled: true,
    channels: ['EMAIL'],
    frequency: 'WEEKLY',
    category: 'USAGE',
    priority: 'LOW'
  },
  {
    id: 'promotional_offers',
    name: 'Promotional Offers',
    description: 'Special offers and promotions for card holders',
    enabled: false,
    channels: ['EMAIL'],
    frequency: 'WEEKLY',
    category: 'PROMOTIONS',
    priority: 'LOW'
  }
];

// Sample notifications data
export const createSampleNotifications = (): NotificationItem[] => [
  {
    id: '1',
    title: 'Large Transaction Detected',
    message: 'A transaction of ₹12,500 was made at Amazon. If this wasn\'t you, please contact us immediately.',
    type: 'WARNING',
    category: 'Security',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/transactions',
    actionLabel: 'View Transaction'
  },
  {
    id: '2',
    title: 'International Transaction',
    message: 'Your card was used for an international transaction of $150 (₹12,500) in the USA.',
    type: 'INFO',
    category: 'Usage',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: '3',
    title: 'Daily Limit Approaching',
    message: 'You have used 85% of your daily transaction limit. ₹2,500 remaining.',
    type: 'WARNING',
    category: 'Usage',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: '4',
    title: 'Card Successfully Unblocked',
    message: 'Your card has been successfully unblocked and is now active for transactions.',
    type: 'SUCCESS',
    category: 'Updates',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: '5',
    title: 'New Security Feature Available',
    message: 'Enhanced biometric authentication is now available for your card. Enable it in settings.',
    type: 'INFO',
    category: 'Updates',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/settings/security',
    actionLabel: 'Enable Now'
  }
];

export default UseCaseNotifications;
