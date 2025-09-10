import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Download,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Clock,
  Star,
  Gift,
  Smartphone,
  Home,
  Calendar,
  Copy,
  Share2,
  RefreshCw,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrderItem {
  id: string;
  name: string;
  type: 'card' | 'insurance' | 'addon';
  price: number;
  quantity: number;
  description?: string;
  estimatedDelivery?: string;
}

export interface OrderDetails {
  orderId: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  orderDate: string;
  deliveryAddress: {
    name: string;
    address: string;
    phone: string;
    pincode: string;
  };
  trackingNumber?: string;
  estimatedDelivery: string;
}

interface OrderSuccessScreenProps {
  orderDetails: OrderDetails;
  onDownloadReceipt: () => void;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
  onShareOrder?: () => void;
  className?: string;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  orderDetails,
  onDownloadReceipt,
  onTrackOrder,
  onContinueShopping,
  onShareOrder,
  className
}) => {
  const [copiedText, setCopiedText] = useState('');
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  useEffect(() => {
    // Simulate delivery progress
    const timer = setInterval(() => {
      setDeliveryProgress(prev => {
        if (prev >= 25) return prev; // Stop at 25% (Order Placed)
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const getItemIcon = (type: OrderItem['type']) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5 text-primary" />;
      case 'insurance':
        return <Shield className="w-5 h-5 text-primary" />;
      case 'addon':
        return <Star className="w-5 h-5 text-primary" />;
      default:
        return <Gift className="w-5 h-5 text-primary" />;
    }
  };

  const deliverySteps = [
    { label: 'Order Placed', completed: true, date: orderDetails.orderDate },
    { label: 'Processing', completed: false, date: 'In Progress' },
    { label: 'Shipped', completed: false, date: 'Pending' },
    { label: 'Delivered', completed: false, date: orderDetails.estimatedDelivery },
  ];

  return (
    <div className={cn("max-w-4xl mx-auto space-y-6", className)}>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="text-muted-foreground">Order ID:</span>
          <code className="bg-muted px-2 py-1 rounded font-mono">
            {orderDetails.orderId}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(orderDetails.orderId, 'Order ID')}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''} in your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderDetails.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {getItemIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                    {item.estimatedDelivery && (
                      <p className="text-xs text-muted-foreground">
                        Est. delivery: {item.estimatedDelivery}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₹{orderDetails.totalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Delivery Tracking
              </CardTitle>
              <CardDescription>
                Track your order from placement to delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {deliverySteps.map((step, index) => (
                  <div key={step.label} className="flex items-center space-x-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      step.completed
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    )}>
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        step.completed ? "text-green-800" : "text-gray-600"
                      )}>
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Progress value={deliveryProgress} className="w-full" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-semibold">{orderDetails.estimatedDelivery}</span>
              </div>

              {orderDetails.trackingNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tracking Number</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {orderDetails.trackingNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(orderDetails.trackingNumber!, 'Tracking Number')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{orderDetails.customerName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{orderDetails.customerEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{orderDetails.customerPhone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{orderDetails.deliveryAddress.name}</p>
                <p className="text-sm text-muted-foreground">
                  {orderDetails.deliveryAddress.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  PIN: {orderDetails.deliveryAddress.pincode}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {orderDetails.deliveryAddress.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <div className="flex items-center space-x-1">
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {orderDetails.transactionId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(orderDetails.transactionId, 'Transaction ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span>{new Date(orderDetails.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onDownloadReceipt} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={onTrackOrder} className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              Track Order
            </Button>
            {onShareOrder && (
              <Button variant="outline" onClick={onShareOrder} className="flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share Order
              </Button>
            )}
            <Button variant="outline" onClick={onContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-center">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Email Confirmation</p>
              <p className="text-xs text-muted-foreground">
                Check your email for order details and receipt
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Card Delivery</p>
              <p className="text-xs text-muted-foreground">
                Your card will be delivered to your address
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Activation</p>
              <p className="text-xs text-muted-foreground">
                Follow SMS instructions to activate your card
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Start Using</p>
              <p className="text-xs text-muted-foreground">
                Enjoy zero FX markup on international transactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm font-bold">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Keep your order ID safe for future reference</li>
                <li>• Cards are delivered via registered post with tracking</li>
                <li>• Someone above 18 years must be present to receive the card</li>
                <li>• For any queries, contact our customer support</li>
                <li>• Your card will be active once you complete the activation process</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copy Success Message */}
      {copiedText && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
          {copiedText} copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default OrderSuccessScreen;
