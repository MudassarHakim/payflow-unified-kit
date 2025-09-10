import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  Building,
  RefreshCw,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cbsApiService } from '@/services/cbsApi';

export interface Address {
  id: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  isPrimary: boolean;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  contactNumber?: string;
  contactName?: string;
}

// Mapping between component address types and CBS address types
const addressTypeMapping = {
  HOME: 'permanent' as const,
  OFFICE: 'communication' as const,
  OTHER: 'current' as const,
};

const reverseAddressTypeMapping = {
  permanent: 'HOME' as const,
  communication: 'OFFICE' as const,
  current: 'OTHER' as const,
};

interface AddressConfirmationProps {
  customerId: string;
  onAddressConfirmed: (address: Address) => void;
  onSkip?: () => void;
  className?: string;
}

const AddressConfirmation: React.FC<AddressConfirmationProps> = ({
  customerId,
  onAddressConfirmed,
  onSkip,
  className
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [error, setError] = useState<string>('');

  // New address form state
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'HOME',
    country: 'India',
  });

  useEffect(() => {
    fetchCustomerAddresses();
  }, [customerId]);

  const fetchCustomerAddresses = async () => {
    try {
      setIsLoading(true);
      setError('');

      const customerProfile = await cbsApiService.getCustomerProfile(customerId);

      if (customerProfile && customerProfile.addresses && customerProfile.addresses.length > 0) {
        // Map CBS addresses to component addresses
        const mappedAddresses: Address[] = customerProfile.addresses.map((cbsAddr, index) => ({
          id: cbsAddr.id,
          type: reverseAddressTypeMapping[cbsAddr.type] || 'OTHER',
          isPrimary: index === 0, // Assume first address is primary
          line1: cbsAddr.line1,
          line2: cbsAddr.line2,
          city: cbsAddr.city,
          state: cbsAddr.state,
          pincode: cbsAddr.pincode,
          country: cbsAddr.country,
        }));

        setAddresses(mappedAddresses);

        // Auto-select first address
        if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[0].id);
        }
      } else {
        // No addresses found, show new address form
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error('Failed to fetch customer addresses:', err);
      setError('Failed to load addresses. Please try again.');
      setShowNewAddressForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);
  };

  const handleNewAddressSubmit = async () => {
    if (!validateNewAddress()) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Create new address via CBS API using updateAddress method
      const cbsAddressType = addressTypeMapping[newAddress.type || 'HOME'];
      const cbsAddress = {
        type: cbsAddressType,
        line1: newAddress.line1!,
        line2: newAddress.line2,
        city: newAddress.city!,
        state: newAddress.state!,
        pincode: newAddress.pincode!,
        country: newAddress.country || 'India',
      };

      const result = await cbsApiService.updateAddress({
        customerId,
        address: cbsAddress,
      });

      if (result.success && result.address) {
        // Map CBS address back to component address
        const componentAddress: Address = {
          id: result.address.id,
          type: reverseAddressTypeMapping[result.address.type] || 'OTHER',
          isPrimary: false,
          line1: result.address.line1,
          line2: result.address.line2,
          city: result.address.city,
          state: result.address.state,
          pincode: result.address.pincode,
          country: result.address.country,
          contactName: newAddress.contactName,
          contactNumber: newAddress.contactNumber,
        };

        setAddresses(prev => [...prev, componentAddress]);
        setSelectedAddressId(componentAddress.id);
        setShowNewAddressForm(false);
        setNewAddress({ type: 'HOME', country: 'India' });
      } else {
        setError(result.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Failed to create address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateNewAddress = (): boolean => {
    if (!newAddress.line1?.trim()) {
      setError('Address line 1 is required');
      return false;
    }
    if (!newAddress.city?.trim()) {
      setError('City is required');
      return false;
    }
    if (!newAddress.state?.trim()) {
      setError('State is required');
      return false;
    }
    if (!newAddress.pincode?.trim()) {
      setError('Pincode is required');
      return false;
    }
    if (newAddress.pincode && !/^\d{6}$/.test(newAddress.pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleConfirmAddress = () => {
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (selectedAddress) {
      onAddressConfirmed(selectedAddress);
    }
  };

  const getAddressTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'HOME':
        return <Home className="w-4 h-4" />;
      case 'OFFICE':
        return <Building className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const formatAddress = (address: Address): string => {
    return [
      address.line1,
      address.line2,
      address.landmark,
      `${address.city}, ${address.state} ${address.pincode}`,
      address.country,
    ].filter(Boolean).join(', ');
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Delivery Address
        </h2>
        <p className="text-muted-foreground text-lg">
          Confirm where you'd like your FX Debit Card delivered
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Addresses */}
      {addresses.length > 0 && !showNewAddressForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Delivery Address</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewAddressForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </CardTitle>
            <CardDescription>
              Choose from your saved addresses or add a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelect}>
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <Card className={cn(
                        "p-4 transition-all",
                        selectedAddressId === address.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      )}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getAddressTypeIcon(address.type)}
                            <span className="font-medium capitalize">{address.type.toLowerCase()}</span>
                            {address.isPrimary && (
                              <Badge variant="secondary" className="text-xs">Primary</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatAddress(address)}
                        </p>
                        {address.contactName && (
                          <p className="text-sm">
                            <span className="font-medium">{address.contactName}</span>
                            {address.contactNumber && ` • ${address.contactNumber}`}
                          </p>
                        )}
                      </Card>
                    </label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* New Address Form */}
      {(showNewAddressForm || addresses.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add New Address</span>
              {addresses.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewAddressForm(false)}
                >
                  Cancel
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Enter the delivery address for your FX Debit Card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Address Type</Label>
                <RadioGroup
                  value={newAddress.type}
                  onValueChange={(value: Address['type']) =>
                    setNewAddress(prev => ({ ...prev, type: value }))
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HOME" id="home" />
                    <Label htmlFor="home" className="flex items-center space-x-1 cursor-pointer">
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OFFICE" id="office" />
                    <Label htmlFor="office" className="flex items-center space-x-1 cursor-pointer">
                      <Building className="w-4 h-4" />
                      <span>Office</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="other" />
                    <Label htmlFor="other" className="flex items-center space-x-1 cursor-pointer">
                      <MapPin className="w-4 h-4" />
                      <span>Other</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1 *</Label>
                <Input
                  id="line1"
                  placeholder="Flat/House No., Building, Street"
                  value={newAddress.line1 || ''}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2</Label>
                <Input
                  id="line2"
                  placeholder="Area, Locality"
                  value={newAddress.line2 || ''}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  placeholder="Near landmark (optional)"
                  value={newAddress.landmark || ''}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={newAddress.city || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={newAddress.state || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="6-digit pincode"
                    value={newAddress.pincode || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    maxLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newAddress.country || 'India'}
                    disabled
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Full name"
                    value={newAddress.contactName || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    placeholder="10-digit mobile number"
                    value={newAddress.contactNumber || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, contactNumber: e.target.value }))}
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleNewAddressSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Address
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {selectedAddressId && !showNewAddressForm && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {onSkip && (
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              )}
              <Button
                onClick={handleConfirmAddress}
                className="flex-1"
              >
                Confirm Address
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Delivery Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cards are delivered via registered post with tracking</li>
                    <li>• Delivery typically takes 7-10 business days</li>
                    <li>• You'll receive SMS updates on delivery status</li>
                    <li>• Someone above 18 years must be present to receive the card</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          * Address verification is mandatory for card delivery.
          Please ensure the address is accurate to avoid delivery delays.
        </p>
      </div>
    </div>
  );
};

export default AddressConfirmation;
