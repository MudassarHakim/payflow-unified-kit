import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Users,
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import { notificationApiService, NotificationRequest, NotificationLog } from '@/services/notificationApi';
import { cn } from '@/lib/utils';

export interface UpgradeCommunication {
  communicationId: string;
  customerId: string;
  upgradeId: string;
  communicationType: 'UPGRADE_CONFIRMATION' | 'UPGRADE_WELCOME' | 'FEATURE_ACTIVATION' | 'BENEFIT_REMINDER';
  channels: ('SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP')[];
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  scheduledDate?: string;
  sentDate?: string;
  templateId: string;
  variables: Record<string, string>;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

export interface UpgradeCommunicationCampaign {
  campaignId: string;
  upgradeId: string;
  campaignName: string;
  description: string;
  targetCustomers: string[];
  communications: UpgradeCommunication[];
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
  successRate?: number;
  totalSent?: number;
  totalDelivered?: number;
}

interface UpgradeCommunicationMessagingProps {
  upgradeId: string;
  customerId: string;
  upgradeDetails: {
    cardType: string;
    upgradeCost: number;
    newTier: string;
    effectiveDate: string;
    newFeatures: string[];
  };
  onCommunicationComplete?: (campaign: UpgradeCommunicationCampaign) => void;
  className?: string;
}

const UpgradeCommunicationMessaging: React.FC<UpgradeCommunicationMessagingProps> = ({
  upgradeId,
  customerId,
  upgradeDetails,
  onCommunicationComplete,
  className
}) => {
  const [communications, setCommunications] = useState<UpgradeCommunication[]>([]);
  const [campaign, setCampaign] = useState<UpgradeCommunicationCampaign | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);

  useEffect(() => {
    initializeCommunications();
  }, [upgradeId, customerId]);

  const initializeCommunications = () => {
    const upgradeCommunications: UpgradeCommunication[] = [
      {
        communicationId: `comm_${Date.now()}_1`,
        customerId,
        upgradeId,
        communicationType: 'UPGRADE_CONFIRMATION',
        channels: ['EMAIL', 'SMS'],
        status: 'PENDING',
        templateId: 'tmpl_upgrade_confirmation',
        variables: {
          customerName: 'Valued Customer',
          cardType: upgradeDetails.cardType,
          upgradeCost: upgradeDetails.upgradeCost.toString(),
          newTier: upgradeDetails.newTier,
          effectiveDate: upgradeDetails.effectiveDate,
        },
        priority: 'HIGH',
      },
      {
        communicationId: `comm_${Date.now()}_2`,
        customerId,
        upgradeId,
        communicationType: 'UPGRADE_WELCOME',
        channels: ['PUSH', 'WHATSAPP'],
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours later
        templateId: 'tmpl_upgrade_welcome',
        variables: {
          customerName: 'Valued Customer',
          cardType: upgradeDetails.cardType,
          newTier: upgradeDetails.newTier,
          newFeatures: upgradeDetails.newFeatures.join(', '),
        },
        priority: 'NORMAL',
      },
      {
        communicationId: `comm_${Date.now()}_3`,
        customerId,
        upgradeId,
        communicationType: 'FEATURE_ACTIVATION',
        channels: ['PUSH'],
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        templateId: 'tmpl_feature_activation',
        variables: {
          customerName: 'Valued Customer',
          cardType: upgradeDetails.cardType,
          newFeatures: upgradeDetails.newFeatures.join(', '),
        },
        priority: 'NORMAL',
      },
      {
        communicationId: `comm_${Date.now()}_4`,
        customerId,
        upgradeId,
        communicationType: 'BENEFIT_REMINDER',
        channels: ['SMS'],
        status: 'PENDING',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days later
        templateId: 'tmpl_benefit_reminder',
        variables: {
          customerName: 'Valued Customer',
          cardType: upgradeDetails.cardType,
          newTier: upgradeDetails.newTier,
        },
        priority: 'LOW',
      },
    ];

    setCommunications(upgradeCommunications);

    const newCampaign: UpgradeCommunicationCampaign = {
      campaignId: `camp_${Date.now()}`,
      upgradeId,
      campaignName: `FX Debit Card Upgrade - ${upgradeDetails.cardType}`,
      description: `Communication campaign for ${upgradeDetails.cardType} upgrade to ${upgradeDetails.newTier}`,
      targetCustomers: [customerId],
      communications: upgradeCommunications,
      status: 'DRAFT',
      createdDate: new Date().toISOString(),
    };

    setCampaign(newCampaign);
  };

  const sendCommunications = async () => {
    if (!campaign) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const logs: NotificationLog[] = [];
      const updatedCommunications = [...communications];

      for (let i = 0; i < communications.length; i++) {
        const comm = communications[i];

        // Skip scheduled communications that aren't due yet
        if (comm.scheduledDate && new Date(comm.scheduledDate) > new Date()) {
          continue;
        }

        const notificationRequest: NotificationRequest = {
          customerId: comm.customerId,
          templateId: comm.templateId,
          channels: comm.channels,
          variables: comm.variables,
          priority: comm.priority,
          metadata: {
            upgradeId: comm.upgradeId,
            communicationType: comm.communicationType,
            campaignId: campaign.campaignId,
          },
        };

        try {
          const log = await notificationApiService.sendNotification(notificationRequest);
          logs.push(log);

          updatedCommunications[i] = {
            ...comm,
            status: 'SENT',
            sentDate: new Date().toISOString(),
          };
        } catch (err) {
          console.error(`Failed to send communication ${comm.communicationId}:`, err);
          updatedCommunications[i] = {
            ...comm,
            status: 'FAILED',
          };
        }

        setProgress(((i + 1) / communications.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between sends
      }

      setCommunications(updatedCommunications);
      setNotificationLogs(logs);

      // Update campaign status
      const completedCampaign: UpgradeCommunicationCampaign = {
        ...campaign,
        communications: updatedCommunications,
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
        successRate: (updatedCommunications.filter(c => c.status === 'SENT').length / updatedCommunications.length) * 100,
        totalSent: updatedCommunications.filter(c => c.status === 'SENT').length,
        totalDelivered: logs.reduce((sum, log) => sum + log.deliveries.filter(d => d.status === 'DELIVERED').length, 0),
      };

      setCampaign(completedCampaign);

      if (onCommunicationComplete) {
        onCommunicationComplete(completedCampaign);
      }

    } catch (err) {
      console.error('Failed to send upgrade communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to send communications');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCommunicationIcon = (type: UpgradeCommunication['communicationType']) => {
    switch (type) {
      case 'UPGRADE_CONFIRMATION':
        return CheckCircle;
      case 'UPGRADE_WELCOME':
        return Users;
      case 'FEATURE_ACTIVATION':
        return TrendingUp;
      case 'BENEFIT_REMINDER':
        return Clock;
      default:
        return Mail;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'sms':
        return MessageSquare;
      case 'email':
        return Mail;
      case 'push':
        return Smartphone;
      case 'whatsapp':
        return MessageSquare;
      default:
        return Mail;
    }
  };

  const getStatusColor = (status: UpgradeCommunication['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600 bg-green-50';
      case 'SENT':
        return 'text-blue-600 bg-blue-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Upgrade Communication</h3>
        <p className="text-muted-foreground text-lg">
          Send upgrade notifications and welcome messages to the customer
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {campaign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Communication Campaign
            </CardTitle>
            <CardDescription>
              {campaign.campaignName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{communications.length}</div>
                <div className="text-sm text-muted-foreground">Total Communications</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {communications.filter(c => c.status === 'SENT').length}
                </div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {communications.filter(c => c.scheduledDate && new Date(c.scheduledDate) > new Date()).length}
                </div>
                <div className="text-sm text-muted-foreground">Scheduled</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold">Communication Schedule</h4>
              {communications.map((comm) => {
                const IconComponent = getCommunicationIcon(comm.communicationType);
                return (
                  <div key={comm.communicationId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          {comm.communicationType.replace('_', ' ')}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {comm.channels.map((channel) => {
                            const ChannelIcon = getChannelIcon(channel);
                            return (
                              <div key={channel} className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <ChannelIcon className="w-3 h-3" />
                                <span>{channel}</span>
                              </div>
                            );
                          })}
                        </div>
                        {comm.scheduledDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Scheduled: {new Date(comm.scheduledDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(comm.status)}>
                      {comm.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <Progress value={progress} className="w-full mb-4" />
            <p className="text-muted-foreground">
              Sending upgrade communications... {Math.round(progress)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {!isProcessing && campaign?.status === 'DRAFT' && (
        <div className="flex justify-center">
          <Button onClick={sendCommunications} size="lg">
            <Send className="w-4 h-4 mr-2" />
            Send Upgrade Communications
          </Button>
        </div>
      )}

      {campaign?.status === 'COMPLETED' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Upgrade communication campaign completed successfully!
            {campaign.successRate && (
              <span className="font-semibold ml-1">
                {campaign.successRate.toFixed(1)}% success rate
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {notificationLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Details</CardTitle>
            <CardDescription>
              Detailed delivery status for each communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notificationLogs.map((log) => (
                <div key={log.notificationId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{log.type.replace('_', ' ')}</span>
                    <Badge variant={log.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sent via: {log.channels.join(', ')} • {log.deliveries.length} delivery attempts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UpgradeCommunicationMessaging;
