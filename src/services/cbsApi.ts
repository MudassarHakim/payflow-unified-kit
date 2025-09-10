// CBS (Core Banking System) API Mock Service - Simulates CBS backend for address management
import { delay } from '@/utils/delay';

export interface CBSAddress {
  id: string;
  type: 'permanent' | 'current' | 'communication';
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isVerified: boolean;
  lastUpdated: string;
}

export interface CBSCustomerProfile {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  pan?: string;
  aadhaar?: string;
  addresses: CBSAddress[];
  kycStatus: 'pending' | 'verified' | 'rejected';
  accountStatus: 'active' | 'inactive' | 'suspended';
}

export interface CBSAddressUpdateRequest {
  customerId: string;
  address: Omit<CBSAddress, 'id' | 'isVerified' | 'lastUpdated'>;
}

export interface CBSCustomerSearchRequest {
  searchTerm: string;
  searchType: 'customerId' | 'phone' | 'pan' | 'aadhaar';
}

class CBSApiService {
  private customers: Map<string, CBSCustomerProfile> = new Map();

  constructor() {
    // Initialize with some mock customer data
    this.initializeMockData();
  }

  // Get customer profile with addresses
  async getCustomerProfile(customerId: string): Promise<CBSCustomerProfile | null> {
    await delay(600); // Simulate network latency

    const customer = this.customers.get(customerId);
    if (!customer) {
      return null;
    }

    return { ...customer }; // Return a copy
  }

  // Search for customer by various identifiers
  async searchCustomer(request: CBSCustomerSearchRequest): Promise<CBSCustomerProfile[]> {
    await delay(800);

    const results: CBSCustomerProfile[] = [];

    for (const customer of this.customers.values()) {
      let matches = false;

      switch (request.searchType) {
        case 'customerId':
          matches = customer.customerId.toLowerCase().includes(request.searchTerm.toLowerCase());
          break;
        case 'phone':
          matches = customer.phone.includes(request.searchTerm);
          break;
        case 'pan':
          matches = customer.pan?.toLowerCase().includes(request.searchTerm.toLowerCase()) || false;
          break;
        case 'aadhaar':
          matches = customer.aadhaar?.includes(request.searchTerm) || false;
          break;
      }

      if (matches) {
        results.push({ ...customer });
      }
    }

    return results;
  }

  // Add or update customer address
  async updateAddress(request: CBSAddressUpdateRequest): Promise<{ success: boolean; message: string; address?: CBSAddress }> {
    await delay(1000);

    const customer = this.customers.get(request.customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    // Check if address type already exists
    const existingAddressIndex = customer.addresses.findIndex(addr => addr.type === request.address.type);

    const newAddress: CBSAddress = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...request.address,
      isVerified: false, // New addresses need verification
      lastUpdated: new Date().toISOString(),
    };

    if (existingAddressIndex >= 0) {
      // Update existing address
      customer.addresses[existingAddressIndex] = newAddress;
    } else {
      // Add new address
      customer.addresses.push(newAddress);
    }

    this.customers.set(request.customerId, customer);

    console.log('CBS API: Address updated for customer', request.customerId, newAddress);
    return {
      success: true,
      message: 'Address updated successfully',
      address: newAddress
    };
  }

  // Verify customer address (admin operation)
  async verifyAddress(customerId: string, addressId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    const address = customer.addresses.find(addr => addr.id === addressId);
    if (!address) {
      return { success: false, message: 'Address not found' };
    }

    address.isVerified = true;
    address.lastUpdated = new Date().toISOString();

    this.customers.set(customerId, customer);

    console.log('CBS API: Address verified', customerId, addressId);
    return { success: true, message: 'Address verified successfully' };
  }

  // Get customer addresses only
  async getCustomerAddresses(customerId: string): Promise<CBSAddress[]> {
    await delay(400);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return [];
    }

    return customer.addresses.map(addr => ({ ...addr })); // Return copies
  }

  // Validate PIN code
  async validatePincode(pincode: string): Promise<{ valid: boolean; city?: string; state?: string; message: string }> {
    await delay(300);

    // Mock validation - in real implementation, this would check against postal database
    const validPincodes: Record<string, { city: string; state: string }> = {
      '110001': { city: 'New Delhi', state: 'Delhi' },
      '400001': { city: 'Mumbai', state: 'Maharashtra' },
      '560001': { city: 'Bangalore', state: 'Karnataka' },
      '700001': { city: 'Kolkata', state: 'West Bengal' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu' },
      '500001': { city: 'Hyderabad', state: 'Telangana' },
      '380001': { city: 'Ahmedabad', state: 'Gujarat' },
      '302001': { city: 'Jaipur', state: 'Rajasthan' },
      '411001': { city: 'Pune', state: 'Maharashtra' },
      '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
    };

    const pinData = validPincodes[pincode];
    if (pinData) {
      return {
        valid: true,
        city: pinData.city,
        state: pinData.state,
        message: 'Valid PIN code'
      };
    }

    return {
      valid: false,
      message: 'Invalid PIN code'
    };
  }

  // Update customer KYC information
  async updateKYCInfo(customerId: string, kycData: { pan?: string; aadhaar?: string }): Promise<{ success: boolean; message: string }> {
    await delay(800);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return { success: false, message: 'Customer not found' };
    }

    if (kycData.pan) {
      customer.pan = kycData.pan;
    }
    if (kycData.aadhaar) {
      customer.aadhaar = kycData.aadhaar;
    }

    // Simple PAN validation
    if (kycData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(kycData.pan)) {
      return { success: false, message: 'Invalid PAN format' };
    }

    // Simple Aadhaar validation
    if (kycData.aadhaar && !/^[0-9]{12}$/.test(kycData.aadhaar)) {
      return { success: false, message: 'Invalid Aadhaar format' };
    }

    customer.kycStatus = 'verified'; // Assume verification passes for demo
    this.customers.set(customerId, customer);

    console.log('CBS API: KYC info updated for customer', customerId);
    return { success: true, message: 'KYC information updated successfully' };
  }

  // Get customer account status
  async getAccountStatus(customerId: string): Promise<{ status: string; message: string } | null> {
    await delay(300);

    const customer = this.customers.get(customerId);
    if (!customer) {
      return null;
    }

    return {
      status: customer.accountStatus,
      message: `Account is ${customer.accountStatus}`
    };
  }

  private initializeMockData() {
    // Mock customer data
    const mockCustomers: CBSCustomerProfile[] = [
      {
        customerId: 'CUST_001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+919876543210',
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        kycStatus: 'verified',
        accountStatus: 'active',
        addresses: [
          {
            id: 'addr_perm_001',
            type: 'permanent',
            line1: '123 MG Road',
            line2: 'Near Central Mall',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            country: 'India',
            isVerified: true,
            lastUpdated: '2024-01-15T10:30:00Z',
          },
          {
            id: 'addr_curr_001',
            type: 'current',
            line1: '456 Brigade Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560025',
            country: 'India',
            isVerified: true,
            lastUpdated: '2024-01-20T14:45:00Z',
          },
        ],
      },
      {
        customerId: 'CUST_002',
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+919876543211',
        pan: 'FGHIJ5678K',
        kycStatus: 'verified',
        accountStatus: 'active',
        addresses: [
          {
            id: 'addr_perm_002',
            type: 'permanent',
            line1: '789 Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India',
            isVerified: true,
            lastUpdated: '2024-01-10T09:15:00Z',
          },
        ],
      },
    ];

    mockCustomers.forEach(customer => {
      this.customers.set(customer.customerId, customer);
    });
  }
}

export const cbsApiService = new CBSApiService();
