import React from 'react';
import { useOrderRecovery } from '@/hooks/useOrderRecovery';
import { useAuth } from '@/contexts/AuthContext';
import OrderRecoveryModal from './OrderRecoveryModal';

const OrderRecoveryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { recoveredOrder, dismissRecoveredOrder } = useOrderRecovery(user?.email);

  return (
    <>
      {children}
      <OrderRecoveryModal
        order={recoveredOrder}
        isOpen={!!recoveredOrder}
        onClose={dismissRecoveredOrder}
      />
    </>
  );
};

export default OrderRecoveryWrapper;