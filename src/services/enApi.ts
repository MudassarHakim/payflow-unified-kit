// EN Stack API Mock Service - Simulates EN (Card Management System) backend
import { delay } from '@/utils/delay';

export interface ENCardIssuanceRequest {
  customerId: string;
  customerName: string;
  panLast4?: string;
  programCode: 'MPD' | 'MWD'; // MPD: Regular Debit, MWD: FX Debit
  cardType: 'physical' | 'digital';
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface ENCardResponse {
  cardId: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  status: 'issued' | 'activated' | 'blocked' | 'cancelled';
  programCode: string;
  tokenId?: string;
  pinSet: boolean;
  internationalEnabled: boolean;
  domesticEnabled: boolean;
  transactionLimits: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };
}

export interface ENCardActivationRequest {
  cardId: string;
  pin: string;
}

export interface ENCardManagementRequest {
  cardId: string;
  action: 'activate' | 'deactivate' | 'block' | 'unblock' | 'cancel';
  reason?: string;
}

export interface ENPinManagementRequest {
  cardId: string;
  oldPin?: string;
  newPin: string;
}

export interface ENLimitUpdateRequest {
  cardId: string;
  limits: {
    daily?: number;
    monthly?: number;
    perTransaction?: number;
  };
}

class ENApiService {
  private cards: Map<string, ENCardResponse> = new Map();

  // Simulate card issuance
  async issueCard(request: ENCardIssuanceRequest): Promise<ENCardResponse> {
    await delay(1500); // Simulate processing time

    const cardId = `EN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cardNumber = this.generateCardNumber(request.programCode);
    const expiryMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expiryYear = String(new Date().getFullYear() + 4);

    const card: ENCardResponse = {
      cardId,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv: String(Math.floor(Math.random() * 900) + 100),
      status: 'issued',
      programCode: request.programCode,
      pinSet: false,
      internationalEnabled: request.programCode === 'MWD', // FX Debit Card has international enabled by default
      domesticEnabled: true,
      transactionLimits: {
        daily: request.programCode === 'MWD' ? 500000 : 100000, // Higher limits for FX Debit Card
        monthly: request.programCode === 'MWD' ? 2000000 : 500000,
        perTransaction: request.programCode === 'MWD' ? 100000 : 50000,
      },
    };

    this.cards.set(cardId, card);
    console.log('EN API: Card issued', card);

    return card;
  }

  // Simulate card activation
  async activateCard(request: ENCardActivationRequest): Promise<{ success: boolean; message: string }> {
    await delay(1000);

    const card = this.cards.get(request.cardId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    if (card.status !== 'issued') {
      return { success: false, message: 'Card is not in issued state' };
    }

    card.status = 'activated';
    card.pinSet = true;
    this.cards.set(request.cardId, card);

    console.log('EN API: Card activated', request.cardId);
    return { success: true, message: 'Card activated successfully' };
  }

  // Simulate card management operations
  async manageCard(request: ENCardManagementRequest): Promise<{ success: boolean; message: string }> {
    await delay(800);

    const card = this.cards.get(request.cardId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    switch (request.action) {
      case 'activate':
        if (card.status === 'issued') {
          card.status = 'activated';
          this.cards.set(request.cardId, card);
          return { success: true, message: 'Card activated successfully' };
        }
        break;

      case 'deactivate':
        if (card.status === 'activated') {
          card.status = 'issued';
          this.cards.set(request.cardId, card);
          return { success: true, message: 'Card deactivated successfully' };
        }
        break;

      case 'block':
        card.status = 'blocked';
        this.cards.set(request.cardId, card);
        return { success: true, message: 'Card blocked successfully' };

      case 'unblock':
        if (card.status === 'blocked') {
          card.status = 'activated';
          this.cards.set(request.cardId, card);
          return { success: true, message: 'Card unblocked successfully' };
        }
        break;

      case 'cancel':
        card.status = 'cancelled';
        this.cards.set(request.cardId, card);
        return { success: true, message: 'Card cancelled successfully' };
    }

    return { success: false, message: `Cannot perform ${request.action} on card in ${card.status} state` };
  }

  // Simulate PIN management
  async updatePin(request: ENPinManagementRequest): Promise<{ success: boolean; message: string }> {
    await delay(600);

    const card = this.cards.get(request.cardId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    if (card.status !== 'activated') {
      return { success: false, message: 'Card must be activated to change PIN' };
    }

    card.pinSet = true;
    this.cards.set(request.cardId, card);

    console.log('EN API: PIN updated for card', request.cardId);
    return { success: true, message: 'PIN updated successfully' };
  }

  // Simulate transaction limit updates
  async updateLimits(request: ENLimitUpdateRequest): Promise<{ success: boolean; message: string }> {
    await delay(500);

    const card = this.cards.get(request.cardId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    if (request.limits.daily !== undefined) {
      card.transactionLimits.daily = request.limits.daily;
    }
    if (request.limits.monthly !== undefined) {
      card.transactionLimits.monthly = request.limits.monthly;
    }
    if (request.limits.perTransaction !== undefined) {
      card.transactionLimits.perTransaction = request.limits.perTransaction;
    }

    this.cards.set(request.cardId, card);

    console.log('EN API: Limits updated for card', request.cardId, card.transactionLimits);
    return { success: true, message: 'Transaction limits updated successfully' };
  }

  // Get card details
  async getCard(cardId: string): Promise<ENCardResponse | null> {
    await delay(300);
    return this.cards.get(cardId) || null;
  }

  // Get all cards for a customer
  async getCustomerCards(customerId: string): Promise<ENCardResponse[]> {
    await delay(400);
    return Array.from(this.cards.values()).filter(card =>
      card.cardId.includes(customerId) // Simple mock filtering
    );
  }

  // Helper method to generate card number based on program code
  private generateCardNumber(programCode: string): string {
    const bin = programCode === 'MWD' ? '529145' : '529144'; // Different BINs for different programs
    const randomDigits = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    return `${bin}${randomDigits}`;
  }

  // Simulate international/domestic control updates
  async updateCardControls(cardId: string, controls: { internationalEnabled?: boolean; domesticEnabled?: boolean }): Promise<{ success: boolean; message: string }> {
    await delay(400);

    const card = this.cards.get(cardId);
    if (!card) {
      return { success: false, message: 'Card not found' };
    }

    if (controls.internationalEnabled !== undefined) {
      card.internationalEnabled = controls.internationalEnabled;
    }
    if (controls.domesticEnabled !== undefined) {
      card.domesticEnabled = controls.domesticEnabled;
    }

    this.cards.set(cardId, card);

    console.log('EN API: Card controls updated', cardId, { internationalEnabled: card.internationalEnabled, domesticEnabled: card.domesticEnabled });
    return { success: true, message: 'Card controls updated successfully' };
  }
}

export const enApiService = new ENApiService();
