import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Clock,
  Shield,
  CreditCard,
  RefreshCw,
  Trash2,
  Settings,
  Lock,
  Unlock,
  DollarSign,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmationAction {
  id: string;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  icon?: React.ReactNode;
  actions: ConfirmationAction[];
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  type = 'confirm',
  icon,
  actions,
  children,
  size = 'md',
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
  className
}) => {
  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isOpen, autoCloseDelay, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-gray-600" />,
          borderColor: 'border-gray-200',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-md';
    }
  };

  const typeStyles = getTypeStyles();
  const sizeStyles = getSizeStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={cn(
        "w-full mx-4 shadow-xl",
        sizeStyles,
        typeStyles.borderColor,
        typeStyles.bgColor,
        className
      )}>
        <CardHeader className="relative">
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <div className="flex items-center space-x-3">
            {icon || typeStyles.icon}
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-1">{description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>

        {children && (
          <CardContent className="pt-0">
            {children}
          </CardContent>
        )}

        {actions.length > 0 && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || 'default'}
                    onClick={action.onClick}
                    disabled={action.disabled || action.loading}
                    className="flex items-center"
                  >
                    {action.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    {action.icon && !action.loading && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

// Pre-configured confirmation dialogs for common use cases
export const useConfirmationDialog = () => {
  const [dialogState, setDialogState] = React.useState<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'> | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const showDialog = (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    setDialogState(props);
    setIsOpen(true);
  };

  const hideDialog = () => {
    setIsOpen(false);
    setDialogState(null);
  };

  const Dialog = () => (
    dialogState ? (
      <ConfirmationDialog
        {...dialogState}
        isOpen={isOpen}
        onClose={hideDialog}
      />
    ) : null
  );

  return { showDialog, hideDialog, Dialog };
};

// Specific confirmation dialog hooks for common scenarios
export const useDeleteConfirmation = () => {
  const { showDialog, hideDialog, Dialog } = useConfirmationDialog();

  const showDeleteDialog = (onConfirm: () => void, itemName: string = 'item') => {
    showDialog({
      title: 'Confirm Deletion',
      description: `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
      type: 'error',
      icon: <Trash2 className="w-6 h-6" />,
      actions: [
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'outline',
          onClick: hideDialog
        },
        {
          id: 'delete',
          label: 'Delete',
          variant: 'destructive',
          onClick: () => {
            onConfirm();
            hideDialog();
          }
        }
      ]
    });
  };

  return { showDeleteDialog, Dialog };
};

export const useBlockCardConfirmation = () => {
  const { showDialog, hideDialog, Dialog } = useConfirmationDialog();

  const showBlockDialog = (onConfirm: () => void, isPermanent: boolean = false) => {
    showDialog({
      title: isPermanent ? 'Permanently Block Card' : 'Temporarily Block Card',
      description: isPermanent
        ? 'This will permanently disable your card. This action cannot be reversed.'
        : 'This will temporarily disable your card. You can unblock it anytime.',
      type: isPermanent ? 'error' : 'warning',
      icon: isPermanent ? <Lock className="w-6 h-6" /> : <Shield className="w-6 h-6" />,
      actions: [
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'outline',
          onClick: hideDialog
        },
        {
          id: 'block',
          label: isPermanent ? 'Block Permanently' : 'Block Temporarily',
          variant: isPermanent ? 'destructive' : 'default',
          onClick: () => {
            onConfirm();
            hideDialog();
          }
        }
      ]
    });
  };

  return { showBlockDialog, Dialog };
};

export const useSuccessConfirmation = () => {
  const { showDialog, hideDialog, Dialog } = useConfirmationDialog();

  const showSuccessDialog = (title: string, description?: string, onClose?: () => void) => {
    showDialog({
      title,
      description,
      type: 'success',
      icon: <CheckCircle className="w-6 h-6" />,
      actions: [
        {
          id: 'close',
          label: 'Close',
          onClick: () => {
            hideDialog();
            onClose?.();
          }
        }
      ],
      autoClose: true,
      autoCloseDelay: 3000
    });
  };

  return { showSuccessDialog, Dialog };
};

export const usePaymentConfirmation = () => {
  const { showDialog, hideDialog, Dialog } = useConfirmationDialog();

  const showPaymentDialog = (
    amount: number,
    description: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showDialog({
      title: 'Confirm Payment',
      description: `You are about to pay ₹${amount.toLocaleString()}`,
      type: 'info',
      icon: <DollarSign className="w-6 h-6" />,
      children: (
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Payment Details</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please ensure you have sufficient balance before proceeding.
            </AlertDescription>
          </Alert>
        </div>
      ),
      actions: [
        {
          id: 'cancel',
          label: 'Cancel',
          variant: 'outline',
          onClick: () => {
            hideDialog();
            onCancel?.();
          }
        },
        {
          id: 'pay',
          label: 'Confirm Payment',
          onClick: () => {
            onConfirm();
            hideDialog();
          }
        }
      ]
    });
  };

  return { showPaymentDialog, Dialog };
};

export default ConfirmationDialog;
