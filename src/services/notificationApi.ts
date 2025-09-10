// Notification Service API Mock Service - Simulates notification delivery system
import { delay } from '@/utils/delay';

export interface NotificationTemplate {
  templateId: string;
  name: string;
  type: 'CARD_ACTIVATION' | 'TRANSACTION_ALERT' | 'PAYMENT_REMINDER' | 'SECURITY_ALERT' | 'PROMOTIONAL' | 'WELCOME' | 'FX_RATE_UPDATE';
  channels: ('SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP')[];
  subject?: string;
  content: {
    sms?: string;
    email?: {
      subject: string;
      htmlBody: string;
      textBody: string;
    };
    push?: {
      title: string;
      body: string;
      data?: Record<string, any>;
    };
    whatsapp?: string;
  };
  variables: string[]; // Template variables like {{customerName}}, {{amount}}, etc.
  isActive: boolean;
  createdDate: string;
  lastModified: string;
}

export interface NotificationRequest {
  customerId: string;
  templateId: string;
  channels: ('SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP')[];
  variables?: Record<string, string>;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledDate?: string;
  metadata?: Record<string, any>;
}

export interface NotificationDelivery {
  deliveryId: string;
  notificationId: string;
  customerId: string;
  channel: 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  providerReference?: string;
  sentDate?: string;
  deliveredDate?: string;
  failedDate?: string;
  failureReason?: string;
  cost?: number;
}

export interface NotificationLog {
  notificationId: string;
  customerId: string;
  templateId: string;
  type: NotificationTemplate['type'];
  channels: NotificationRequest['channels'];
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE' | 'FAILED';
  priority: NotificationRequest['priority'];
  createdDate: string;
  completedDate?: string;
  deliveries: NotificationDelivery[];
  variables?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface CustomerNotificationPreferences {
  customerId: string;
  preferences: {
    sms: {
      enabled: boolean;
      marketing: boolean;
      transactional: boolean;
    };
    email: {
      enabled: boolean;
      marketing: boolean;
      transactional: boolean;
      newsletters: boolean;
    };
    push: {
      enabled: boolean;
      marketing: boolean;
      transactional: boolean;
      security: boolean;
    };
    whatsapp: {
      enabled: boolean;
      marketing: boolean;
      transactional: boolean;
    };
  };
  lastUpdated: string;
}

export interface BulkNotificationRequest {
  customerIds: string[];
  templateId: string;
  channels: ('SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP')[];
  variables?: Record<string, string>;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  scheduledDate?: string;
  campaignId?: string;
  metadata?: Record<string, any>;
}

class NotificationApiService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private notifications: Map<string, NotificationLog> = new Map();
  private customerPreferences: Map<string, CustomerNotificationPreferences> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Send notification
  async sendNotification(request: NotificationRequest): Promise<NotificationLog> {
    await delay(800);

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.templates.get(request.templateId);

    if (!template) {
      throw new Error('Notification template not found');
    }

    if (!template.isActive) {
      throw new Error('Notification template is not active');
    }

    // Check customer preferences
    const preferences = this.customerPreferences.get(request.customerId);
    const allowedChannels = this.filterAllowedChannels(request.channels, preferences);

    if (allowedChannels.length === 0) {
      throw new Error('No allowed notification channels for this customer');
    }

    const deliveries: NotificationDelivery[] = allowedChannels.map(channel => ({
      deliveryId: `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notificationId,
      customerId: request.customerId,
      channel,
      status: 'PENDING',
      cost: this.calculateDeliveryCost(channel),
    }));

    const notification: NotificationLog = {
      notificationId,
      customerId: request.customerId,
      templateId: request.templateId,
      type: template.type,
      channels: allowedChannels,
      status: 'CREATED',
      priority: request.priority,
      createdDate: new Date().toISOString(),
      deliveries,
      variables: request.variables,
      metadata: request.metadata,
    };

    this.notifications.set(notificationId, notification);

    // Simulate async processing
    setTimeout(() => {
      this.processNotification(notificationId);
    }, 1000);

    console.log('Notification API: Notification queued', notification);
    return notification;
  }

  // Send bulk notifications
  async sendBulkNotification(request: BulkNotificationRequest): Promise<{ campaignId: string; notifications: NotificationLog[] }> {
    await delay(1200);

    const campaignId = request.campaignId || `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notifications: NotificationLog[] = [];

    for (const customerId of request.customerIds) {
      try {
        const notificationRequest: NotificationRequest = {
          customerId,
          templateId: request.templateId,
          channels: request.channels,
          variables: request.variables,
          priority: request.priority,
          scheduledDate: request.scheduledDate,
          metadata: { ...request.metadata, campaignId },
        };

        const notification = await this.sendNotification(notificationRequest);
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to send notification to customer ${customerId}:`, error);
      }
    }

    console.log('Notification API: Bulk notification campaign created', { campaignId, count: notifications.length });
    return { campaignId, notifications };
  }

  // Get notification status
  async getNotificationStatus(notificationId: string): Promise<NotificationLog | null> {
    await delay(300);
    return this.notifications.get(notificationId) || null;
  }

  // Get customer notifications
  async getCustomerNotifications(customerId: string, filters?: {
    type?: NotificationTemplate['type'];
    status?: NotificationLog['status'];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<NotificationLog[]> {
    await delay(500);

    let notifications = Array.from(this.notifications.values()).filter(
      notif => notif.customerId === customerId
    );

    if (filters) {
      notifications = notifications.filter(notif => {
        if (filters.type && notif.type !== filters.type) return false;
        if (filters.status && notif.status !== filters.status) return false;
        if (filters.dateFrom && new Date(notif.createdDate) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(notif.createdDate) > new Date(filters.dateTo)) return false;
        return true;
      });
    }

    return notifications
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
      .slice(0, filters?.limit || 50);
  }

  // Update customer notification preferences
  async updateCustomerPreferences(customerId: string, preferences: CustomerNotificationPreferences['preferences']): Promise<CustomerNotificationPreferences> {
    await delay(600);

    const existingPreferences = this.customerPreferences.get(customerId);

    const updatedPreferences: CustomerNotificationPreferences = {
      customerId,
      preferences,
      lastUpdated: new Date().toISOString(),
    };

    this.customerPreferences.set(customerId, updatedPreferences);

    console.log('Notification API: Customer preferences updated', { customerId, preferences });
    return updatedPreferences;
  }

  // Get customer notification preferences
  async getCustomerPreferences(customerId: string): Promise<CustomerNotificationPreferences | null> {
    await delay(300);

    const preferences = this.customerPreferences.get(customerId);
    if (!preferences) {
      // Return default preferences if not found
      return {
        customerId,
        preferences: {
          sms: { enabled: true, marketing: true, transactional: true },
          email: { enabled: true, marketing: true, transactional: true, newsletters: false },
          push: { enabled: true, marketing: false, transactional: true, security: true },
          whatsapp: { enabled: false, marketing: false, transactional: false },
        },
        lastUpdated: new Date().toISOString(),
      };
    }

    return preferences;
  }

  // Get notification templates
  async getNotificationTemplates(filters?: {
    type?: NotificationTemplate['type'];
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> {
    await delay(400);

    let templates = Array.from(this.templates.values());

    if (filters) {
      templates = templates.filter(template => {
        if (filters.type && template.type !== filters.type) return false;
        if (filters.isActive !== undefined && template.isActive !== filters.isActive) return false;
        return true;
      });
    }

    return templates;
  }

  // Create notification template
  async createNotificationTemplate(template: Omit<NotificationTemplate, 'templateId' | 'createdDate' | 'lastModified'>): Promise<NotificationTemplate> {
    await delay(800);

    const templateId = `tmpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newTemplate: NotificationTemplate = {
      templateId,
      ...template,
      createdDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    this.templates.set(templateId, newTemplate);

    console.log('Notification API: Template created', newTemplate);
    return newTemplate;
  }

  // Update notification template
  async updateNotificationTemplate(templateId: string, updates: Partial<Omit<NotificationTemplate, 'templateId' | 'createdDate'>>): Promise<NotificationTemplate> {
    await delay(600);

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const updatedTemplate: NotificationTemplate = {
      ...template,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    this.templates.set(templateId, updatedTemplate);

    console.log('Notification API: Template updated', { templateId, updates });
    return updatedTemplate;
  }

  // Get delivery statistics
  async getDeliveryStatistics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    channel?: NotificationDelivery['channel'];
    templateType?: NotificationTemplate['type'];
  }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageCost: number;
    channelBreakdown: Record<string, { sent: number; delivered: number; failed: number; cost: number }>;
  }> {
    await delay(800);

    let notifications = Array.from(this.notifications.values());

    if (filters) {
      notifications = notifications.filter(notif => {
        if (filters.dateFrom && new Date(notif.createdDate) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(notif.createdDate) > new Date(filters.dateTo)) return false;
        if (filters.templateType && notif.type !== filters.templateType) return false;
        return true;
      });
    }

    const channelBreakdown: Record<string, { sent: number; delivered: number; failed: number; cost: number }> = {};
    let totalSent = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let totalCost = 0;

    for (const notification of notifications) {
      for (const delivery of notification.deliveries) {
        if (filters?.channel && delivery.channel !== filters.channel) continue;

        if (!channelBreakdown[delivery.channel]) {
          channelBreakdown[delivery.channel] = { sent: 0, delivered: 0, failed: 0, cost: 0 };
        }

        channelBreakdown[delivery.channel].sent++;
        totalSent++;

        if (delivery.status === 'DELIVERED') {
          channelBreakdown[delivery.channel].delivered++;
          totalDelivered++;
        } else if (delivery.status === 'FAILED' || delivery.status === 'BOUNCED') {
          channelBreakdown[delivery.channel].failed++;
          totalFailed++;
        }

        if (delivery.cost) {
          channelBreakdown[delivery.channel].cost += delivery.cost;
          totalCost += delivery.cost;
        }
      }
    }

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      averageCost: totalSent > 0 ? totalCost / totalSent : 0,
      channelBreakdown,
    };
  }

  // Private methods
  private async processNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    notification.status = 'PROCESSING';
    this.notifications.set(notificationId, notification);

    // Simulate delivery for each channel
    for (const delivery of notification.deliveries) {
      await delay(500 + Math.random() * 1000); // Random delay

      // Simulate delivery success/failure
      const successRate = Math.random();
      if (successRate > 0.95) {
        delivery.status = 'FAILED';
        delivery.failedDate = new Date().toISOString();
        delivery.failureReason = 'Delivery failed';
      } else if (successRate > 0.85) {
        delivery.status = 'BOUNCED';
        delivery.failedDate = new Date().toISOString();
        delivery.failureReason = 'Invalid recipient';
      } else {
        delivery.status = 'SENT';
        delivery.sentDate = new Date().toISOString();

        // Simulate delivery confirmation
        setTimeout(() => {
          if (delivery.status === 'SENT') {
            delivery.status = 'DELIVERED';
            delivery.deliveredDate = new Date().toISOString();
            this.notifications.set(notificationId, notification);
          }
        }, 2000 + Math.random() * 3000);
      }
    }

    // Update notification status
    const allDelivered = notification.deliveries.every(d => d.status === 'DELIVERED');
    const allFailed = notification.deliveries.every(d => d.status === 'FAILED' || d.status === 'BOUNCED');
    const someFailed = notification.deliveries.some(d => d.status === 'FAILED' || d.status === 'BOUNCED');

    if (allDelivered) {
      notification.status = 'COMPLETED';
    } else if (allFailed) {
      notification.status = 'FAILED';
    } else if (someFailed) {
      notification.status = 'PARTIAL_FAILURE';
    } else {
      notification.status = 'COMPLETED'; // Assume success if not failed
    }

    notification.completedDate = new Date().toISOString();
    this.notifications.set(notificationId, notification);

    console.log('Notification API: Notification processed', { notificationId, status: notification.status });
  }

  private filterAllowedChannels(requestedChannels: NotificationRequest['channels'], preferences?: CustomerNotificationPreferences): NotificationRequest['channels'] {
    if (!preferences) return requestedChannels;

    return requestedChannels.filter(channel => {
      const channelPref = preferences.preferences[channel.toLowerCase() as keyof CustomerNotificationPreferences['preferences']];
      return channelPref?.enabled && channelPref?.transactional;
    });
  }

  private calculateDeliveryCost(channel: NotificationDelivery['channel']): number {
    const costs = {
      SMS: 0.25,
      EMAIL: 0.01,
      PUSH: 0.05,
      WHATSAPP: 0.15,
    };

    return costs[channel] || 0;
  }

  private initializeMockData() {
    // Mock notification templates
    const mockTemplates: NotificationTemplate[] = [
      {
        templateId: 'tmpl_card_activation',
        name: 'Card Activation Success',
        type: 'CARD_ACTIVATION',
        channels: ['SMS', 'EMAIL', 'PUSH'],
        content: {
          sms: 'Your {{cardType}} card ending {{last4}} has been activated successfully. Welcome to zero FX markup transactions!',
          email: {
            subject: 'Your FX Debit Card is Now Active!',
            htmlBody: '<h1>Welcome!</h1><p>Your {{cardType}} card ending {{last4}} has been activated successfully.</p>',
            textBody: 'Welcome! Your {{cardType}} card ending {{last4}} has been activated successfully.',
          },
          push: {
            title: 'Card Activated!',
            body: 'Your {{cardType}} card ending {{last4}} is now active',
          },
        },
        variables: ['cardType', 'last4', 'customerName'],
        isActive: true,
        createdDate: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-01T00:00:00Z',
      },
      {
        templateId: 'tmpl_transaction_alert',
        name: 'Transaction Alert',
        type: 'TRANSACTION_ALERT',
        channels: ['SMS', 'PUSH'],
        content: {
          sms: 'Transaction of ₹{{amount}} at {{merchant}} on {{cardType}} ending {{last4}}. Available balance: ₹{{balance}}',
          push: {
            title: 'Transaction Alert',
            body: '₹{{amount}} spent at {{merchant}}',
          },
        },
        variables: ['amount', 'merchant', 'cardType', 'last4', 'balance'],
        isActive: true,
        createdDate: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-01T00:00:00Z',
      },
      {
        templateId: 'tmpl_fx_rate_update',
        name: 'FX Rate Update',
        type: 'FX_RATE_UPDATE',
        channels: ['PUSH', 'WHATSAPP'],
        content: {
          push: {
            title: 'FX Rate Update',
            body: 'USD/INR: {{rate}}. Zero markup on your FX Debit Card!',
          },
          whatsapp: '💱 FX Rate Update: USD/INR is now {{rate}}. Enjoy zero markup on international transactions with your FX Debit Card!',
        },
        variables: ['rate', 'change'],
        isActive: true,
        createdDate: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-01T00:00:00Z',
      },
    ];

    mockTemplates.forEach(template => {
      this.templates.set(template.templateId, template);
    });

    // Mock customer preferences
    const mockPreferences: CustomerNotificationPreferences[] = [
      {
        customerId: 'CUST_001',
        preferences: {
          sms: { enabled: true, marketing: true, transactional: true },
          email: { enabled: true, marketing: false, transactional: true, newsletters: false },
          push: { enabled: true, marketing: true, transactional: true, security: true },
          whatsapp: { enabled: true, marketing: false, transactional: true },
        },
        lastUpdated: '2024-01-15T10:30:00Z',
      },
    ];

    mockPreferences.forEach(pref => {
      this.customerPreferences.set(pref.customerId, pref);
    });
  }
}

export const notificationApiService = new NotificationApiService();
