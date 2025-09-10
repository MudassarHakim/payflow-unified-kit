// Vendor Tracking API Mock Service - Simulates vendor/distribution partner tracking system
import { delay } from '@/utils/delay';

export interface Vendor {
  vendorId: string;
  name: string;
  type: 'BANK_BRANCH' | 'PARTNER_BANK' | 'DIGITAL_PARTNER' | 'CORPORATE_CLIENT' | 'RETAIL_OUTLET';
  location: {
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactDetails: {
    email: string;
    phone: string;
    managerName: string;
  };
  capabilities: {
    cardIssuance: boolean;
    cardActivation: boolean;
    customerSupport: boolean;
    physicalCards: boolean;
    digitalCards: boolean;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  registrationDate: string;
  lastActivityDate: string;
}

export interface CardDistribution {
  distributionId: string;
  vendorId: string;
  customerId: string;
  cardId: string;
  cardType: 'REGULAR_DEBIT' | 'FX_DEBIT';
  distributionDate: string;
  distributionChannel: 'ONLINE' | 'BRANCH' | 'PARTNER' | 'CORPORATE';
  distributionLocation?: string;
  activationStatus: 'PENDING' | 'ACTIVATED' | 'FAILED';
  activationDate?: string;
  metadata?: Record<string, any>;
}

export interface VendorPerformanceMetrics {
  vendorId: string;
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    cardsDistributed: number;
    cardsActivated: number;
    activationRate: number;
    customerSatisfaction: number;
    averageProcessingTime: number; // in minutes
    revenueGenerated: number;
    targetAchievement: number; // percentage
  };
  rankings: {
    overall: number;
    byVolume: number;
    byActivationRate: number;
    bySatisfaction: number;
  };
}

export interface VendorInventory {
  vendorId: string;
  inventory: {
    regularDebitCards: {
      allocated: number;
      distributed: number;
      available: number;
    };
    fxDebitCards: {
      allocated: number;
      distributed: number;
      available: number;
    };
  };
  lastUpdated: string;
}

export interface DistributionRequest {
  vendorId: string;
  customerId: string;
  cardType: 'REGULAR_DEBIT' | 'FX_DEBIT';
  quantity: number;
  distributionChannel: 'ONLINE' | 'BRANCH' | 'PARTNER' | 'CORPORATE';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  specialInstructions?: string;
}

export interface DistributionResponse {
  requestId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  estimatedFulfillmentDate: string;
  trackingId?: string;
  rejectionReason?: string;
}

class VendorTrackingApiService {
  private vendors: Map<string, Vendor> = new Map();
  private distributions: Map<string, CardDistribution> = new Map();
  private inventories: Map<string, VendorInventory> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Get all vendors
  async getVendors(filters?: {
    type?: Vendor['type'];
    status?: Vendor['status'];
    city?: string;
    state?: string;
  }): Promise<Vendor[]> {
    await delay(500);

    let vendors = Array.from(this.vendors.values());

    if (filters) {
      vendors = vendors.filter(vendor => {
        if (filters.type && vendor.type !== filters.type) return false;
        if (filters.status && vendor.status !== filters.status) return false;
        if (filters.city && vendor.location.city !== filters.city) return false;
        if (filters.state && vendor.location.state !== filters.state) return false;
        return true;
      });
    }

    return vendors;
  }

  // Get vendor details
  async getVendor(vendorId: string): Promise<Vendor | null> {
    await delay(300);
    return this.vendors.get(vendorId) || null;
  }

  // Register new vendor
  async registerVendor(vendorData: Omit<Vendor, 'vendorId' | 'registrationDate' | 'lastActivityDate'>): Promise<Vendor> {
    await delay(1000);

    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const vendor: Vendor = {
      vendorId,
      ...vendorData,
      registrationDate: new Date().toISOString(),
      lastActivityDate: new Date().toISOString(),
    };

    this.vendors.set(vendorId, vendor);

    // Initialize inventory
    const inventory: VendorInventory = {
      vendorId,
      inventory: {
        regularDebitCards: { allocated: 1000, distributed: 0, available: 1000 },
        fxDebitCards: { allocated: 500, distributed: 0, available: 500 },
      },
      lastUpdated: new Date().toISOString(),
    };

    this.inventories.set(vendorId, inventory);

    console.log('Vendor Tracking API: Vendor registered', vendor);
    return vendor;
  }

  // Update vendor status
  async updateVendorStatus(vendorId: string, status: Vendor['status'], reason?: string): Promise<{ success: boolean; message: string }> {
    await delay(600);

    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      return { success: false, message: 'Vendor not found' };
    }

    vendor.status = status;
    vendor.lastActivityDate = new Date().toISOString();
    this.vendors.set(vendorId, vendor);

    console.log('Vendor Tracking API: Vendor status updated', { vendorId, status, reason });
    return { success: true, message: `Vendor status updated to ${status}` };
  }

  // Request card distribution
  async requestDistribution(request: DistributionRequest): Promise<DistributionResponse> {
    await delay(800);

    const vendor = this.vendors.get(request.vendorId);
    if (!vendor) {
      return {
        requestId: `req_${Date.now()}`,
        status: 'REJECTED',
        estimatedFulfillmentDate: '',
        rejectionReason: 'Vendor not found',
      };
    }

    if (vendor.status !== 'ACTIVE') {
      return {
        requestId: `req_${Date.now()}`,
        status: 'REJECTED',
        estimatedFulfillmentDate: '',
        rejectionReason: 'Vendor is not active',
      };
    }

    const inventory = this.inventories.get(request.vendorId);
    if (!inventory) {
      return {
        requestId: `req_${Date.now()}`,
        status: 'REJECTED',
        estimatedFulfillmentDate: '',
        rejectionReason: 'Vendor inventory not found',
      };
    }

    // Check inventory availability
    const cardType = request.cardType === 'FX_DEBIT' ? 'fxDebitCards' : 'regularDebitCards';
    if (inventory.inventory[cardType].available < request.quantity) {
      return {
        requestId: `req_${Date.now()}`,
        status: 'REJECTED',
        estimatedFulfillmentDate: '',
        rejectionReason: 'Insufficient inventory',
      };
    }

    // Calculate fulfillment date based on priority
    const fulfillmentDays = request.priority === 'URGENT' ? 1 : request.priority === 'HIGH' ? 2 : 3;
    const fulfillmentDate = new Date();
    fulfillmentDate.setDate(fulfillmentDate.getDate() + fulfillmentDays);

    const response: DistributionResponse = {
      requestId: `req_${Date.now()}`,
      status: 'APPROVED',
      estimatedFulfillmentDate: fulfillmentDate.toISOString(),
      trackingId: `track_${Date.now()}`,
    };

    console.log('Vendor Tracking API: Distribution request approved', response);
    return response;
  }

  // Record card distribution
  async recordDistribution(distribution: Omit<CardDistribution, 'distributionId'>): Promise<CardDistribution> {
    await delay(600);

    const distributionId = `dist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const distributionRecord: CardDistribution = {
      distributionId,
      ...distribution,
    };

    this.distributions.set(distributionId, distributionRecord);

    // Update inventory
    const inventory = this.inventories.get(distribution.vendorId);
    if (inventory) {
      const cardType = distribution.cardType === 'FX_DEBIT' ? 'fxDebitCards' : 'regularDebitCards';
      inventory.inventory[cardType].distributed += 1;
      inventory.inventory[cardType].available -= 1;
      inventory.lastUpdated = new Date().toISOString();
      this.inventories.set(distribution.vendorId, inventory);
    }

    // Update vendor last activity
    const vendor = this.vendors.get(distribution.vendorId);
    if (vendor) {
      vendor.lastActivityDate = new Date().toISOString();
      this.vendors.set(distribution.vendorId, vendor);
    }

    console.log('Vendor Tracking API: Distribution recorded', distributionRecord);
    return distributionRecord;
  }

  // Get vendor distributions
  async getVendorDistributions(vendorId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    cardType?: CardDistribution['cardType'];
    activationStatus?: CardDistribution['activationStatus'];
  }): Promise<CardDistribution[]> {
    await delay(500);

    let distributions = Array.from(this.distributions.values()).filter(
      dist => dist.vendorId === vendorId
    );

    if (filters) {
      distributions = distributions.filter(dist => {
        if (filters.dateFrom && new Date(dist.distributionDate) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo && new Date(dist.distributionDate) > new Date(filters.dateTo)) return false;
        if (filters.cardType && dist.cardType !== filters.cardType) return false;
        if (filters.activationStatus && dist.activationStatus !== filters.activationStatus) return false;
        return true;
      });
    }

    return distributions.sort((a, b) =>
      new Date(b.distributionDate).getTime() - new Date(a.distributionDate).getTime()
    );
  }

  // Get vendor performance metrics
  async getVendorPerformance(vendorId: string, period?: { startDate: string; endDate: string }): Promise<VendorPerformanceMetrics> {
    await delay(800);

    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const defaultPeriod = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      endDate: new Date().toISOString(),
    };

    const metricsPeriod = period || defaultPeriod;

    // Calculate metrics based on distributions
    const vendorDistributions = await this.getVendorDistributions(vendorId, {
      dateFrom: metricsPeriod.startDate,
      dateTo: metricsPeriod.endDate,
    });

    const totalDistributed = vendorDistributions.length;
    const activated = vendorDistributions.filter(d => d.activationStatus === 'ACTIVATED').length;
    const activationRate = totalDistributed > 0 ? (activated / totalDistributed) * 100 : 0;

    // Mock other metrics
    const performance: VendorPerformanceMetrics = {
      vendorId,
      period: metricsPeriod,
      metrics: {
        cardsDistributed: totalDistributed,
        cardsActivated: activated,
        activationRate,
        customerSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100
        averageProcessingTime: Math.floor(Math.random() * 30) + 15, // 15-45 minutes
        revenueGenerated: totalDistributed * (vendorDistributions.some(d => d.cardType === 'FX_DEBIT') ? 500 : 100),
        targetAchievement: Math.floor(Math.random() * 30) + 70, // 70-100%
      },
      rankings: {
        overall: Math.floor(Math.random() * 50) + 1,
        byVolume: Math.floor(Math.random() * 50) + 1,
        byActivationRate: Math.floor(Math.random() * 50) + 1,
        bySatisfaction: Math.floor(Math.random() * 50) + 1,
      },
    };

    return performance;
  }

  // Get vendor inventory
  async getVendorInventory(vendorId: string): Promise<VendorInventory | null> {
    await delay(300);
    return this.inventories.get(vendorId) || null;
  }

  // Update vendor inventory
  async updateVendorInventory(vendorId: string, updates: Partial<VendorInventory['inventory']>): Promise<{ success: boolean; message: string }> {
    await delay(500);

    const inventory = this.inventories.get(vendorId);
    if (!inventory) {
      return { success: false, message: 'Vendor inventory not found' };
    }

    if (updates.regularDebitCards) {
      if (updates.regularDebitCards.allocated !== undefined) {
        inventory.inventory.regularDebitCards.allocated = updates.regularDebitCards.allocated;
        inventory.inventory.regularDebitCards.available =
          updates.regularDebitCards.allocated - inventory.inventory.regularDebitCards.distributed;
      }
    }

    if (updates.fxDebitCards) {
      if (updates.fxDebitCards.allocated !== undefined) {
        inventory.inventory.fxDebitCards.allocated = updates.fxDebitCards.allocated;
        inventory.inventory.fxDebitCards.available =
          updates.fxDebitCards.allocated - inventory.inventory.fxDebitCards.distributed;
      }
    }

    inventory.lastUpdated = new Date().toISOString();
    this.inventories.set(vendorId, inventory);

    console.log('Vendor Tracking API: Inventory updated', { vendorId, updates });
    return { success: true, message: 'Inventory updated successfully' };
  }

  // Get nearby vendors
  async getNearbyVendors(latitude: number, longitude: number, radiusKm: number = 50): Promise<Vendor[]> {
    await delay(600);

    // Mock distance calculation
    const vendors = Array.from(this.vendors.values()).filter(vendor => {
      if (!vendor.location.coordinates) return false;

      // Simple distance calculation (not accurate for production)
      const distance = Math.sqrt(
        Math.pow(vendor.location.coordinates.latitude - latitude, 2) +
        Math.pow(vendor.location.coordinates.longitude - longitude, 2)
      ) * 111; // Rough conversion to km

      return distance <= radiusKm && vendor.status === 'ACTIVE';
    });

    return vendors;
  }

  private initializeMockData() {
    // Mock vendors
    const mockVendors: Vendor[] = [
      {
        vendorId: 'vendor_001',
        name: 'Mumbai Central Branch',
        type: 'BANK_BRANCH',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          coordinates: { latitude: 19.0760, longitude: 72.8777 },
        },
        contactDetails: {
          email: 'mumbai.branch@mockbank.com',
          phone: '+91-22-12345678',
          managerName: 'Rajesh Kumar',
        },
        capabilities: {
          cardIssuance: true,
          cardActivation: true,
          customerSupport: true,
          physicalCards: true,
          digitalCards: true,
        },
        status: 'ACTIVE',
        registrationDate: '2023-01-15T00:00:00Z',
        lastActivityDate: '2024-01-20T10:30:00Z',
      },
      {
        vendorId: 'vendor_002',
        name: 'Delhi Connaught Partner',
        type: 'PARTNER_BANK',
        location: {
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          coordinates: { latitude: 28.6139, longitude: 77.2090 },
        },
        contactDetails: {
          email: 'delhi.partner@mockbank.com',
          phone: '+91-11-98765432',
          managerName: 'Priya Sharma',
        },
        capabilities: {
          cardIssuance: true,
          cardActivation: true,
          customerSupport: true,
          physicalCards: true,
          digitalCards: false,
        },
        status: 'ACTIVE',
        registrationDate: '2023-02-20T00:00:00Z',
        lastActivityDate: '2024-01-19T14:45:00Z',
      },
      {
        vendorId: 'vendor_003',
        name: 'TechCorp Corporate Outlet',
        type: 'CORPORATE_CLIENT',
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          coordinates: { latitude: 12.9716, longitude: 77.5946 },
        },
        contactDetails: {
          email: 'corporate@techcorp.com',
          phone: '+91-80-55556666',
          managerName: 'Amit Singh',
        },
        capabilities: {
          cardIssuance: true,
          cardActivation: true,
          customerSupport: false,
          physicalCards: true,
          digitalCards: true,
        },
        status: 'ACTIVE',
        registrationDate: '2023-03-10T00:00:00Z',
        lastActivityDate: '2024-01-18T09:15:00Z',
      },
    ];

    mockVendors.forEach(vendor => {
      this.vendors.set(vendor.vendorId, vendor);

      // Initialize inventory for each vendor
      const inventory: VendorInventory = {
        vendorId: vendor.vendorId,
        inventory: {
          regularDebitCards: {
            allocated: 1000,
            distributed: Math.floor(Math.random() * 200),
            available: 0, // Will be calculated
          },
          fxDebitCards: {
            allocated: 500,
            distributed: Math.floor(Math.random() * 100),
            available: 0, // Will be calculated
          },
        },
        lastUpdated: new Date().toISOString(),
      };

      // Calculate available
      inventory.inventory.regularDebitCards.available =
        inventory.inventory.regularDebitCards.allocated - inventory.inventory.regularDebitCards.distributed;
      inventory.inventory.fxDebitCards.available =
        inventory.inventory.fxDebitCards.allocated - inventory.inventory.fxDebitCards.distributed;

      this.inventories.set(vendor.vendorId, inventory);
    });
  }
}

export const vendorTrackingApiService = new VendorTrackingApiService();
