import React, { useState, ReactNode } from 'react';
import { QuickCheckoutContext, QuickCheckoutItem } from '@/hooks/useQuickCheckout';

export const QuickCheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quickCheckoutItem, setQuickCheckoutItemState] = useState<QuickCheckoutItem | null>(() => {
    try {
      const saved = sessionStorage.getItem('quickCheckoutItem');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const setQuickCheckoutItem = (item: QuickCheckoutItem | null) => {
    setQuickCheckoutItemState(item);
    if (item) {
      sessionStorage.setItem('quickCheckoutItem', JSON.stringify(item));
    } else {
      sessionStorage.removeItem('quickCheckoutItem');
    }
  };

  const clearQuickCheckout = () => {
    setQuickCheckoutItemState(null);
    sessionStorage.removeItem('quickCheckoutItem');
  };

  return (
    <QuickCheckoutContext.Provider value={{ quickCheckoutItem, setQuickCheckoutItem, clearQuickCheckout }}>
      {children}
    </QuickCheckoutContext.Provider>
  );
};
