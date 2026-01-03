import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';
import { PendingOrderData } from '@/services/pending-orders';
import { formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface OrderRecoveryModalProps {
  order: PendingOrderData | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderRecoveryModal: React.FC<OrderRecoveryModalProps> = ({ order, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!order) return null;

  const handleViewOrder = () => {
    onClose();
    navigate('/order-success', { state: { orderNumber: order.orderNumber } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-center">Payment Successful!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Your payment was processed successfully while you were away.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">Order #{order.orderNumber}</span>
            </div>
            <p className="text-sm text-gray-600">Total: {formatPrice(order.total)}</p>
            <p className="text-sm text-gray-600">Items: {order.items.length}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleViewOrder} className="flex-1">
              View Order Details
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderRecoveryModal;