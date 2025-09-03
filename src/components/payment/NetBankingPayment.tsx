import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePaymentSDK } from '@/contexts/PaymentSDKContext';
import { mockApiService } from '@/services/mockApi';
import { cn } from '@/lib/utils';
import { Building2, Search, CheckCircle, AlertCircle } from 'lucide-react';

interface NetBankingPaymentProps {
  className?: string;
}

interface Bank {
  code: string;
  name: string;
  available: boolean;
}

export function NetBankingPayment({ className }: NetBankingPaymentProps) {
  const { processPayment, checkoutState } = usePaymentSDK();
  const [banks, setBanks] = React.useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = React.useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadBanks();
  }, []);
  
  // Effect to handle search term changes with debounce
  React.useEffect(() => {
    if (searchTerm.length >= 3 || searchTerm === '') {
      const timeoutId = setTimeout(() => {
        loadBanks(searchTerm);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  const loadBanks = async (search?: string): Promise<void> => {
    try {
      setIsLoadingBanks(true);
      const bankList = await mockApiService.getNetBankingBanks(search);
      setBanks(bankList);
      if (search && inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // We'll use the banks directly since filtering is now done on the server side
  const popularBanks = banks.filter(bank => 
    ['HDFC', 'ICICI', 'SBI', 'AXIS'].includes(bank.code) && bank.available
  );

  const otherBanks = banks.filter(bank => 
    !['HDFC', 'ICICI', 'SBI', 'AXIS'].includes(bank.code)
  );

  const handleBankSelection = (bank: Bank): void => {
    if (bank.available) {
      setSelectedBank(bank);
    }
  };

  const handlePayment = async (): Promise<void> => {
    if (!selectedBank) return;
    
    setIsProcessing(true);
    try {
      const result = await processPayment({
        type: 'netbanking',
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
      });
      console.log('Net Banking Payment result:', result);
    } catch (error) {
      console.error('Net Banking Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const BankCard: React.FC<{ bank: Bank }> = ({ bank }) => (
    <Card
      key={bank.code}
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        bank.available
          ? selectedBank?.code === bank.code
            ? "border-primary bg-primary/5 scale-105"
            : "hover:border-primary/20 hover:scale-102"
          : "opacity-50 cursor-not-allowed border-muted"
      )}
      onClick={() => handleBankSelection(bank)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{bank.name}</p>
              <p className="text-sm text-muted-foreground">{bank.code}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!bank.available && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
            {bank.available && selectedBank?.code === bank.code && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
            {!bank.available && (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoadingBanks) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Net Banking
          </h2>
          <p className="text-muted-foreground">Loading banks...</p>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Net Banking
        </h2>
        <p className="text-muted-foreground">
          Pay using your bank's internet banking
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search for your bank..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {!searchTerm && popularBanks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Popular Banks</h3>
          <div className="grid gap-3">
            {popularBanks.map((bank) => (
              <BankCard key={bank.code} bank={bank} />
            ))}
          </div>
        </div>
      )}

      {(!searchTerm || banks.length > 0) && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {searchTerm ? 'Search Results' : 'All Banks'}
          </h3>
          <div className="grid gap-3 max-h-64 overflow-y-auto">
            {banks.map((bank) => (
              <BankCard key={bank.code} bank={bank} />
            ))}
          </div>
        </div>
      )}

      {searchTerm && banks.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No banks found matching "{searchTerm}"</p>
        </div>
      )}

      {selectedBank && (
        <div className="p-4 bg-accent/10 rounded-lg">
          <div className="flex items-center space-x-2 text-accent mb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Selected Bank</span>
          </div>
          <p className="text-sm text-foreground font-medium">{selectedBank.name}</p>
          <p className="text-xs text-muted-foreground">
            You will be redirected to {selectedBank.name}'s secure banking portal
          </p>
        </div>
      )}

      <Button
        className="w-full h-12 text-lg font-semibold"
        onClick={handlePayment}
        disabled={!selectedBank || isProcessing || checkoutState.loading}
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Redirecting...</span>
          </div>
        ) : selectedBank ? (
          `Pay with ${selectedBank.name}`
        ) : (
          'Select a Bank to Continue'
        )}
      </Button>
    </div>
  );
}