import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PendingOrderData } from '@/services/pending-orders';
import { usePendingOrders } from '@/hooks/usePendingOrders';

interface PendingOrdersManagerProps {
  userEmail?: string;
}

const PendingOrdersManager: React.FC<PendingOrdersManagerProps> = ({ userEmail }) => {
  const { pendingOrders, loading, error, cancelOrder, processOrder, completeOrder } = usePendingOrders(userEmail);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessOrder = async (orderNumber: string) => {
    await processOrder(orderNumber);
  };

  const handleCompleteOrder = async (orderNumber: string) => {
    await completeOrder(orderNumber);
  };

  const handleCancelOrder = async (orderNumber: string) => {
    await cancelOrder(orderNumber, 'Cancelled by admin');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading pending orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-2" />
            <p>Error loading pending orders: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending orders found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Orders Management</h2>
      
      {pendingOrders.map((order) => (
        <Card key={order.orderNumber} className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order #{order.orderNumber}
              </CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <p className="text-sm text-gray-600">{order.customerInfo.name}</p>
                <p className="text-sm text-gray-600">{order.customerInfo.email}</p>
                <p className="text-sm text-gray-600">{order.customerInfo.phone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Order Details</h4>
                <p className="text-sm text-gray-600">Invoice: {order.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Payment: {order.paymentMethod.toUpperCase()}</p>
                <p className="text-sm text-gray-600">Total: {formatPrice(order.total)}</p>
                <p className="text-sm text-gray-600">
                  Created: {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Items ({order.items.length})</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <span className="ml-2 font-semibold">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              <p className="text-sm text-gray-600">
                {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state} - {order.customerInfo.pincode}
              </p>
            </div>

            {order.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            {order.failureReason && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Failure Reason</h4>
                <p className="text-sm text-red-600">{order.failureReason}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {order.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleProcessOrder(order.orderNumber)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Process Order
                  </Button>
                  <Button
                    onClick={() => handleCancelOrder(order.orderNumber)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                </>
              )}
              
              {order.status === 'processing' && (
                <Button
                  onClick={() => handleCompleteOrder(order.orderNumber)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingOrdersManager;